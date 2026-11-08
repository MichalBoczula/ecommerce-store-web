import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Pact } from '@pact-foundation/pact';
import { firstValueFrom } from 'rxjs';
import { expect, it, vi } from 'vitest';
import { CatalogProductsNotFoundError } from '../../src/app/features/mobile-phones/domain/model/catalog-products-not-found.error';
import { MobilePhonesKiotaRepository } from '../../src/app/features/mobile-phones/infrastructure/api/mobile-phones-kiota-repository';

const pactFile = 'web-products.json';
const productsPath = '/mobile-phones/by-ids';
const browserPrefix = '/backend';
const phone = {
  id: '42000000-0000-4000-8000-000000000002',
  name: 'Pact storefront phone',
  brand: 'Pact',
  camera: '48 MP',
  displayType: 'OLED',
  screenSizeInches: 6.1,
  mainPhoto: 'https://photos.example.com/phones/pact.webp',
  price: { amount: 2499.5, currency: 'PLN' },
};
const missingId = '42000000-0000-4000-8000-000000000098';
const catalogState = 'a priced catalog phone exists and another ID is absent';

async function throughBrowserPrefix(url: string, check: () => Promise<void>): Promise<void> {
  const nativeFetch = globalThis.fetch;
  const origin = new URL(url).origin;
  vi.stubGlobal('fetch', ((input, init) => {
    const target = new URL(input instanceof Request ? input.url : input, origin);
    expect(target.origin).toBe(origin);
    expect(target.pathname).toBe(`${browserPrefix}${productsPath}`);
    target.pathname = target.pathname.slice(browserPrefix.length);
    return nativeFetch(input instanceof Request ? new Request(target, input) : target, init);
  }) satisfies typeof fetch);
  try {
    await check();
  } finally {
    vi.unstubAllGlobals();
  }
}

async function verify(dir: string): Promise<Buffer> {
  const pact = new Pact({ consumer: 'web', provider: 'products', dir });
  const state = { ...phone, missingId };

  await pact.addInteraction()
    .given(catalogState, state)
    .uponReceiving('look up a priced catalog phone for the cart or favorites')
    .withRequest('POST', productsPath, request => request.jsonBody([phone.id]))
    .willRespondWith(200, response => response.jsonBody([phone]))
    .executeTest(({ url }) => throughBrowserPrefix(url, async () => {
      const products = await firstValueFrom(new MobilePhonesKiotaRepository().getByIds([phone.id]));
      expect(products).toEqual([{ ...phone, isFavorite: false }]);
    }));

  await pact.addInteraction()
    .given(catalogState, state)
    .uponReceiving('look up a batch with an existing catalog phone and a missing ID')
    .withRequest('POST', productsPath, request => request.jsonBody([phone.id, missingId]))
    .willRespondWith(404, response => {
      response.headers({ 'Content-Type': 'application/problem+json' }).jsonBody({ status: 404 });
    })
    .executeTest(({ url }) => throughBrowserPrefix(url, async () => {
      const lookup = new MobilePhonesKiotaRepository().getByIds([phone.id, missingId]);
      await expect(firstValueFrom(lookup)).rejects.toBeInstanceOf(CatalogProductsNotFoundError);
    }));

  return readFile(join(dir, pactFile));
}

it('emits a reproducible Web Products lookup Pact from the real Kiota repository', async () => {
  process.env['PACT_DO_NOT_TRACK'] = 'true';
  const root = await mkdtemp(join(tmpdir(), 'web-products-pact-'));
  try {
    const first = await verify(join(root, 'first'));
    const second = await verify(join(root, 'second'));
    expect(first.equals(second)).toBe(true);
    const document = JSON.parse(first.toString('utf8'));
    expect(document.consumer.name).toBe('web');
    expect(document.provider.name).toBe('products');
    expect(document.metadata.pactSpecification.version).toBe('4.0');
    expect(document.interactions).toHaveLength(2);

    const output = join('artifacts', 'verification', 'pact-web-products');
    await mkdir(output, { recursive: true });
    await writeFile(join(output, pactFile), first);
    const manifest = {
      schemaVersion: 1,
      consumer: 'web',
      provider: 'products',
      pactSpecification: '4.0',
      file: pactFile,
      sha256: createHash('sha256').update(first).digest('hex'),
      interactionCount: document.interactions.length,
    };
    await writeFile(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

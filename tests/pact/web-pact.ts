import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, vi } from 'vitest';

const browserPrefix = '/backend';

export async function throughBrowserPrefix(
  url: string, path: string, check: () => Promise<void>,
): Promise<void> {
  const nativeFetch = globalThis.fetch;
  const origin = new URL(url).origin;
  vi.stubGlobal('fetch', ((input, init) => {
    const target = new URL(input instanceof Request ? input.url : input, origin);
    expect(target.origin).toBe(origin);
    expect(target.pathname).toBe(`${browserPrefix}${path}`);
    target.pathname = target.pathname.slice(browserPrefix.length);
    return nativeFetch(input instanceof Request ? new Request(target, input) : target, init);
  }) satisfies typeof fetch);
  try {
    await check();
  } finally {
    vi.unstubAllGlobals();
  }
}

export async function writeReproduciblePact(
  provider: 'products' | 'users' | 'invoice', interactionCount: number, verify: (dir: string) => Promise<void>,
): Promise<void> {
  process.env['PACT_DO_NOT_TRACK'] = 'true';
  const file = `web-${provider}.json`;
  const root = await mkdtemp(join(tmpdir(), `web-${provider}-pact-`));
  try {
    const firstDirectory = join(root, 'first');
    const secondDirectory = join(root, 'second');
    await verify(firstDirectory);
    await verify(secondDirectory);
    const content = await readFile(join(firstDirectory, file));
    const second = await readFile(join(secondDirectory, file));
    expect(content.equals(second)).toBe(true);

    const document = JSON.parse(content.toString('utf8'));
    expect(document.consumer.name).toBe('web');
    expect(document.provider.name).toBe(provider);
    expect(document.metadata.pactSpecification.version).toBe('4.0');
    expect(document.interactions).toHaveLength(interactionCount);

    const output = join('artifacts', 'verification', `pact-web-${provider}`);
    await mkdir(output, { recursive: true });
    await writeFile(join(output, file), content);
    const manifest = {
      schemaVersion: 1,
      consumer: 'web',
      provider,
      pactSpecification: '4.0',
      file,
      sha256: createHash('sha256').update(content).digest('hex'),
      interactionCount,
    };
    await writeFile(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

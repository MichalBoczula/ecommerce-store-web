import { Pact } from '@pact-foundation/pact';
import { firstValueFrom } from 'rxjs';
import { expect, it } from 'vitest';
import { CatalogProductsNotFoundError } from '../../src/app/features/mobile-phones/domain/model/catalog-products-not-found.error';
import { MobilePhonesKiotaRepository } from '../../src/app/features/mobile-phones/infrastructure/api/mobile-phones-kiota-repository';
import { throughBrowserPrefix, writeReproduciblePact } from './web-pact';

const productsPath = '/mobile-phones/by-ids';
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

async function verify(dir: string): Promise<void> {
  const pact = new Pact({ consumer: 'web', provider: 'products', dir });
  const state = { ...phone, missingId };

  await pact.addInteraction()
    .given(catalogState, state)
    .uponReceiving('look up a priced catalog phone for the cart or favorites')
    .withRequest('POST', productsPath, request => request.jsonBody([phone.id]))
    .willRespondWith(200, response => response.jsonBody([phone]))
    .executeTest(({ url }) => throughBrowserPrefix(url, productsPath, async () => {
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
    .executeTest(({ url }) => throughBrowserPrefix(url, productsPath, async () => {
      const lookup = new MobilePhonesKiotaRepository().getByIds([phone.id, missingId]);
      await expect(firstValueFrom(lookup)).rejects.toBeInstanceOf(CatalogProductsNotFoundError);
    }));
}

it('emits a reproducible Web Products lookup Pact from the real Kiota repository',
  () => writeReproduciblePact('products', 2, verify));

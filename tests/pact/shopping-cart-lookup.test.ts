import { Pact } from '@pact-foundation/pact';
import { firstValueFrom } from 'rxjs';
import { expect, it } from 'vitest';
import { ShoppingCartNotFoundError } from '../../src/app/features/cart/domain/model/shopping-cart-not-found.error';
import { OrdersKiotaRepository } from '../../src/app/features/cart/infrastructure/api/orders-kiota-repository';
import { throughBrowserPrefix, writeReproduciblePact } from './web-pact';

const cart = {
  id: '44000000-0000-4000-8000-000000000001',
  clientId: '44000000-0000-4000-8000-000000000002',
  createdAt: '2026-09-29T12:00:00Z',
  updatedAt: '2026-09-29T12:05:00Z',
  lines: [
    { productId: '44000000-0000-4000-8000-000000000003', quantity: 2 },
    { productId: '44000000-0000-4000-8000-000000000004', quantity: 1 },
  ],
};
const missingClientId = '44000000-0000-4000-8000-000000000098';
const cartState = 'one populated shopping cart exists and another client has no cart';

async function verify(dir: string): Promise<void> {
  const pact = new Pact({ consumer: 'web', provider: 'invoice', dir });
  const state = { cart, missingClientId };
  const cartPath = `/shopping-carts/client/${cart.clientId}`;
  const missingPath = `/shopping-carts/client/${missingClientId}`;

  await pact.addInteraction()
    .given(cartState, state)
    .uponReceiving('load a populated shopping cart by client ID')
    .withRequest('GET', cartPath)
    .willRespondWith(200, response => response.jsonBody(cart))
    .executeTest(({ url }) => throughBrowserPrefix(url, cartPath, async () => {
      const result = await firstValueFrom(new OrdersKiotaRepository().getByClientId(cart.clientId));
      expect(result).toEqual({
        ...cart,
        createdAt: new Date(cart.createdAt),
        updatedAt: new Date(cart.updatedAt),
      });
    }));

  await pact.addInteraction()
    .given(cartState, state)
    .uponReceiving('look up a shopping cart for a client without one')
    .withRequest('GET', missingPath)
    .willRespondWith(404, response => {
      response.headers({ 'Content-Type': 'application/problem+json' }).jsonBody({ status: 404 });
    })
    .executeTest(({ url }) => throughBrowserPrefix(url, missingPath, async () => {
      const lookup = new OrdersKiotaRepository().getByClientId(missingClientId);
      await expect(firstValueFrom(lookup)).rejects.toBeInstanceOf(ShoppingCartNotFoundError);
    }));
}

it('emits a reproducible Web Invoice cart lookup Pact from the real Kiota repository',
  () => writeReproduciblePact('invoice', 2, verify));

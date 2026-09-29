import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOrdersApiClient } from './api-clients/orders/ordersApiClient';
import { createProductsApiClient } from './api-clients/products/productsApiClient';
import { createUsersApiClient } from './api-clients/users/usersApiClient';
import { createBffRequestAdapter } from './bff-request-adapter';

describe('BFF Kiota request adapter', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('sends catalog, favorites and cart requests to the frontend origin', async () => {
        const urls: string[] = [];
        const clientId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

        vi.stubGlobal('fetch', vi.fn(async (input: string) => {
            urls.push(input);
            const response = input.includes('/shopping-carts/')
                ? JSON.stringify({ id: clientId, clientId, lines: [] })
                : '[]';

            return new Response(response, {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
        }));

        await createProductsApiClient(createBffRequestAdapter()).mobilePhones.get();
        await createUsersApiClient(createBffRequestAdapter()).favorites.clients
            .byClientId(clientId).get();
        await createOrdersApiClient(createBffRequestAdapter()).shoppingCarts.client
            .byClientId(clientId).get();

        expect(urls.map(url => new URL(url, 'http://frontend.test').pathname)).toEqual([
            '/backend/mobile-phones',
            `/backend/favorites/clients/${clientId}`,
            `/backend/shopping-carts/client/${clientId}`,
        ]);
        expect(urls.every(url => url.startsWith('/backend/'))).toBe(true);
    });
});

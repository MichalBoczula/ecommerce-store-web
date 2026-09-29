import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShoppingCartNotFoundError } from '../../domain/model/shopping-cart-not-found.error';
import { OrdersKiotaRepository } from './orders-kiota-repository';

const clientId = '33333333-3333-3333-3333-333333333333';
const productId = '11111111-1111-1111-1111-111111111111';

describe('Orders Kiota repository', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('maps a missing cart to an explicit registration error without creating one', async () => {
        const urls: string[] = [];
        const fetchMock = vi.fn(async (url: string) => {
            urls.push(url);
            return new Response(
                JSON.stringify({ status: 404, title: 'Not Found' }),
                { status: 404, headers: { 'content-type': 'application/problem+json' } }
            );
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(firstValueFrom(new OrdersKiotaRepository().getByClientId(clientId)))
            .rejects.toBeInstanceOf(ShoppingCartNotFoundError);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(urls[0]).toContain(`/shopping-carts/client/${clientId}`);
    });

    it('sends only product IDs and quantities in a full-list PUT', async () => {
        let requestBody = '';
        vi.stubGlobal('fetch', vi.fn(async (_url: string, request: RequestInit) => {
            requestBody = typeof request.body === 'string'
                ? request.body
                : new TextDecoder().decode(request.body as Uint8Array);
            return new Response(JSON.stringify({ id: clientId, clientId, lines: [
                { productId, quantity: 2 },
            ] }), { status: 200, headers: { 'content-type': 'application/json' } });
        }));

        const response = await firstValueFrom(new OrdersKiotaRepository().updateCart(clientId, {
            lines: [{ productId, quantity: 2 }],
        }));

        expect(JSON.parse(requestBody)).toEqual({ lines: [{ productId, quantity: 2 }] });
        expect(response.lines).toEqual([{ productId, quantity: 2 }]);
    });
});

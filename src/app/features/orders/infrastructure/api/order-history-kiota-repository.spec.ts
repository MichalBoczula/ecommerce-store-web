import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderNotFoundError } from '../../domain/model/order-not-found.error';
import { OrderHistoryKiotaRepository } from './order-history-kiota-repository';

const clientId = '22222222-2222-2222-2222-222222222222';
const orderId = '11111111-1111-1111-1111-111111111111';
const versionId = '44444444-4444-4444-4444-444444444444';

const response = {
    id: orderId, clientId, createdAt: '2026-08-01T12:00:00Z', updatedAt: null,
    status: 'Pending', totalAmount: 190, totalCurrency: 'EUR',
    lines: [{ quantity: 2, productVersionId: versionId, lineTotalAmount: 190,
        productVersion: { id: versionId, productId: '33333333-3333-3333-3333-333333333333',
            name: 'Saved phone name', brand: 'Saved brand', priceAmount: 95, priceCurrency: 'EUR' },
    }],
};

describe('order history Kiota repository', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('creates one order with the Invoice client and maps the authoritative snapshot', async () => {
        const requests: { url: string; method: string; body: unknown }[] = [];
        vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
            requests.push({ url, method: init.method ?? '', body: init.body });
            return new Response(JSON.stringify(response),
                { status: 200, headers: { 'content-type': 'application/json' } });
        }));

        const order = await firstValueFrom(new OrderHistoryKiotaRepository().createForClient(clientId));

        expect(requests).toHaveLength(1);
        expect(requests[0].url).toBe(`/backend/orders/client/${clientId}`);
        expect(requests[0].method).toBe('POST');
        expect(requests[0].body).toBeUndefined();
        expect(order.lines[0].productVersion.priceAmount).toBe(95);
        expect(order.totalAmount).toBe(190);
    });

    it('gets the client list and detail through the BFF without catalog requests', async () => {
        const urls: string[] = [];
        vi.stubGlobal('fetch', vi.fn(async (url: string) => {
            urls.push(url);
            return new Response(JSON.stringify(url.includes('/client/') ? [response] : response),
                { status: 200, headers: { 'content-type': 'application/json' } });
        }));

        const repository = new OrderHistoryKiotaRepository();
        const orders = await firstValueFrom(repository.getByClientId(clientId));
        const order = await firstValueFrom(repository.getById(orderId));

        expect(urls).toEqual([`/backend/orders/client/${clientId}`, `/backend/orders/${orderId}`]);
        expect(orders[0].lines[0].productVersion.name).toBe('Saved phone name');
        expect(order.lines[0].lineTotalAmount).toBe(190);
        expect(order.totalAmount).toBe(190);
    });

    it('returns an empty client history and maps a missing detail to not found', async () => {
        vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('/client/')
            ? new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
            : new Response(JSON.stringify({ status: 404, title: 'Not Found' }),
                { status: 404, headers: { 'content-type': 'application/problem+json' } })));

        const repository = new OrderHistoryKiotaRepository();
        expect(await firstValueFrom(repository.getByClientId(clientId))).toEqual([]);
        await expect(firstValueFrom(repository.getById(orderId))).rejects.toBeInstanceOf(OrderNotFoundError);
    });
});

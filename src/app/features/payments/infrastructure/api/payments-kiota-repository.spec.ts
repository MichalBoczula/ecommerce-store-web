import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaymentsKiotaRepository } from './payments-kiota-repository';

const orderId = '11111111-1111-1111-1111-111111111111';
const response = {
    id: '22222222-2222-2222-2222-222222222222', order_id: orderId,
    amount_minor: 19000, currency: 'EUR', status: 'created',
    provider_session_id: null, provider_payment_id: null, failure_code: null,
    created_at: '2026-09-30T12:00:00Z', updated_at: null,
};

describe('Payments Kiota repository', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('treats a missing payment as empty and prepares through the BFF', async () => {
        const requests: { url: string; method: string }[] = [];
        vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
            requests.push({ url, method: init.method ?? '' });
            if (init.method === 'GET' && requests.length === 1) {
                return new Response(JSON.stringify({ status: 404, code: 'payment_not_found',
                    detail: 'Payment not found', title: 'Not Found', instance: url,
                    traceId: 'test', errors: [], missingProperties: [] }),
                { status: 404, headers: { 'content-type': 'application/problem+json' } });
            }
            return new Response(JSON.stringify(response),
                { status: init.method === 'POST' ? 201 : 200,
                    headers: { 'content-type': 'application/json' } });
        }));

        const repository = new PaymentsKiotaRepository();
        expect(await firstValueFrom(repository.getByOrderId(orderId))).toBeNull();
        const payment = await firstValueFrom(repository.prepare(orderId));
        expect(payment).toEqual({ id: response.id, orderId, amountMinor: 19000,
            currency: 'EUR', status: 'created' });
        expect(await firstValueFrom(repository.getByOrderId(orderId))).toEqual(payment);
        expect(requests).toEqual([
            { url: `/backend/payments/order/${orderId}`, method: 'GET' },
            { url: `/backend/payments/${orderId}/pay`, method: 'POST' },
            { url: `/backend/payments/order/${orderId}`, method: 'GET' },
        ]);
    });
});

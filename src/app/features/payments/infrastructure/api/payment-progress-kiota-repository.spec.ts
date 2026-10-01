import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderHistoryRepository } from '../../../orders/domain/interfaces/order-history-repository.port';
import { PaymentsRepository } from '../../domain/interfaces/payments-repository.port';
import { PaymentProgressKiotaRepository } from './payment-progress-kiota-repository';

const clientId = '22222222-2222-2222-2222-222222222222';
const orderId = '11111111-1111-1111-1111-111111111111';
const order = { id: orderId, clientId, status: 'Paid' };
function setup(selected = order) {
    TestBed.configureTestingModule({ providers: [PaymentProgressKiotaRepository,
        { provide: OrderHistoryRepository, useValue: { getById: () => of(selected) } },
        { provide: PaymentsRepository, useValue: { getByOrderId: () => of(null) } },
    ] });
    return TestBed.inject(PaymentProgressKiotaRepository);
}

describe('payment/order/completed-invoice reads', () => {
    afterEach(() => { vi.unstubAllGlobals(); TestBed.resetTestingModule(); });
    it('maps completed invoice metadata through BFF and omits storage locations', async () => {
        const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () => new Response(JSON.stringify({ id: clientId, orderId,
            createdAt: '2026-10-01T12:00:00Z', storageUrl: 'file:///private/invoice.pdf' }),
        { headers: { 'content-type': 'application/json' } }));
        vi.stubGlobal('fetch', fetch);
        const result = await firstValueFrom(setup().get(clientId, orderId));
        expect(fetch.mock.calls[0][0]).toBe(`/backend/invoices/by-order/${orderId}`);
        expect(result.invoice).toEqual({ id: clientId, orderId, createdAt: new Date('2026-10-01T12:00:00Z') });
        expect(result.invoice).not.toHaveProperty('storageUrl');
    });
    it('treats a pending/missing invoice as null', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ title: 'Not Found', status: 404 }),
            { status: 404, headers: { 'content-type': 'application/problem+json' } })));
        expect((await firstValueFrom(setup().get(clientId, orderId))).invoice).toBeNull();
    });
    it('rejects another customer before any invoice request', async () => {
        const fetch = vi.fn();
        vi.stubGlobal('fetch', fetch);
        await expect(firstValueFrom(setup({ ...order, clientId: 'other' }).get(clientId, orderId))).rejects.toThrow('does not belong');
        expect(fetch).not.toHaveBeenCalled();
    });
    it('rejects invoice metadata for another order', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ id: clientId, orderId: clientId,
            createdAt: '2026-10-01T12:00:00Z' }), { headers: { 'content-type': 'application/json' } })));
        await expect(firstValueFrom(setup().get(clientId, orderId))).rejects.toThrow('another order');
    });
});

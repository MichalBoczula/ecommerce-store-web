import { describe, expect, it } from 'vitest';
import { PaymentsActions } from './payments.actions';
import { paymentsFeature } from './payments.feature';

const orderA = '11111111-1111-1111-1111-111111111111';
const orderB = '22222222-2222-2222-2222-222222222222';

describe('payment state', () => {
    it('discards a response for a previously selected order', () => {
        const first = paymentsFeature.reducer(undefined, PaymentsActions.load({ orderId: orderA }));
        const current = paymentsFeature.reducer(first, PaymentsActions.load({ orderId: orderB }));
        const stale = paymentsFeature.reducer(current, PaymentsActions.prepareSuccess({
            orderId: orderA,
            payment: { id: 'payment', orderId: orderA, status: 'created', amountMinor: 100, currency: 'EUR' },
        }));
        expect(stale).toBe(current);
        expect(stale.payment).toBeNull();
        expect(stale.status).toBe('loading');
    });
    it('does not accept payment/invoice progress from a previously selected demo customer', () => {
        const original = paymentsFeature.reducer(undefined, PaymentsActions.watch({ clientId: 'customer-a', orderId: orderA }));
        const current = paymentsFeature.reducer(original, PaymentsActions.watch({ clientId: 'customer-b', orderId: orderB }));
        const stale = paymentsFeature.reducer(current, PaymentsActions.watchSuccess({ clientId: 'customer-a', orderId: orderA,
            exhausted: false, progress: { payment: null, invoice: { id: 'private-invoice', orderId: orderA, createdAt: new Date() },
                order: { id: orderA, clientId: 'customer-a', createdAt: new Date(), updatedAt: null,
                    status: 'Paid', totalAmount: 10, totalCurrency: 'PLN', lines: [] } } }));
        expect(stale).toBe(current);
        expect(stale.progress).toBeNull();
    });

});

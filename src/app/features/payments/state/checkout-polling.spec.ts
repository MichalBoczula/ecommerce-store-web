import { lastValueFrom, NEVER, of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaymentProgress } from '../domain/model/checkout';
import { PAYMENT_POLL_LIMIT, pollProgress } from './checkout-polling';

const progress: PaymentProgress = {
    order: { id: 'order', clientId: 'customer', status: 'Created', createdAt: new Date(), updatedAt: null,
        totalAmount: 10, totalCurrency: 'PLN', lines: [] },
    payment: { id: 'payment', orderId: 'order', status: 'pending', amountMinor: 1000, currency: 'PLN' }, invoice: null,
};

describe('bounded authoritative payment polling', () => {
    afterEach(() => vi.useRealTimers());
    it('pauses after the fixed read limit without claiming pending payments succeeded', async () => {
        vi.useFakeTimers();
        const read = vi.fn(() => of(progress));
        const result = lastValueFrom(pollProgress(read));
        await vi.runAllTimersAsync();
        expect(read).toHaveBeenCalledTimes(PAYMENT_POLL_LIMIT);
        expect(await result).toEqual({ progress, exhausted: true });
    });
    it('waits for Paid plus completed invoice after verified payment, then stops', async () => {
        vi.useFakeTimers();
        const succeeded = { ...progress, payment: { ...progress.payment!, status: 'succeeded' } };
        const completed = { ...succeeded, order: { ...progress.order, status: 'Paid' },
            invoice: { id: 'invoice', orderId: 'order', createdAt: new Date() } };
        const read = vi.fn().mockReturnValueOnce(of(succeeded)).mockReturnValue(of(completed));
        const result = lastValueFrom(pollProgress(read));
        await vi.runAllTimersAsync();
        expect(read).toHaveBeenCalledTimes(2);
        expect((await result).exhausted).toBe(false);
    });
    it('stops at an authoritative failed attempt so the user can retry', async () => {
        vi.useFakeTimers();
        const failed = { ...progress, payment: { ...progress.payment!, status: 'failed' } };
        const read = vi.fn(() => of(failed));
        const result = lastValueFrom(pollProgress(read));
        await vi.runAllTimersAsync();
        expect(read).toHaveBeenCalledTimes(1);
        expect((await result).progress.payment?.status).toBe('failed');
    });
    it('ends a stalled read with a recoverable timeout instead of polling forever', async () => {
        vi.useFakeTimers();
        const result = lastValueFrom(pollProgress(() => NEVER));
        const assertion = expect(result).rejects.toThrow('Timeout');
        await vi.advanceTimersByTimeAsync(16000);
        await assertion;
    });

});

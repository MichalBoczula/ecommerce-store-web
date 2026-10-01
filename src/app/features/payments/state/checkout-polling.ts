import { exhaustMap, map, Observable, take, takeWhile, timeout, timer } from 'rxjs';
import { PaymentProgress, progressComplete } from '../domain/model/checkout';

export const PAYMENT_POLL_LIMIT = 15;
export const PAYMENT_POLL_INTERVAL_MS = 2000;

export function pollProgress(read: () => Observable<PaymentProgress>): Observable<{ progress: PaymentProgress; exhausted: boolean }> {
    let count = 0;
    return timer(0, PAYMENT_POLL_INTERVAL_MS).pipe(
        exhaustMap(() => read().pipe(timeout({ first: 15000 }))),
        take(PAYMENT_POLL_LIMIT),
        map(progress => ({ progress, exhausted: ++count === PAYMENT_POLL_LIMIT && !progressComplete(progress) })),
        takeWhile(result => !progressComplete(result.progress), true)
    );
}

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, of, switchMap, takeUntil, timeout } from 'rxjs';
import { Store } from '@ngrx/store';
import { CustomerContext } from '../../../shared/application/customer-context';
import { OrderHistoryRepository } from '../../orders/domain/interfaces/order-history-repository.port';
import { CheckoutBrowser } from '../application/checkout-browser';
import { PaymentProgressRepository } from '../domain/interfaces/payment-progress-repository.port';
import { paymentsFeature } from './payments.feature';
import { pollProgress } from './checkout-polling';
import { BillingSnapshotRepository } from '../domain/interfaces/billing-snapshot-repository.port';
import { PaymentsRepository } from '../domain/interfaces/payments-repository.port';
import { PaymentsActions } from './payments.actions';

function message(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'detail' in error &&
        typeof error.detail === 'string' && error.detail) return error.detail;
    return error instanceof Error ? error.message : 'The payment request failed.';
}

@Injectable()
export class PaymentsEffects {
    private readonly actions$ = inject(Actions);
    private readonly repository = inject(PaymentsRepository);

    private readonly billing = inject(BillingSnapshotRepository);
    private readonly progress = inject(PaymentProgressRepository);
    private readonly orders = inject(OrderHistoryRepository);
    private readonly customer = inject(CustomerContext);
    private readonly browser = inject(CheckoutBrowser);
    private readonly state = inject(Store).selectSignal(paymentsFeature.selectPaymentsState);

    watch$ = createEffect(() => this.actions$.pipe(
        ofType(PaymentsActions.watch),
        switchMap(({ clientId, orderId }) => pollProgress(() => this.progress.get(clientId, orderId)).pipe(
            map(({ progress, exhausted }) => PaymentsActions.watchSuccess({ clientId, orderId, progress, exhausted })),
            takeUntil(this.actions$.pipe(ofType(PaymentsActions.checkout, PaymentsActions.stopWatching, PaymentsActions.load))),
            catchError((error: unknown) => of(PaymentsActions.watchFailure({ clientId, orderId, error: message(error) })))
        ))
    ));

    checkout$ = createEffect(() => this.actions$.pipe(
        ofType(PaymentsActions.checkout),
        exhaustMap(({ clientId, orderId }) => this.orders.getById(orderId).pipe(
            switchMap(order => {
                if (this.state().orderId !== orderId || this.state().clientId !== clientId ||
                    this.customer.clientId() !== clientId || order.clientId !== clientId ||
                    order.id !== orderId || order.status !== 'Created') throw new Error('Refresh the selected order before starting Checkout.');
                return this.billing.ensure(clientId, this.customer.externalId()).pipe(switchMap(() => {
                    if (this.state().orderId !== orderId || this.state().clientId !== clientId || this.customer.clientId() !== clientId) {
                        throw new Error('The selected customer or order changed during Checkout.');
                    }
                    return this.repository.checkout(orderId);
                }));
            }),
            mergeMap(checkout => {
                const current = this.state();
                // Navigation or a changed demo selection must not redirect a stale Checkout response.
                if (current.orderId !== orderId || current.clientId !== clientId || this.customer.clientId() !== clientId) return of();
                if (checkout.url) this.browser.redirect(clientId, orderId, checkout.url);
                const success = PaymentsActions.checkoutSuccess({ clientId, orderId, payment: checkout.payment });
                return checkout.url ? of(success) : of(success, PaymentsActions.watch({ clientId, orderId }));
            }),
            timeout({ first: 20000 }),
            catchError((error: unknown) => of(PaymentsActions.checkoutFailure({ clientId, orderId, error: message(error) })))
        ))
    ));

    load$ = createEffect(() => this.actions$.pipe(
        ofType(PaymentsActions.load),
        switchMap(({ orderId }) => this.repository.getByOrderId(orderId).pipe(
            map(payment => PaymentsActions.loadSuccess({ orderId, payment })),
            catchError((error: unknown) => of(PaymentsActions.loadFailure({ orderId, error: message(error) })))
        ))
    ));

    prepare$ = createEffect(() => this.actions$.pipe(
        ofType(PaymentsActions.prepare),
        switchMap(({ orderId }) => this.repository.prepare(orderId).pipe(
            map(payment => PaymentsActions.prepareSuccess({ orderId, payment })),
            catchError((error: unknown) => of(PaymentsActions.prepareFailure({ orderId, error: message(error) })))
        ))
    ));
}

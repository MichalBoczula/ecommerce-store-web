import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerContext } from '../../../shared/application/customer-context';
import { OrderHistoryRepository } from '../../orders/domain/interfaces/order-history-repository.port';
import { CheckoutBrowser } from '../application/checkout-browser';
import { PaymentProgressRepository } from '../domain/interfaces/payment-progress-repository.port';
import { BillingSnapshotRepository } from '../domain/interfaces/billing-snapshot-repository.port';
import { PaymentsRepository } from '../domain/interfaces/payments-repository.port';
import { Checkout } from '../domain/model/checkout';
import { PaymentsActions } from './payments.actions';
import { PaymentsEffects } from './payments.effects';

const clientId = 'customer';
const orderId = 'order';
const checkout: Checkout = { payment: { id: 'payment', orderId, status: 'pending', amountMinor: 1000, currency: 'PLN' },
    url: 'https://checkout.stripe.com/c/pay/cs_test_demo', status: 'open' };

function setup() {
    const actions = new Subject<ReturnType<typeof PaymentsActions.checkout>>();
    const response = new Subject<Checkout>();
    const repository = { checkout: vi.fn(() => response) };
    const orders = { getById: vi.fn(() => of({ id: orderId, clientId, status: 'Created' })) };
    const billing = { ensure: vi.fn(() => of(undefined)) };
    const browser = { redirect: vi.fn() };
    const customer = { clientId: signal<string | null>(clientId), externalId: () => 'external' };
    const state = { orderId, clientId };
    TestBed.configureTestingModule({ providers: [PaymentsEffects,
        { provide: Actions, useValue: actions }, { provide: Store, useValue: { selectSignal: () => () => state } },
        { provide: PaymentsRepository, useValue: repository }, { provide: OrderHistoryRepository, useValue: orders },
        { provide: CheckoutBrowser, useValue: browser }, { provide: CustomerContext, useValue: customer },
        { provide: BillingSnapshotRepository, useValue: billing },
        { provide: PaymentProgressRepository, useValue: { get: vi.fn() } },
    ] });
    const results: unknown[] = [];
    const subscription = TestBed.inject(PaymentsEffects).checkout$.subscribe(result => results.push(result));
    return { actions, response, repository, orders, billing, browser, customer, state, results, subscription };
}

describe('hosted Checkout effects', () => {
    afterEach(() => TestBed.resetTestingModule());
    it('ignores a double submission and redirects once without placing the hosted URL in store actions', () => {
        const test = setup();
        test.actions.next(PaymentsActions.checkout({ clientId, orderId }));
        test.actions.next(PaymentsActions.checkout({ clientId, orderId }));
        expect(test.repository.checkout).toHaveBeenCalledTimes(1);
        test.response.next(checkout);
        test.response.complete();
        expect(test.browser.redirect).toHaveBeenCalledExactlyOnceWith(clientId, orderId, checkout.url);
        expect(test.results).toEqual([PaymentsActions.checkoutSuccess({ clientId, orderId, payment: checkout.payment })]);
        test.subscription.unsubscribe();
    });
    it('does not redirect a response after navigation or a changed demo selection', () => {
        const test = setup();
        test.actions.next(PaymentsActions.checkout({ clientId, orderId }));
        test.state.orderId = 'another-order';
        test.customer.clientId.set('another-customer');
        test.response.next(checkout);
        test.response.complete();
        expect(test.browser.redirect).not.toHaveBeenCalled();
        expect(test.results).toEqual([]);
        test.subscription.unsubscribe();
    });
    it('checks server association before creating Checkout', () => {
        const test = setup();
        test.orders.getById.mockReturnValue(of({ id: orderId, clientId: 'other', status: 'Created' }));
        test.actions.next(PaymentsActions.checkout({ clientId, orderId }));
        expect(test.repository.checkout).not.toHaveBeenCalled();
        expect(test.results).toEqual([PaymentsActions.checkoutFailure({ clientId, orderId,
            error: 'Refresh the selected order before starting Checkout.' })]);
        test.subscription.unsubscribe();
    });
    it('starts authoritative polling when the provider has already closed the session', () => {
        const test = setup();
        test.actions.next(PaymentsActions.checkout({ clientId, orderId }));
        test.response.next({ ...checkout, url: null, status: 'complete' });
        expect(test.browser.redirect).not.toHaveBeenCalled();
        expect(test.results).toEqual([PaymentsActions.checkoutSuccess({ clientId, orderId, payment: checkout.payment }),
            PaymentsActions.watch({ clientId, orderId })]);
        test.subscription.unsubscribe();
    });
    it('surfaces a recoverable upstream error without redirecting', () => {
        const test = setup();
        test.orders.getById.mockReturnValue(throwError(() => ({ detail: 'Orders temporarily unavailable.' })));
        test.actions.next(PaymentsActions.checkout({ clientId, orderId }));
        expect(test.results).toEqual([PaymentsActions.checkoutFailure({ clientId, orderId,
            error: 'Orders temporarily unavailable.' })]);
        expect(test.browser.redirect).not.toHaveBeenCalled();
        test.subscription.unsubscribe();
    });
    it('does not request provider Checkout if billing cannot be confirmed', () => {
        const test = setup();
        test.billing.ensure.mockReturnValue(throwError(() => new Error('Billing temporarily unavailable.')));
        test.actions.next(PaymentsActions.checkout({ clientId, orderId }));
        expect(test.repository.checkout).not.toHaveBeenCalled();
        expect(test.results).toEqual([PaymentsActions.checkoutFailure({ clientId, orderId,
            error: 'Billing temporarily unavailable.' })]);
        test.subscription.unsubscribe();
    });

});

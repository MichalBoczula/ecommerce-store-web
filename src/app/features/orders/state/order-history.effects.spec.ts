import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderHistoryRepository } from '../domain/interfaces/order-history-repository.port';
import { OrderNotFoundError } from '../domain/model/order-not-found.error';
import { OrderHistoryActions } from './order-history.actions';
import { OrderHistoryEffects } from './order-history.effects';

describe('order history effects', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('reports a missing detail and still processes a subsequent list request', () => {
        const actions = new Subject<Action>();
        const repository = {
            getById: vi.fn(() => throwError(() => new OrderNotFoundError())),
            getByClientId: vi.fn(() => of([])),
        };
        TestBed.configureTestingModule({ providers: [
            OrderHistoryEffects,
            { provide: Actions, useValue: new Actions(actions) },
            { provide: OrderHistoryRepository, useValue: repository },
        ] });
        const results: Action[] = [];
        const effects = TestBed.inject(OrderHistoryEffects);
        const detailSubscription = effects.loadOrder$.subscribe(action => results.push(action));
        const listSubscription = effects.loadOrders$.subscribe(action => results.push(action));

        actions.next(OrderHistoryActions.loadOrder({ orderId: 'missing-id' }));
        actions.next(OrderHistoryActions.loadOrders({ clientId: 'client-id' }));

        expect(results).toEqual([
            OrderHistoryActions.loadOrderFailure({ error: 'This order could not be found.' }),
            OrderHistoryActions.loadOrdersSuccess({ orders: [] }),
        ]);
        detailSubscription.unsubscribe();
        listSubscription.unsubscribe();
    });
});

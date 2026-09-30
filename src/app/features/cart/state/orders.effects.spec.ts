import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrdersRepository } from '../domain/interfaces/orders-repository.port';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';
import { ShoppingCartNotFoundError } from '../domain/model/shopping-cart-not-found.error';
import { OrdersActions } from './orders.actions';
import { OrdersEffects } from './orders.effects';
import { OrderHistoryRepository } from '../../orders/domain/interfaces/order-history-repository.port';
import { Order } from '../../orders/domain/model/order';
import { OrderHistoryActions } from '../../orders/state/order-history.actions';

const clientId = '33333333-3333-3333-3333-333333333333';
const phoneId = '11111111-1111-1111-1111-111111111111';
const secondId = '22222222-2222-2222-2222-222222222222';
const order: Order = {
    id: '55555555-5555-5555-5555-555555555555', clientId, status: 'Pending',
    createdAt: new Date('2026-09-29T12:00:00Z'), updatedAt: null,
    totalAmount: 105, totalCurrency: 'PLN', lines: [{
        productVersionId: '66666666-6666-6666-6666-666666666666', quantity: 1, lineTotalAmount: 105,
        productVersion: {
            id: '66666666-6666-6666-6666-666666666666', productId: phoneId,
            name: 'Phone', brand: 'Brand', priceAmount: 105, priceCurrency: 'PLN',
        },
    }],
};

function cart(lines: ShoppingCartResponse['lines']): ShoppingCartResponse {
    return { id: '44444444-4444-4444-4444-444444444444', clientId, lines };
}

describe('cart effects', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('serializes rapid changes and builds every PUT from the latest server cart', () => {
        const actions = new Subject<Action>();
        const firstWrite = new Subject<ShoppingCartResponse>();
        let current = cart([{ productId: secondId, quantity: 2 }]);
        const repository = {
            getByClientId: vi.fn(() => of(current)),
            updateCart: vi.fn((_id: string, request: { lines: ShoppingCartResponse['lines'] }) => {
                if (repository.updateCart.mock.calls.length === 1) {
                    return firstWrite.asObservable();
                }
                current = cart(request.lines);
                return of(current);
            }),
        };

        TestBed.configureTestingModule({
            providers: [
                OrdersEffects,
                { provide: Actions, useValue: new Actions(actions) },
                { provide: OrdersRepository, useValue: repository },
                { provide: OrderHistoryRepository, useValue: { createForClient: vi.fn() } },
            ],
        });
        const results: Action[] = [];
        const subscription = TestBed.inject(OrdersEffects).cartRequests$.subscribe(action => results.push(action));

        actions.next(OrdersActions.changeCart({ clientId, mutation: { kind: 'add', productId: phoneId, quantity: 1 } }));
        actions.next(OrdersActions.changeCart({ clientId, mutation: { kind: 'add', productId: phoneId, quantity: 1 } }));

        expect(repository.updateCart).toHaveBeenCalledTimes(1);
        expect(repository.updateCart.mock.calls[0][1].lines).toEqual([
            { productId: secondId, quantity: 2 }, { productId: phoneId, quantity: 1 },
        ]);

        current = cart(repository.updateCart.mock.calls[0][1].lines);
        firstWrite.next(current);
        firstWrite.complete();

        expect(repository.getByClientId).toHaveBeenCalledTimes(2);
        expect(repository.updateCart.mock.calls[1][1].lines).toEqual([
            { productId: secondId, quantity: 2 }, { productId: phoneId, quantity: 2 },
        ]);
        expect(results.map(action => action.type)).toEqual([
            OrdersActions.changeCartSuccess.type, OrdersActions.changeCartSuccess.type,
        ]);
        subscription.unsubscribe();
    });

    it('reports an absent cart and never creates one as part of a mutation', () => {
        const actions = new Subject<Action>();
        const repository = {
            getByClientId: vi.fn(() => throwError(() => new ShoppingCartNotFoundError())),
            updateCart: vi.fn(),
        };
        TestBed.configureTestingModule({
            providers: [
                OrdersEffects,
                { provide: Actions, useValue: new Actions(actions) },
                { provide: OrdersRepository, useValue: repository },
                { provide: OrderHistoryRepository, useValue: { createForClient: vi.fn() } },
            ],
        });
        const results: Action[] = [];
        const subscription = TestBed.inject(OrdersEffects).cartRequests$.subscribe(action => results.push(action));

        actions.next(OrdersActions.changeCart({ clientId, mutation: { kind: 'add', productId: phoneId, quantity: 1 } }));

        expect(repository.updateCart).not.toHaveBeenCalled();
        expect(results).toEqual([OrdersActions.changeCartFailure({
            error: new ShoppingCartNotFoundError().message,
            missingCart: true,
        })]);
        subscription.unsubscribe();
    });

    it('reports a network failure and still processes the next queued change', () => {
        const actions = new Subject<Action>();
        const repository = {
            getByClientId: vi.fn(() => of(cart([]))),
            updateCart: vi.fn()
                .mockReturnValueOnce(throwError(() => new TypeError('Network unavailable')))
                .mockReturnValueOnce(of(cart([{ productId: phoneId, quantity: 1 }]))),
        };
        TestBed.configureTestingModule({
            providers: [
                OrdersEffects,
                { provide: Actions, useValue: new Actions(actions) },
                { provide: OrdersRepository, useValue: repository },
                { provide: OrderHistoryRepository, useValue: { createForClient: vi.fn() } },
            ],
        });
        const results: Action[] = [];
        const subscription = TestBed.inject(OrdersEffects).cartRequests$.subscribe(action => results.push(action));

        actions.next(OrdersActions.changeCart({ clientId, mutation: { kind: 'add', productId: phoneId, quantity: 1 } }));
        actions.next(OrdersActions.changeCart({ clientId, mutation: { kind: 'add', productId: phoneId, quantity: 1 } }));

        expect(repository.updateCart).toHaveBeenCalledTimes(2);
        expect(results[0]).toEqual(OrdersActions.changeCartFailure({
            error: 'Network unavailable', missingCart: false,
        }));
        expect(results[1].type).toBe(OrdersActions.changeCartSuccess.type);
        subscription.unsubscribe();
    });

    it('places one order after a queued cart write and reads the latest cart', () => {
        const actions = new Subject<Action>();
        const write = new Subject<ShoppingCartResponse>();
        let current = cart([]);
        const repository = {
            getByClientId: vi.fn(() => of(current)),
            updateCart: vi.fn(() => write.asObservable()),
        };
        const orders = { createForClient: vi.fn(() => of(order)) };
        TestBed.configureTestingModule({ providers: [
            OrdersEffects,
            { provide: Actions, useValue: new Actions(actions) },
            { provide: OrdersRepository, useValue: repository },
            { provide: OrderHistoryRepository, useValue: orders },
        ] });
        const results: Action[] = [];
        const subscription = TestBed.inject(OrdersEffects).cartRequests$.subscribe(action => results.push(action));

        actions.next(OrdersActions.changeCart({ clientId, mutation: { kind: 'add', productId: phoneId, quantity: 1 } }));
        actions.next(OrdersActions.checkout({ clientId }));
        expect(orders.createForClient).not.toHaveBeenCalled();
        current = cart([{ productId: phoneId, quantity: 1 }]);
        write.next(current);
        write.complete();

        expect(repository.getByClientId).toHaveBeenCalledTimes(2);
        expect(orders.createForClient).toHaveBeenCalledExactlyOnceWith(clientId);
        expect(results.at(-1)).toEqual(OrdersActions.checkoutSuccess({ order }));
        subscription.unsubscribe();
    });

    it('does not POST an empty cart and reports an uncertain network outcome without success', () => {
        const actions = new Subject<Action>();
        const repository = { getByClientId: vi.fn()
            .mockReturnValueOnce(of(cart([])))
            .mockReturnValueOnce(of(cart([{ productId: phoneId, quantity: 1 }]))),
            updateCart: vi.fn() };
        const orders = { createForClient: vi.fn(() => throwError(() => new TypeError('Network lost'))) };
        TestBed.configureTestingModule({ providers: [
            OrdersEffects,
            { provide: Actions, useValue: new Actions(actions) },
            { provide: OrdersRepository, useValue: repository },
            { provide: OrderHistoryRepository, useValue: orders },
        ] });
        const results: Action[] = [];
        const subscription = TestBed.inject(OrdersEffects).cartRequests$.subscribe(action => results.push(action));
        actions.next(OrdersActions.checkout({ clientId }));
        actions.next(OrdersActions.checkout({ clientId }));
        expect(orders.createForClient).toHaveBeenCalledTimes(1);
        expect(results.map(action => action.type)).toEqual([
            OrdersActions.checkoutFailure.type, OrdersActions.checkoutFailure.type,
        ]);
        expect(results[0]).toEqual(OrdersActions.checkoutFailure({
            error: 'The shopping cart is empty. Add a product before checkout.',
        }));
        expect(results[1]).toEqual(OrdersActions.checkoutFailure({
            error: 'Order confirmation is uncertain. Check order history and refresh the cart before trying again.',
        }));
        subscription.unsubscribe();
    });

    it('refreshes the cart and the saved order after confirmation', () => {
        const actions = new Subject<Action>();
        TestBed.configureTestingModule({ providers: [
            OrdersEffects,
            { provide: Actions, useValue: new Actions(actions) },
            { provide: OrdersRepository, useValue: { getByClientId: vi.fn(), updateCart: vi.fn() } },
            { provide: OrderHistoryRepository, useValue: { createForClient: vi.fn() } },
        ] });
        const results: Action[] = [];
        const subscription = TestBed.inject(OrdersEffects).refreshAfterCheckout$
            .subscribe(action => results.push(action));
        actions.next(OrdersActions.checkoutSuccess({ order }));
        expect(results).toEqual([
            OrdersActions.loadCart({ clientId }),
            OrderHistoryActions.loadOrder({ orderId: order.id }),
            OrderHistoryActions.loadOrders({ clientId }),
        ]);
        subscription.unsubscribe();
    });
});

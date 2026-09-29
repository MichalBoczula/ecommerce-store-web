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

const clientId = '33333333-3333-3333-3333-333333333333';
const phoneId = '11111111-1111-1111-1111-111111111111';
const secondId = '22222222-2222-2222-2222-222222222222';

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
});

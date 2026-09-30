import { TestBed } from '@angular/core/testing';
import { provideState, provideStore, Store } from '@ngrx/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrdersActions } from '../state/orders.actions';
import { cartFeature } from '../state/orders.feature';
import { OrdersFacade } from './orders.facade';

const clientId = '33333333-3333-3333-3333-333333333333';

describe('checkout command guard', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('dispatches once for an available cart and blocks a repeated submit', () => {
        TestBed.configureTestingModule({
            providers: [provideStore(), provideState(cartFeature), OrdersFacade],
        });
        const store = TestBed.inject(Store);
        const facade = TestBed.inject(OrdersFacade);
        store.dispatch(OrdersActions.loadCartSuccess({
            shoppingCartResponse: { id: clientId, clientId, lines: [
                { productId: '11111111-1111-1111-1111-111111111111', quantity: 1 },
            ] },
        }));
        const dispatch = vi.spyOn(store, 'dispatch');

        facade.checkout(clientId);
        facade.checkout(clientId);

        expect(dispatch).toHaveBeenCalledExactlyOnceWith(OrdersActions.checkout({ clientId }));
        expect(facade.checkoutStatus()).toBe('pending');
    });
});

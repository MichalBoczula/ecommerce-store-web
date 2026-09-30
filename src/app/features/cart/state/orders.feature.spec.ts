import { describe, expect, it } from 'vitest';
import { OrdersActions } from './orders.actions';
import { cartFeature } from './orders.feature';
import { Order } from '../../orders/domain/model/order';

const clientId = '33333333-3333-3333-3333-333333333333';
const productId = '11111111-1111-1111-1111-111111111111';
const cart = { id: '44444444-4444-4444-4444-444444444444', clientId, lines: [{ productId, quantity: 1 }] };

describe('cart state', () => {
    it('tracks queued writes and keeps an earlier network error visible', () => {
        let state = cartFeature.reducer(undefined, { type: '@init' });
        const action = OrdersActions.changeCart({ clientId, mutation: { kind: 'increment', productId } });
        state = cartFeature.reducer(state, action);
        state = cartFeature.reducer(state, action);
        expect(state.pendingWrites).toBe(2);
        expect(state.status).toBe('updating');

        state = cartFeature.reducer(state, OrdersActions.changeCartFailure({
            error: 'Network unavailable', missingCart: false,
        }));
        state = cartFeature.reducer(state, OrdersActions.changeCartSuccess({ shoppingCartResponse: cart }));
        expect(state.pendingWrites).toBe(0);
        expect(state.error).toBe('Network unavailable');
        expect(state.shoppingCart).toEqual(cart);
    });

    it('clears stale cart data when a GET returns a missing cart', () => {
        let state = cartFeature.reducer(undefined, OrdersActions.loadCartSuccess({ shoppingCartResponse: cart }));
        state = cartFeature.reducer(state, OrdersActions.loadCartFailure({
            error: 'Registration is incomplete.', missingCart: true,
        }));
        expect(state.status).toBe('error');
        expect(state.shoppingCart).toBeNull();
        expect(state.error).toBe('Registration is incomplete.');
    });

    it('clears the visible cart only after a confirmed order response', () => {
        let state = cartFeature.reducer(undefined, OrdersActions.loadCartSuccess({ shoppingCartResponse: cart }));
        state = cartFeature.reducer(state, OrdersActions.checkout({ clientId }));
        expect(state.shoppingCart?.lines).toHaveLength(1);
        expect(state.checkoutStatus).toBe('pending');
        state = cartFeature.reducer(state, OrdersActions.checkoutFailure({ error: 'The product is unavailable.' }));
        expect(state.shoppingCart?.lines).toHaveLength(1);
        expect(state.placedOrder).toBeNull();
        state = cartFeature.reducer(state, OrdersActions.loadCart({ clientId }));
        const order = { id: 'order-1', clientId, totalAmount: 120, totalCurrency: 'PLN' } as Order;
        state = cartFeature.reducer(state, OrdersActions.checkoutSuccess({ order }));
        expect(state.shoppingCart?.lines).toEqual([]);
        expect(state.placedOrder).toEqual(order);
        expect(state.checkoutStatus).toBe('succeeded');
    });
});

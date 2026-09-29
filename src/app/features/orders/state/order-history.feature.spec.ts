import { describe, expect, it } from 'vitest';
import { Order } from '../domain/model/order';
import { OrderHistoryActions } from './order-history.actions';
import { orderHistoryFeature } from './order-history.feature';

const order: Order = {
    id: '11111111-1111-1111-1111-111111111111',
    clientId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date('2026-08-01T12:00:00Z'),
    updatedAt: null,
    status: 'Pending',
    totalAmount: 190,
    totalCurrency: 'EUR',
    lines: [],
};

describe('order history state', () => {
    it('keeps list and detail states independent and clears stale details on navigation', () => {
        const reduce = orderHistoryFeature.reducer;
        let state = reduce(undefined, { type: '@@init' });
        state = reduce(state, OrderHistoryActions.loadOrdersSuccess({ orders: [order] }));
        state = reduce(state, OrderHistoryActions.loadOrderSuccess({ order }));
        state = reduce(state, OrderHistoryActions.loadOrder({ orderId: 'another-id' }));

        expect(state.orders).toEqual([order]);
        expect(state.selectedOrder).toBeNull();
        expect(state.detailStatus).toBe('loading');
        expect(state.listStatus).toBe('loaded');

        state = reduce(state, OrderHistoryActions.loadOrderFailure({ error: 'This order could not be found.' }));
        expect(state.selectedOrder).toBeNull();
        expect(state.detailStatus).toBe('error');
        expect(state.detailError).toContain('not be found');
    });

    it('resets old list data on a new load and handles an empty history', () => {
        const reduce = orderHistoryFeature.reducer;
        let state = reduce(undefined, OrderHistoryActions.loadOrdersSuccess({ orders: [order] }));
        state = reduce(state, OrderHistoryActions.loadOrders({ clientId: order.clientId }));
        expect(state.orders).toEqual([]);
        state = reduce(state, OrderHistoryActions.loadOrdersSuccess({ orders: [] }));
        expect(state.listStatus).toBe('loaded');
        expect(state.orders).toEqual([]);
    });
});

import { createFeature, createReducer, on } from '@ngrx/store';
import { Order } from '../domain/model/order';
import { OrderHistoryActions } from './order-history.actions';

export type OrderLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface OrderHistoryState {
    orders: Order[];
    listStatus: OrderLoadStatus;
    listError: string | null;
    selectedOrder: Order | null;
    detailStatus: OrderLoadStatus;
    detailError: string | null;
}

const initialState: OrderHistoryState = {
    orders: [],
    listStatus: 'idle',
    listError: null,
    selectedOrder: null,
    detailStatus: 'idle',
    detailError: null,
};

export const orderHistoryFeature = createFeature({
    name: 'orderHistory',
    reducer: createReducer(
        initialState,
        on(OrderHistoryActions.loadOrders, state => ({
            ...state, orders: [], listStatus: 'loading' as const, listError: null,
        })),
        on(OrderHistoryActions.loadOrdersSuccess, (state, { orders }) => ({
            ...state, orders, listStatus: 'loaded' as const, listError: null,
        })),
        on(OrderHistoryActions.loadOrdersFailure, (state, { error }) => ({
            ...state, orders: [], listStatus: 'error' as const, listError: error,
        })),
        on(OrderHistoryActions.loadOrder, state => ({
            ...state, selectedOrder: null,
            detailStatus: 'loading' as const, detailError: null,
        })),
        on(OrderHistoryActions.loadOrderSuccess, (state, { order }) => ({
            ...state, selectedOrder: order,
            detailStatus: 'loaded' as const, detailError: null,
        })),
        on(OrderHistoryActions.loadOrderFailure, (state, { error }) => ({
            ...state, selectedOrder: null, detailStatus: 'error' as const, detailError: error,
        })),
    ),
});

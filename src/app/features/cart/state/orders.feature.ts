import { createFeature, createReducer, on } from '@ngrx/store';
import { OrdersActions } from './orders.actions';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';
import { Order } from '../../orders/domain/model/order';

export type LoadStatus = 'idle' | 'loading' | 'updating' | 'loaded' | 'error';

export interface OrdersState {
    status: LoadStatus;
    error: string | null;
    shoppingCart: ShoppingCartResponse | null;
    pendingWrites: number;
    checkoutStatus: 'idle' | 'pending' | 'succeeded' | 'error';
    checkoutError: string | null;
    placedOrder: Order | null;
}

const initialState: OrdersState = {
    status: 'idle',
    error: null,
    shoppingCart: null,
    pendingWrites: 0,
    checkoutStatus: 'idle',
    checkoutError: null,
    placedOrder: null,
};

export const cartFeature = createFeature({
    name: 'cart',
    reducer: createReducer(
        initialState,

        on(OrdersActions.loadCart, state => ({
            ...state,
            status: state.pendingWrites > 0 ? 'updating' as const : 'loading' as const,
            error: null,
            checkoutStatus: state.checkoutStatus === 'error' ? 'idle' as const : state.checkoutStatus,
            checkoutError: null,
        })),

        on(OrdersActions.loadCartSuccess, (state, { shoppingCartResponse }) => ({
            ...state,
            status: state.pendingWrites > 0 ? 'updating' as const : 'loaded' as const,
            shoppingCart: shoppingCartResponse,
            error: null,
        })),

        on(OrdersActions.loadCartFailure, (state, { error, missingCart }) => ({
            ...state,
            status: state.pendingWrites > 0 ? 'updating' as const : 'error' as const,
            error,
            shoppingCart: missingCart ? null : state.shoppingCart,
        })),

        on(OrdersActions.changeCart, state => ({
            ...state,
            status: 'updating' as const,
            pendingWrites: state.pendingWrites + 1,
            error: null,
            checkoutStatus: 'idle' as const,
            placedOrder: null,
        })),

        on(OrdersActions.changeCartSuccess, (state, { shoppingCartResponse }) => ({
            ...state,
            pendingWrites: Math.max(0, state.pendingWrites - 1),
            status: state.pendingWrites > 1 ? 'updating' as const : 'loaded' as const,
            shoppingCart: shoppingCartResponse,
        })),

        on(OrdersActions.changeCartFailure, (state, { error, missingCart }) => ({
            ...state,
            pendingWrites: Math.max(0, state.pendingWrites - 1),
            status: state.pendingWrites > 1 ? 'updating' as const : 'error' as const,
            error,
            shoppingCart: missingCart ? null : state.shoppingCart,
        })),
        on(OrdersActions.checkout, state => ({
            ...state, checkoutStatus: 'pending' as const, checkoutError: null, placedOrder: null,
        })),
        on(OrdersActions.checkoutSuccess, (state, { order }) => ({
            ...state,
            status: 'loaded' as const,
            shoppingCart: state.shoppingCart ? { ...state.shoppingCart, lines: [] } : null,
            checkoutStatus: 'succeeded' as const,
            checkoutError: null,
            placedOrder: order,
        })),
        on(OrdersActions.checkoutFailure, (state, { error }) => ({
            ...state, checkoutStatus: 'error' as const, checkoutError: error,
        }))
    ),
});

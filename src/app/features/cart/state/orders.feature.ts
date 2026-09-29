import { createFeature, createReducer, on } from '@ngrx/store';
import { OrdersActions } from './orders.actions';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';

export type LoadStatus = 'idle' | 'loading' | 'updating' | 'loaded' | 'error';

export interface OrdersState {
    status: LoadStatus;
    error: string | null;
    shoppingCart: ShoppingCartResponse | null;
    pendingWrites: number;
}

const initialState: OrdersState = {
    status: 'idle',
    error: null,
    shoppingCart: null,
    pendingWrites: 0,
};

export const cartFeature = createFeature({
    name: 'cart',
    reducer: createReducer(
        initialState,

        on(OrdersActions.loadCart, state => ({
            ...state,
            status: state.pendingWrites > 0 ? 'updating' as const : 'loading' as const,
            error: null,
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
        }))
    ),
});

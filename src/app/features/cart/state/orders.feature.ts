import { createFeature, createReducer, on } from '@ngrx/store';
import { OrdersActions } from './orders.actions';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface OrdersState {
    status: LoadStatus;
    error: string | null;
    shoppingCart: ShoppingCartResponse | null;
}

const initialState: OrdersState = {
    status: 'idle',
    error: null,
    shoppingCart: null,
};

export const cartFeature = createFeature({
    name: 'cart',
    reducer: createReducer(
        initialState,

        on(OrdersActions.loadCart, state => ({
            ...state,
            status: 'loading' as const,
            error: null,
        })),

        on(OrdersActions.loadCartSuccess, (state, { shoppingCartResponse }) => ({
            ...state,
            status: 'loaded' as const,
            shoppingCart: shoppingCartResponse,
            error: null,
        })),

        on(OrdersActions.loadCartFailure, (state, { error }) => ({
            ...state,
            status: 'error' as const,
            error,
        })),

        on(OrdersActions.updateCart, state => ({
            ...state,
            status: 'loading' as const,
            error: null,
        })),

        on(OrdersActions.updateCartSuccess, (state, { shoppingCartResponse }) => ({
            ...state,
            status: 'loaded' as const,
            shoppingCart: shoppingCartResponse,
            error: null,
        })),

        on(OrdersActions.updateCartFailure, (state, { error }) => ({
            ...state,
            status: 'error' as const,
            error,
        }))
    ),
});
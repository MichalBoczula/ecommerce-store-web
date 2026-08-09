import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { CartItem } from '../domain/model/cart-item.model';
import { CartActions } from './shopping-cart.actions';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface CartState {
    status: LoadStatus;
    cartItems: CartItem[];
    error: string | null;
}

const initialState: CartState = {
    status: 'idle',
    cartItems: [
        {
            id: '1',
            name: 'Nova X1 Ultra',
            price: 999,
            quantity: 1,
            imageUrl: 'https://picsum.photos/seed/nova-x1/100/100',
        },
        {
            id: '2',
            name: 'Galaxy Pixel Pro',
            price: 1199,
            quantity: 2,
            imageUrl: 'https://picsum.photos/seed/galaxy-pixel/100/100',
        },
    ],
    error: null,
};

export const cartFeature = createFeature({
    name: 'cart',
    reducer: createReducer(
        initialState,

        on(CartActions.changeQuantity, (state, { id, quantity }) => ({
            ...state,
            cartItems: state.cartItems
                .map(item => (item.id === id ? { ...item, quantity } : item))
                .filter(item => item.quantity > 0),
        })),

        on(CartActions.addToList, (state, { item }) => {
            const existingIndex = state.cartItems.findIndex(i => i.id === item.id);

            if (existingIndex > -1) {
                const updatedItems = [...state.cartItems];
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    quantity: updatedItems[existingIndex].quantity + item.quantity,
                };
                return { ...state, cartItems: updatedItems };
            }

            return { ...state, cartItems: [...state.cartItems, item] };
        }),

        on(CartActions.removeFromList, (state, { id }) => ({
            ...state,
            cartItems: state.cartItems.filter(item => item.id !== id),
        })),

        on(CartActions.cleanUp, state => ({
            ...state,
            cartItems: [],
        }))
    ),

    extraSelectors: ({ selectCartItems }) => ({
        selectTotalItems: createSelector(
            selectCartItems,
            items => items.reduce((sum, item) => sum + item.quantity, 0)
        ),
        selectGrandTotal: createSelector(
            selectCartItems,
            items => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        ),
    }),
});
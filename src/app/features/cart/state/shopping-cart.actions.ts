import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CartItem } from '../domain/model/cart-item.model';

export const CartActions = createActionGroup({
    source: 'Cart',
    events: {
        'Change Quantity': props<{ id: string; quantity: number }>(),
        'Add To List': props<{ item: CartItem }>(),
        'Remove From List': props<{ id: string }>(),
        'Clean Up': emptyProps(),
    },
});
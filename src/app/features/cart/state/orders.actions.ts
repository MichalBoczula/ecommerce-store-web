import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';

export const OrdersActions = createActionGroup({
    source: 'Cart',
    events: {
        'Load Cart': props<{ clientId: string }>(),
        'Load Cart Success': props<{ shoppingCartResponse: ShoppingCartResponse }>(),
        'Load Cart Failure': props<{ error: string }>(),
    },
});
import { createActionGroup, props } from '@ngrx/store';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';
import { UpdateShoppingCartRequest } from '../domain/model/update-shopping-cart/update-shopping-cart-request.model';

export const OrdersActions = createActionGroup({
    source: 'Cart',
    events: {
        'Load Cart': props<{ clientId: string }>(),
        'Load Cart Success': props<{ shoppingCartResponse: ShoppingCartResponse }>(),
        'Load Cart Failure': props<{ error: string }>(),

        'Update Cart': props<{ clientId: string; request: UpdateShoppingCartRequest }>(),
        'Update Cart Success': props<{ shoppingCartResponse: ShoppingCartResponse }>(),
        'Update Cart Failure': props<{ error: string }>(),
    },
});
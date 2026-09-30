import { createActionGroup, props } from '@ngrx/store';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';
import { CartMutation } from '../domain/model/cart-mutation';
import { Order } from '../../orders/domain/model/order';

export const OrdersActions = createActionGroup({
    source: 'Cart',
    events: {
        'Load Cart': props<{ clientId: string }>(),
        'Load Cart Success': props<{ shoppingCartResponse: ShoppingCartResponse }>(),
        'Load Cart Failure': props<{ error: string; missingCart: boolean }>(),

        'Change Cart': props<{ clientId: string; mutation: CartMutation }>(),
        'Change Cart Success': props<{ shoppingCartResponse: ShoppingCartResponse }>(),
        'Change Cart Failure': props<{ error: string; missingCart: boolean }>(),
        'Checkout': props<{ clientId: string }>(),
        'Checkout Success': props<{ order: Order }>(),
        'Checkout Failure': props<{ error: string }>(),
    },
});

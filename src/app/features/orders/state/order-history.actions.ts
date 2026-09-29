import { createActionGroup, props } from '@ngrx/store';
import { Order } from '../domain/model/order';

export const OrderHistoryActions = createActionGroup({
    source: 'Order History',
    events: {
        'Load Orders': props<{ clientId: string }>(),
        'Load Orders Success': props<{ orders: Order[] }>(),
        'Load Orders Failure': props<{ error: string }>(),
        'Load Order': props<{ orderId: string }>(),
        'Load Order Success': props<{ order: Order }>(),
        'Load Order Failure': props<{ error: string }>(),
    },
});

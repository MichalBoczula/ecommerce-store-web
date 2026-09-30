import { createActionGroup, props } from '@ngrx/store';
import { Payment } from '../domain/model/payment';

export const PaymentsActions = createActionGroup({
    source: 'Payments',
    events: {
        'Load': props<{ orderId: string }>(),
        'Load Success': props<{ orderId: string; payment: Payment | null }>(),
        'Load Failure': props<{ orderId: string; error: string }>(),
        'Prepare': props<{ orderId: string }>(),
        'Prepare Success': props<{ orderId: string; payment: Payment }>(),
        'Prepare Failure': props<{ orderId: string; error: string }>(),
    },
});

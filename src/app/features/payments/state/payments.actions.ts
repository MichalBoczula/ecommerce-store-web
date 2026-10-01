import { createActionGroup, props } from '@ngrx/store';
import { PaymentProgress } from '../domain/model/checkout';
import { Payment } from '../domain/model/payment';

export const PaymentsActions = createActionGroup({
    source: 'Payments',
    events: {
        'Watch': props<{ clientId: string; orderId: string }>(),
        'Watch Success': props<{ clientId: string; orderId: string; progress: PaymentProgress; exhausted: boolean }>(),
        'Watch Failure': props<{ clientId: string; orderId: string; error: string }>(),
        'Stop Watching': props<Record<string, never>>(),
        'Checkout': props<{ clientId: string; orderId: string }>(),
        'Checkout Success': props<{ clientId: string; orderId: string; payment: Payment }>(),
        'Checkout Failure': props<{ clientId: string; orderId: string; error: string }>(),
        'Load': props<{ orderId: string }>(),
        'Load Success': props<{ orderId: string; payment: Payment | null }>(),
        'Load Failure': props<{ orderId: string; error: string }>(),
        'Prepare': props<{ orderId: string }>(),
        'Prepare Success': props<{ orderId: string; payment: Payment }>(),
        'Prepare Failure': props<{ orderId: string; error: string }>(),
    },
});

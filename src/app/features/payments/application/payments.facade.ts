import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { PaymentsActions } from '../state/payments.actions';
import { paymentsFeature } from '../state/payments.feature';

@Injectable()
export class PaymentsFacade {
    private readonly store = inject(Store);

    readonly orderId = this.store.selectSignal(paymentsFeature.selectOrderId);
    readonly payment = this.store.selectSignal(paymentsFeature.selectPayment);
    readonly status = this.store.selectSignal(paymentsFeature.selectStatus);
    readonly error = this.store.selectSignal(paymentsFeature.selectError);

    load(orderId: string): void {
        this.store.dispatch(PaymentsActions.load({ orderId }));
    }

    prepare(orderId: string): void {
        this.store.dispatch(PaymentsActions.prepare({ orderId }));
    }
}

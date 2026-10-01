import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { PaymentsActions } from '../state/payments.actions';
import { paymentsFeature } from '../state/payments.feature';

@Injectable()
export class PaymentsFacade {
    private readonly store = inject(Store);

    readonly progress = this.store.selectSignal(paymentsFeature.selectProgress);
    readonly clientId = this.store.selectSignal(paymentsFeature.selectClientId);
    readonly exhausted = this.store.selectSignal(paymentsFeature.selectExhausted);

    watch(clientId: string, orderId: string): void {
        this.store.dispatch(PaymentsActions.watch({ clientId, orderId }));
    }

    checkout(clientId: string, orderId: string): void {
        this.store.dispatch(PaymentsActions.checkout({ clientId, orderId }));
    }

    stopWatching(): void {
        this.store.dispatch(PaymentsActions.stopWatching({}));
    }

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

import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { OrderHistoryActions } from '../state/order-history.actions';
import { orderHistoryFeature } from '../state/order-history.feature';

@Injectable()
export class OrderHistoryFacade {
    private readonly store = inject(Store);

    readonly orders = this.store.selectSignal(orderHistoryFeature.selectOrders);
    readonly listStatus = this.store.selectSignal(orderHistoryFeature.selectListStatus);
    readonly listError = this.store.selectSignal(orderHistoryFeature.selectListError);
    readonly selectedOrder = this.store.selectSignal(orderHistoryFeature.selectSelectedOrder);
    readonly detailStatus = this.store.selectSignal(orderHistoryFeature.selectDetailStatus);
    readonly detailError = this.store.selectSignal(orderHistoryFeature.selectDetailError);

    loadOrders(clientId: string): void {
        this.store.dispatch(OrderHistoryActions.loadOrders({ clientId }));
    }

    loadOrder(orderId: string): void {
        this.store.dispatch(OrderHistoryActions.loadOrder({ orderId }));
    }
}

import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { cartFeature } from '../state/orders.feature';
import { OrdersActions } from '../state/orders.actions';

@Injectable({ providedIn: 'root' })
export class OrdersFacade {
    private readonly store = inject(Store);

    readonly cart$ = this.store.select(cartFeature.selectShoppingCart);
    readonly status$ = this.store.select(cartFeature.selectStatus);
    readonly error$ = this.store.select(cartFeature.selectError);

    loadByClientId(clientId: string): void {
        this.store.dispatch(OrdersActions.loadCart({ clientId }));
    }
}
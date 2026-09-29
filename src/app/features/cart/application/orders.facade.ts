import { inject, Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { cartFeature } from '../state/orders.feature';
import { OrdersActions } from '../state/orders.actions';
import { ShoppingCartLineRequest } from '../domain/model/update-shopping-cart/shopping-cart-line-request.model';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrdersFacade {
    private readonly store = inject(Store);

    readonly cart$: Observable<ShoppingCartResponse | null> = this.store.select(cartFeature.selectShoppingCart);
    readonly status$: Observable<string> = this.store.select(cartFeature.selectStatus);
    readonly error$: Observable<string | null> = this.store.select(cartFeature.selectError);

    readonly shoppingCart: Signal<ShoppingCartResponse | null> = this.store.selectSignal(cartFeature.selectShoppingCart);
    readonly status: Signal<string> = this.store.selectSignal(cartFeature.selectStatus);
    readonly error: Signal<string | null> = this.store.selectSignal(cartFeature.selectError);

    loadCart(clientId: string): void {
        this.store.dispatch(OrdersActions.loadCart({ clientId }));
    }

    loadByClientId(clientId: string): void {
        this.loadCart(clientId);
    }

    addItem(clientId: string, item: ShoppingCartLineRequest): void {
        this.store.dispatch(OrdersActions.changeCart({ clientId, mutation: { kind: 'add', ...item } }));
    }

    incrementItem(clientId: string, productId: string): void {
        this.store.dispatch(OrdersActions.changeCart({ clientId, mutation: { kind: 'increment', productId } }));
    }

    decrementItem(clientId: string, productId: string): void {
        this.store.dispatch(OrdersActions.changeCart({ clientId, mutation: { kind: 'decrement', productId } }));
    }

    removeItem(clientId: string, productId: string): void {
        this.store.dispatch(OrdersActions.changeCart({ clientId, mutation: { kind: 'remove', productId } }));
    }

    clearCart(clientId: string): void {
        this.store.dispatch(OrdersActions.changeCart({ clientId, mutation: { kind: 'clear' } }));
    }
}

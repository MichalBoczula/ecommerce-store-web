import { inject, Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { cartFeature } from '../state/orders.feature';
import { OrdersActions } from '../state/orders.actions';
import { UpdateShoppingCartRequest } from '../domain/model/update-shopping-cart/update-shopping-cart-request.model';
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

    updateCart(clientId: string, request: UpdateShoppingCartRequest): void {
        this.store.dispatch(OrdersActions.updateCart({ clientId, request }));
    }

    addItem(clientId: string, item: ShoppingCartLineRequest): void {
        const currentCart = this.shoppingCart();
        const currentLines = currentCart?.lines ?? [];

        const existingIndex = currentLines.findIndex(
            (l) => l.productId?.toLowerCase() === item.productId?.toLowerCase()
        );
        let updatedLines: ShoppingCartLineRequest[];

        if (existingIndex > -1) {
            updatedLines = currentLines.map((line, idx) =>
                idx === existingIndex
                    ? {
                        productId: line.productId,
                        name: line.name,
                        brand: line.brand ?? null,
                        unitPriceAmount: line.unitPriceAmount,
                        unitPriceCurrency: line.unitPriceCurrency,
                        quantity: (line.quantity ?? 1) + (item.quantity ?? 1),
                    }
                    : {
                        productId: line.productId,
                        name: line.name,
                        brand: line.brand ?? null,
                        unitPriceAmount: line.unitPriceAmount,
                        unitPriceCurrency: line.unitPriceCurrency,
                        quantity: line.quantity ?? 1,
                    }
            );
        } else {
            updatedLines = [
                ...currentLines.map((line) => ({
                    productId: line.productId,
                    name: line.name,
                    brand: line.brand ?? null,
                    unitPriceAmount: line.unitPriceAmount,
                    unitPriceCurrency: line.unitPriceCurrency,
                    quantity: line.quantity ?? 1,
                })),
                item,
            ];
        }

        this.updateCart(clientId, { lines: updatedLines });
    }
}
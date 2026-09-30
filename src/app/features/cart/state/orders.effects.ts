import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, of, switchMap } from 'rxjs';

import { OrdersActions } from './orders.actions';
import { OrdersRepository } from '../domain/interfaces/orders-repository.port';
import { applyCartMutation } from '../domain/model/cart-mutation';
import { ShoppingCartNotFoundError } from '../domain/model/shopping-cart-not-found.error';
import { OrderHistoryRepository } from '../../orders/domain/interfaces/order-history-repository.port';
import { OrderHistoryActions } from '../../orders/state/order-history.actions';

function errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'detail' in error &&
        typeof error.detail === 'string' && error.detail) {
        return error.detail;
    }

    return error instanceof Error ? error.message : 'The shopping cart request failed.';
}

function checkoutErrorMessage(error: unknown): string {
    if (error instanceof ShoppingCartNotFoundError) return error.message;
    if (typeof error === 'object' && error !== null && 'responseStatusCode' in error) {
        if (error.responseStatusCode === 404) {
            return 'The cart or a product is unavailable. Refresh the cart before placing an order.';
        }
        if (error.responseStatusCode === 400) {
            return errorMessage(error);
        }
    }
    if (error instanceof Error && error.message.startsWith('The shopping cart is empty')) return error.message;
    return 'Order confirmation is uncertain. Check order history and refresh the cart before trying again.';
}

@Injectable()
export class OrdersEffects {
    private readonly actions$ = inject(Actions);
    private readonly cartRepository = inject(OrdersRepository);
    private readonly orderRepository = inject(OrderHistoryRepository);

    cartRequests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.loadCart, OrdersActions.changeCart, OrdersActions.checkout),
            // The server owns the full list. Read immediately before each write and
            // finish the PUT before processing the next click or navigation load.
            concatMap(action => {
                if (action.type === OrdersActions.loadCart.type) {
                    return this.cartRepository.getByClientId(action.clientId).pipe(
                        map(shoppingCartResponse => OrdersActions.loadCartSuccess({ shoppingCartResponse })),
                        catchError((error: unknown) => of(OrdersActions.loadCartFailure({
                            error: errorMessage(error),
                            missingCart: error instanceof ShoppingCartNotFoundError,
                        })))
                    );
                }

                if (action.type === OrdersActions.checkout.type) {
                    return this.cartRepository.getByClientId(action.clientId).pipe(
                        switchMap(cart => {
                            if (cart.lines.length === 0) {
                                throw new Error('The shopping cart is empty. Add a product before checkout.');
                            }
                            return this.orderRepository.createForClient(action.clientId);
                        }),
                        map(order => OrdersActions.checkoutSuccess({ order })),
                        catchError((error: unknown) => of(OrdersActions.checkoutFailure({
                            error: checkoutErrorMessage(error),
                        })))
                    );
                }

                return this.cartRepository.getByClientId(action.clientId).pipe(
                    switchMap(cart => {
                        const lines = applyCartMutation(cart.lines, action.mutation);
                        return lines === null
                            ? of(OrdersActions.changeCartSuccess({ shoppingCartResponse: cart }))
                            : this.cartRepository.updateCart(action.clientId, { lines }).pipe(
                                map(shoppingCartResponse => OrdersActions.changeCartSuccess({ shoppingCartResponse }))
                            );
                    }),
                    catchError((error: unknown) => of(OrdersActions.changeCartFailure({
                        error: errorMessage(error),
                        missingCart: error instanceof ShoppingCartNotFoundError,
                    })))
                );
            })
        )
    );

    refreshAfterCheckout$ = createEffect(() => this.actions$.pipe(
        ofType(OrdersActions.checkoutSuccess),
        mergeMap(({ order }) => of(
            OrdersActions.loadCart({ clientId: order.clientId }),
            OrderHistoryActions.loadOrder({ orderId: order.id }),
            OrderHistoryActions.loadOrders({ clientId: order.clientId })
        ))
    ));
}

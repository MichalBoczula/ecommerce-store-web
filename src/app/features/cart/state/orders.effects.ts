import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, of, switchMap } from 'rxjs';

import { OrdersActions } from './orders.actions';
import { OrdersRepository } from '../domain/interfaces/orders-repository.port';
import { applyCartMutation } from '../domain/model/cart-mutation';
import { ShoppingCartNotFoundError } from '../domain/model/shopping-cart-not-found.error';

function errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'detail' in error &&
        typeof error.detail === 'string' && error.detail) {
        return error.detail;
    }

    return error instanceof Error ? error.message : 'The shopping cart request failed.';
}

@Injectable()
export class OrdersEffects {
    private readonly actions$ = inject(Actions);
    private readonly cartRepository = inject(OrdersRepository);

    cartRequests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.loadCart, OrdersActions.changeCart),
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
}

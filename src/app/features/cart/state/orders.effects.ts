import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';

import { OrdersActions } from './orders.actions';
import { OrdersRepository } from '../domain/interfaces/orders-repository.port';

@Injectable()
export class OrdersEffects {
    private readonly actions$ = inject(Actions);
    private readonly cartRepository = inject(OrdersRepository);

    loadCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.loadCart),
            switchMap(({ clientId }) =>
                this.cartRepository.getByClientId(clientId).pipe(
                    map(shoppingCartResponse => OrdersActions.loadCartSuccess({ shoppingCartResponse })),
                    catchError(error =>
                        of(
                            OrdersActions.loadCartFailure({
                                error: error?.detail || error?.message || 'Failed to load shopping cart.',
                            })
                        )
                    )
                )
            )
        )
    );

    updateCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.updateCart),
            switchMap(({ clientId, request }) =>
                this.cartRepository.updateCart(clientId, request).pipe(
                    map(shoppingCartResponse => OrdersActions.updateCartSuccess({ shoppingCartResponse })),
                    catchError(error =>
                        of(
                            OrdersActions.updateCartFailure({
                                error: error?.detail || error?.message || 'Failed to update shopping cart.',
                            })
                        )
                    )
                )
            )
        )
    );
}
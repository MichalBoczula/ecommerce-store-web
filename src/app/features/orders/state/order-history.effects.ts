import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { OrderHistoryRepository } from '../domain/interfaces/order-history-repository.port';
import { OrderHistoryActions } from './order-history.actions';

function message(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'detail' in error &&
        typeof error.detail === 'string' && error.detail) return error.detail;
    return error instanceof Error ? error.message : 'The order request failed.';
}

@Injectable()
export class OrderHistoryEffects {
    private readonly actions$ = inject(Actions);
    private readonly repository = inject(OrderHistoryRepository);

    loadOrders$ = createEffect(() => this.actions$.pipe(
        ofType(OrderHistoryActions.loadOrders),
        switchMap(({ clientId }) => this.repository.getByClientId(clientId).pipe(
            map(orders => OrderHistoryActions.loadOrdersSuccess({ orders })),
            catchError((error: unknown) => of(OrderHistoryActions.loadOrdersFailure({ error: message(error) })))
        ))
    ));

    loadOrder$ = createEffect(() => this.actions$.pipe(
        ofType(OrderHistoryActions.loadOrder),
        switchMap(({ orderId }) => this.repository.getById(orderId).pipe(
            map(order => OrderHistoryActions.loadOrderSuccess({ order })),
            catchError((error: unknown) => of(OrderHistoryActions.loadOrderFailure({ error: message(error) })))
        ))
    ));
}

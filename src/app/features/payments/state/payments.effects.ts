import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { PaymentsRepository } from '../domain/interfaces/payments-repository.port';
import { PaymentsActions } from './payments.actions';

function message(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'detail' in error &&
        typeof error.detail === 'string' && error.detail) return error.detail;
    return error instanceof Error ? error.message : 'The payment request failed.';
}

@Injectable()
export class PaymentsEffects {
    private readonly actions$ = inject(Actions);
    private readonly repository = inject(PaymentsRepository);

    load$ = createEffect(() => this.actions$.pipe(
        ofType(PaymentsActions.load),
        switchMap(({ orderId }) => this.repository.getByOrderId(orderId).pipe(
            map(payment => PaymentsActions.loadSuccess({ orderId, payment })),
            catchError((error: unknown) => of(PaymentsActions.loadFailure({ orderId, error: message(error) })))
        ))
    ));

    prepare$ = createEffect(() => this.actions$.pipe(
        ofType(PaymentsActions.prepare),
        switchMap(({ orderId }) => this.repository.prepare(orderId).pipe(
            map(payment => PaymentsActions.prepareSuccess({ orderId, payment })),
            catchError((error: unknown) => of(PaymentsActions.prepareFailure({ orderId, error: message(error) })))
        ))
    ));
}

import { inject, Injectable } from "@angular/core";
import { CurrenciesNswagRepository } from "../infrastructure/api/currencies-nswag.repository";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";
import * as CurrenciesActions from './currencies.actions';

@Injectable()
export class CurrenciesEffects {
    private readonly actions$ = inject(Actions)
    private readonly repo = inject(CurrenciesNswagRepository)

    load$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CurrenciesActions.loadCurrencies),
            switchMap(() =>
                this.repo.getCurrencies().pipe(
                    map(items => CurrenciesActions.loadCurrenciesSuccess({ items })),
                    catchError(e => of(CurrenciesActions.loadCurrenciesFailure({ error: String(e) }))),
                )
            )
        )
    );
}
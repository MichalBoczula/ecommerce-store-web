import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import * as ActionsSet from './mobile-phones.actions';
import { MobilePhonesRepository } from '../domain/ports/mobile-phones-repository.port';

export class MobilePhonesEffects {
    private readonly actions$ = inject(Actions);
    private readonly repo = inject(MobilePhonesRepository);

    load$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ActionsSet.loadMobilePhones),
            switchMap(({ amount }) =>
                this.repo.getAll(amount).pipe(
                    map(items => ActionsSet.loadMobilePhonesSuccess({ items })),
                    catchError(e => of(ActionsSet.loadMobilePhonesFailure({ error: String(e) }))),
                )
            )
        )
    );
}
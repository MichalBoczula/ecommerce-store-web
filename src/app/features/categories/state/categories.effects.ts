import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import * as ActionsSet from './categories.actions';
import { CategoriesRepository } from '../domain/interfaces/categories-repository.port';

@Injectable()
export class CategoriesEffects {
    private readonly actions$ = inject(Actions);
    private readonly repo = inject(CategoriesRepository);

    load$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ActionsSet.loadCategories),
            switchMap(() =>
                this.repo.getAll().pipe(
                    map(items => ActionsSet.loadCategoriesSuccess({ items })),
                    catchError(e => of(ActionsSet.loadCategoriesFailure({ error: String(e) }))),
                )
            )
        )
    );
}

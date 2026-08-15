import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { FavoritesActions } from './users.actions';
import { FavoritesRepository } from '../domain/interfaces/favorites-repository.port';

@Injectable()
export class FavoritesEffects {
    private readonly actions$ = inject(Actions);
    private readonly favoritesRepository = inject(FavoritesRepository);

    addFavorite$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.addFavorite),
            switchMap(({ command }) =>
                this.favoritesRepository.addFavorite(command).pipe(
                    map((favorite) => FavoritesActions.addFavoriteSuccess({ favorite })),
                    catchError((error) =>
                        of(
                            FavoritesActions.addFavoriteFailure({
                                error: error?.detail || error?.message || 'Failed to add product to favorites.',
                            })
                        )
                    )
                )
            )
        )
    );
}
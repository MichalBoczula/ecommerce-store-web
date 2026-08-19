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

    loadFavorites$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.loadFavorites),
            switchMap(({ clientId }) =>
                this.favoritesRepository.getFavorites(clientId).pipe(
                    map((favorites) => FavoritesActions.loadFavoritesSuccess({ favorites })),
                    catchError((error) =>
                        of(
                            FavoritesActions.loadFavoritesFailure({
                                error: error?.detail || error?.message || 'Failed to load favorites.',
                            })
                        )
                    )
                )
            )
        )
    );

    removeFavorite$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.removeFavorite),
            switchMap(({ clientId, productId }) =>
                this.favoritesRepository.removeFavorite(clientId, productId).pipe(
                    map(() => FavoritesActions.removeFavoriteSuccess({ productId })),
                    catchError((error) =>
                        of(
                            FavoritesActions.removeFavoriteFailure({
                                error: error?.detail || error?.message || 'Failed to remove product from favorites.',
                            })
                        )
                    )
                )
            )
        )
    );

    clearAllFavorites$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.clearAllFavorites),
            switchMap(({ clientId }) =>
                this.favoritesRepository.clearAllFavorites(clientId).pipe(
                    map(() => FavoritesActions.clearAllFavoritesSuccess()),
                    catchError((error) =>
                        of(
                            FavoritesActions.clearAllFavoritesFailure({
                                error: error?.detail || error?.message || 'Failed to clear all favorites.',
                            })
                        )
                    )
                )
            )
        )
    );
}
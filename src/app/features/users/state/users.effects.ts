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
                    map((favorite) =>
                        FavoritesActions.addFavoriteSuccess({
                            favorite,
                            clientId: command.clientId,
                        })
                    ),
                    catchError((error) =>
                        of(
                            FavoritesActions.addFavoriteFailure({
                                error: error?.detail || error?.message || 'Failed to add favorite.',
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
                    map(() => FavoritesActions.removeFavoriteSuccess({ productId, clientId })),
                    catchError((error) =>
                        of(
                            FavoritesActions.removeFavoriteFailure({
                                error: error?.detail || error?.message || 'Failed to remove favorite.',
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
                    map(() => FavoritesActions.clearAllFavoritesSuccess({ clientId })),
                    catchError((error) =>
                        of(
                            FavoritesActions.clearAllFavoritesFailure({
                                error: error?.detail || error?.message || 'Failed to clear favorites.',
                            })
                        )
                    )
                )
            )
        )
    );

    refreshFavoritesOnSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                FavoritesActions.addFavoriteSuccess,
                FavoritesActions.removeFavoriteSuccess,
                FavoritesActions.clearAllFavoritesSuccess
            ),
            map(({ clientId }) => FavoritesActions.loadFavorites({ clientId }))
        )
    );

    loadFavorites$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.loadFavorites),
            switchMap(({ clientId }) => {
                console.log('[FavoritesEffects] Loading favorites for client:', clientId);
                return this.favoritesRepository.getFavorites(clientId).pipe(
                    map((favorites) => {
                        console.log('[FavoritesEffects] Load Success:', favorites);
                        return FavoritesActions.loadFavoritesSuccess({ favorites });
                    }),
                    catchError((error) => {
                        console.error('[FavoritesEffects] Load Failure:', error);
                        return of(
                            FavoritesActions.loadFavoritesFailure({
                                error: error?.detail || error?.message || 'Failed to load favorites.',
                            })
                        );
                    })
                );
            })
        )
    );
}
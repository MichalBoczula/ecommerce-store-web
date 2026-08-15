import { createFeature, createReducer, on } from '@ngrx/store';
import { Favorite } from '../domain/model/favorite-response.model';
import { FavoritesActions } from './users.actions';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface FavoritesState {
    status: LoadStatus;
    error: string | null;
    favorites: Favorite[];
}

const initialState: FavoritesState = {
    status: 'idle',
    error: null,
    favorites: [],
};

export const favoritesFeature = createFeature({
    name: 'favorites',
    reducer: createReducer(
        initialState,

        on(FavoritesActions.addFavorite, (state) => ({
            ...state,
            status: 'loading' as const,
            error: null,
        })),

        on(FavoritesActions.loadFavorites, (state) => ({
            ...state,
            status: 'loading' as const,
            error: null,
        })),

        on(FavoritesActions.loadFavoritesSuccess, (state, { favorites }) => ({
            ...state,
            status: 'loaded' as const,
            favorites,
            error: null,
        })),

        on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
            ...state,
            status: 'error' as const,
            error,
        }))
    ),
});
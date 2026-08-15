import { createActionGroup, props } from '@ngrx/store';
import { Favorite } from '../domain/model/favorite-response.model';
import { AddFavoriteCommand } from '../domain/model/add-favorite-command.model';

export const FavoritesActions = createActionGroup({
    source: 'Favorites',
    events: {
        'Add Favorite': props<{ command: AddFavoriteCommand }>(),
        'Add Favorite Success': props<{ favorite: Favorite }>(),
        'Add Favorite Failure': props<{ error: string }>(),
    },
});
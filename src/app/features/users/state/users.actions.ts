import { createActionGroup, props } from "@ngrx/store";
import { AddFavoriteCommand } from "../domain/model/add-favorite-command.model";
import { Favorite } from "../domain/model/favorite-response.model";

export const FavoritesActions = createActionGroup({
    source: 'Favorites',
    events: {
        'Add Favorite': props<{ command: AddFavoriteCommand }>(),
        'Add Favorite Success': props<{ favorite: Favorite; clientId: string }>(),
        'Add Favorite Failure': props<{ error: string }>(),

        'Load Favorites': props<{ clientId: string }>(),
        'Load Favorites Success': props<{ favorites: Favorite[] }>(),
        'Load Favorites Failure': props<{ error: string }>(),

        'Remove Favorite': props<{ clientId: string; productId: string }>(),
        'Remove Favorite Success': props<{ productId: string; clientId: string }>(),
        'Remove Favorite Failure': props<{ error: string }>(),

        'Clear All Favorites': props<{ clientId: string }>(),
        'Clear All Favorites Success': props<{ clientId: string }>(),
        'Clear All Favorites Failure': props<{ error: string }>(),
    },
});
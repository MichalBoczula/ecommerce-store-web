import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { favoritesFeature } from '../state/users.feature';
import { FavoritesActions } from '../state/users.actions';
import { AddFavoriteCommand } from '../domain/model/add-favorite-command.model';

@Injectable({ providedIn: 'root' })
export class UsersFacade {
    private readonly store = inject(Store);

    readonly favorites$ = this.store.select(favoritesFeature.selectFavorites);
    readonly status$ = this.store.select(favoritesFeature.selectStatus);
    readonly error$ = this.store.select(favoritesFeature.selectError);

    readonly favorites = this.store.selectSignal(favoritesFeature.selectFavorites);
    readonly status = this.store.selectSignal(favoritesFeature.selectStatus);
    readonly error = this.store.selectSignal(favoritesFeature.selectError);

    addFavorite(command: AddFavoriteCommand): void {
        this.store.dispatch(FavoritesActions.addFavorite({ command }));
    }

    addFavoriteByProductId(clientId: string, productId: string): void {
        this.store.dispatch(
            FavoritesActions.addFavorite({
                command: { clientId, productId },
            })
        );
    }

    loadFavorites(clientId: string): void {
        this.store.dispatch(FavoritesActions.loadFavorites({ clientId }));
    }

    isProductFavorite(productId: string): boolean {
        return this.favorites().some(f => f.productId === productId);
    }

    removeFavorite(clientId: string, productId: string): void {
        this.store.dispatch(FavoritesActions.removeFavorite({ clientId, productId }));
    }
}
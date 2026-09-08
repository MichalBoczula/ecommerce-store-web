import { computed, inject, Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { favoritesFeature } from '../state/users.feature';
import { FavoritesActions } from '../state/users.actions';
import { AddFavoriteCommand } from '../domain/model/add-favorite-command.model';
import { Favorite } from '../domain/model/favorite-response.model';

@Injectable({ providedIn: 'root' })
export class UsersFacade {
    private readonly store = inject(Store);

    readonly favorites$: Observable<Favorite[]> = this.store.select(favoritesFeature.selectFavorites);
    readonly status$: Observable<string> = this.store.select(favoritesFeature.selectStatus);
    readonly error$: Observable<string | null> = this.store.select(favoritesFeature.selectError);

    readonly favorites: Signal<Favorite[]> = this.store.selectSignal(favoritesFeature.selectFavorites);
    readonly status: Signal<string> = this.store.selectSignal(favoritesFeature.selectStatus);
    readonly error: Signal<string | null> = this.store.selectSignal(favoritesFeature.selectError);

    isProductFavorite(productId: string): Signal<boolean> {
        return computed(() => this.favorites().some(f => f.productId === productId));
    }

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

    removeFavorite(clientId: string, productId: string): void {
        this.store.dispatch(FavoritesActions.removeFavorite({ clientId, productId }));
    }

    clearAllFavorites(clientId: string): void {
        this.store.dispatch(FavoritesActions.clearAllFavorites({ clientId }));
    }
}
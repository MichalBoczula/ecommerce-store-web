import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { UsersFacade } from '../../application/users.facade';
import { CatalogProductsLookup, CatalogProductsState } from '../../../mobile-phones/application/catalog-products-lookup';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { FavoriteItemViewModel } from '../../domain/model/favorite-item.model';
import { toCartLineItem, toFavoriteItemViewModels } from './favorites.component.utils';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDividerModule,
    ],
    templateUrl: './favorites.component.html',
    styleUrl: './favorites.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnInit {
    private readonly usersFacade = inject(UsersFacade);
    private readonly catalogLookup = inject(CatalogProductsLookup);
    private readonly ordersFacade = inject(OrdersFacade);
    private readonly location = inject(Location);

    private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    private readonly catalogRefresh = signal(0);

    readonly displayedColumns: string[] = ['image', 'product', 'price', 'actions'];

    readonly favoritesList = this.usersFacade.favorites;
    readonly status = this.usersFacade.status;
    readonly error = this.usersFacade.error;

    readonly catalog = toSignal(this.catalogLookup.observe(
        toObservable(computed(() => this.favoritesList().map(favorite => favorite.productId))),
        toObservable(this.catalogRefresh)
    ), { initialValue: { products: [], unavailableIds: [], status: 'loading', error: null } as CatalogProductsState });

    readonly favoriteItems = computed(() =>
        toFavoriteItemViewModels(this.favoritesList(), this.catalog().products)
    );
    readonly totalItems = computed(() => this.favoritesList().length);

    ngOnInit(): void {
        this.usersFacade.loadFavorites(this.userId);
    }

    retryCatalog(): void {
        this.catalogRefresh.update(value => value + 1);
    }

    addToCart(item: FavoriteItemViewModel): void {
        if (item.unavailable) return;
        const lineItem = toCartLineItem(item);
        this.ordersFacade.addItem(this.userId, lineItem);
    }

    removeFavorite(productId: string): void {
        if (!productId) return;
        this.usersFacade.removeFavorite(this.userId, productId);
    }

    clearAllFavorites(): void {
        this.usersFacade.clearAllFavorites(this.userId);
    }

    goBack(): void {
        this.location.back();
    }
}

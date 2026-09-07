import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { UsersFacade } from '../../application/users.facade';
import { MobilePhonesFacade } from '../../../mobile-phones/application/mobile-phones.facade';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { FavoriteItemViewModel } from '../../domain/model/favorite-item.model';
import { toCartLineItem, toFavoriteItemViewModels } from './favorites.component.utils';

// [] Eliminate the hardcoded userId: Replace private readonly userId: string = '3fa85f64...' with an injected auth / user context service or an input so the component doesn't break across different user sessions.

// [] Remove toSignal boilerplate: Once MobilePhonesFacade exposes native signals(like items), drop toSignal(this.phonesFacade.items$, { initialValue: [] }) and bind directly to the signal.

// [] Add user feedback for action triggers: Add loading or disabled states on the action buttons(e.g., while addToCart, removeFavorite, or clearAllFavorites are dispatching) so users cannot spam clicks during slow network roundtrips.

// [] Handle empty and error view states: Ensure the component template checks status() === 'error' or favoriteItems().length === 0 to display fallback UI instead of rendering an empty Material table.

// [] Write component unit tests with Vitest: Mock UsersFacade, MobilePhonesFacade, and OrdersFacade using simple object mocks to verify that ngOnInit dispatches correctly and user button clicks trigger the right facade methods.

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
    private readonly phonesFacade = inject(MobilePhonesFacade);
    private readonly ordersFacade = inject(OrdersFacade);
    private readonly location = inject(Location);

    private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    readonly displayedColumns: string[] = ['image', 'product', 'price', 'actions'];

    readonly favoritesList = this.usersFacade.favorites;
    readonly status = this.usersFacade.status;
    readonly error = this.usersFacade.error;

    readonly phonesList = toSignal(this.phonesFacade.items$, { initialValue: [] });

    readonly favoriteItems = computed(() =>
        toFavoriteItemViewModels(this.favoritesList(), this.phonesList())
    );
    readonly totalItems = computed(() => this.favoriteItems().length);

    ngOnInit(): void {
        this.usersFacade.loadFavorites(this.userId);
        this.phonesFacade.load(50);
    }

    addToCart(item: FavoriteItemViewModel): void {
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
import { CustomerContext } from '../../../../shared/application/customer-context';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { StorePhoneCard } from '../../../../shared/presentation/store-phone-card/store-phone-card';

import { UsersFacade } from '../../application/users.facade';
import {
  CatalogProductsLookup,
  CatalogProductsState,
} from '../../../mobile-phones/application/catalog-products-lookup';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { FavoriteItemViewModel } from '../../domain/model/favorite-item.model';
import { toCartLineItem, toFavoriteItemViewModels } from './favorites.component.utils';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink, StorePhoneCard],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnInit {
  private readonly usersFacade = inject(UsersFacade);
  private readonly catalogLookup = inject(CatalogProductsLookup);
  private readonly ordersFacade = inject(OrdersFacade);
  private readonly location = inject(Location);

  readonly customer = inject(CustomerContext);
  private get userId(): string | null {
    return this.customer.clientId();
  }
  private readonly catalogRefresh = signal(0);

  readonly favoritesList = computed(() =>
    this.usersFacade
      .favorites()
      .filter(
        (favorite) => favorite.clientId.toLowerCase() === this.customer.clientId()?.toLowerCase(),
      ),
  );
  readonly status = this.usersFacade.status;
  readonly error = this.usersFacade.error;

  readonly catalog = toSignal(
    this.catalogLookup.observe(
      toObservable(computed(() => this.favoritesList().map((favorite) => favorite.productId))),
      toObservable(this.catalogRefresh),
    ),
    {
      initialValue: {
        products: [],
        unavailableIds: [],
        status: 'loading',
        error: null,
      } as CatalogProductsState,
    },
  );

  readonly favoriteItems = computed(() =>
    toFavoriteItemViewModels(this.favoritesList(), this.catalog().products),
  );
  readonly totalItems = computed(() => this.favoritesList().length);

  ngOnInit(): void {
    if (this.userId) this.usersFacade.loadFavorites(this.userId);
  }

  reload(): void {
    if (this.userId) this.usersFacade.loadFavorites(this.userId);
    this.retryCatalog();
  }

  retryCatalog(): void {
    this.catalogRefresh.update((value) => value + 1);
  }

  addToCart(item: FavoriteItemViewModel): void {
    if (item.unavailable) return;
    const lineItem = toCartLineItem(item);
    if (this.userId) this.ordersFacade.addItem(this.userId, lineItem);
  }

  removeFavorite(productId: string): void {
    if (!productId) return;
    if (this.userId) this.usersFacade.removeFavorite(this.userId, productId);
  }

  clearAllFavorites(): void {
    if (this.userId) this.usersFacade.clearAllFavorites(this.userId);
  }

  goBack(): void {
    this.location.back();
  }
}

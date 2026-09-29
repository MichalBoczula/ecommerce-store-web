import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { OrdersFacade } from '../../application/orders.facade';
import { ShoppingCartLineResponse } from '../../domain/model/shopping-cart-line-response.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { signal } from '@angular/core';
import { CatalogProductsLookup, CatalogProductsState } from '../../../mobile-phones/application/catalog-products-lookup';
import { estimatedSubtotals, toCartItemViewModels } from './shopping-cart.utils';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShoppingCartComponent implements OnInit {
  private readonly ordersFacade = inject(OrdersFacade);
  private readonly location = inject(Location);
  private readonly catalogLookup = inject(CatalogProductsLookup);
  private readonly catalogRefresh = signal(0);

  private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  readonly displayedColumns: string[] = ['product', 'price', 'quantity', 'lineTotal', 'actions'];

  readonly shoppingCart = this.ordersFacade.shoppingCart;
  readonly status = this.ordersFacade.status;
  readonly error = this.ordersFacade.error;
  readonly isUpdating = computed(() => this.status() === 'updating');

  readonly cartLines = computed(() => this.shoppingCart()?.lines ?? []);
  readonly catalog = toSignal(this.catalogLookup.observe(
    toObservable(computed(() => this.cartLines().map(line => line.productId))),
    toObservable(this.catalogRefresh)
  ), { initialValue: { products: [], unavailableIds: [], status: 'loading', error: null } as CatalogProductsState });
  readonly items = computed(() => toCartItemViewModels(this.cartLines(), this.catalog().products));
  readonly subtotals = computed(() => estimatedSubtotals(this.items()));
  readonly hasUnpricedItems = computed(() => this.items().some(item =>
    item.unavailable || item.priceAmount === null || !Number.isFinite(item.priceAmount) || !item.priceCurrency));
  readonly totalItems = computed(() =>
    this.cartLines().reduce((sum, line) => sum + (line.quantity ?? 0), 0)
  );

  ngOnInit(): void {
    this.ordersFacade.loadByClientId(this.userId);
  }

  reload(): void {
    this.ordersFacade.loadCart(this.userId);
    this.retryCatalog();
  }

  retryCatalog(): void {
    this.catalogRefresh.update(value => value + 1);
  }

  incrementQuantity(item: ShoppingCartLineResponse): void {
    this.ordersFacade.incrementItem(this.userId, item.productId);
  }

  decrementQuantity(item: ShoppingCartLineResponse): void {
    this.ordersFacade.decrementItem(this.userId, item.productId);
  }

  removeItem(item: ShoppingCartLineResponse): void {
    this.ordersFacade.removeItem(this.userId, item.productId);
  }

  clearCart(): void {
    this.ordersFacade.clearCart(this.userId);
  }

  goBack(): void {
    this.location.back();
  }
}

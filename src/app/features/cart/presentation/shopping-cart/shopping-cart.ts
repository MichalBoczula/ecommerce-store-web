import { CustomerContext } from '../../../../shared/application/customer-context';
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
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterLink
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

  readonly customer = inject(CustomerContext);
  private get userId(): string | null { return this.customer.clientId(); }

  readonly displayedColumns: string[] = ['product', 'price', 'quantity', 'lineTotal', 'actions'];

  readonly shoppingCart = this.ordersFacade.shoppingCart;
  readonly status = this.ordersFacade.status;
  readonly error = this.ordersFacade.error;
  readonly checkoutStatus = this.ordersFacade.checkoutStatus;
  readonly checkoutError = this.ordersFacade.checkoutError;
  readonly placedOrder = this.ordersFacade.placedOrder;
  readonly isUpdating = computed(() => this.status() === 'updating' || this.checkoutStatus() === 'pending');
  private readonly checkoutEstimate = signal<{ amount: number; currency: string } | null>(null);

  readonly cartLines = computed(() => this.shoppingCart()?.lines ?? []);
  readonly catalog = toSignal(this.catalogLookup.observe(
    toObservable(computed(() => this.cartLines().map(line => line.productId))),
    toObservable(this.catalogRefresh)
  ), { initialValue: { products: [], unavailableIds: [], status: 'loading', error: null } as CatalogProductsState });
  readonly items = computed(() => toCartItemViewModels(this.cartLines(), this.catalog().products));
  readonly subtotals = computed(() => estimatedSubtotals(this.items()));
  readonly hasUnpricedItems = computed(() => this.items().some(item =>
    item.unavailable || item.priceAmount === null || !Number.isFinite(item.priceAmount) ||
    item.priceAmount <= 0 || !item.priceCurrency));
  readonly totalItems = computed(() =>
    this.cartLines().reduce((sum, line) => sum + (line.quantity ?? 0), 0)
  );
  readonly canCheckout = computed(() => this.status() === 'loaded' && this.checkoutStatus() === 'idle' &&
    this.cartLines().length > 0 && this.catalog().status === 'loaded' &&
    !this.hasUnpricedItems() && this.subtotals().length === 1);
  readonly finalPriceChanged = computed(() => {
    const estimate = this.checkoutEstimate();
    const order = this.placedOrder();
    return !!estimate && !!order && (estimate.currency !== order.totalCurrency.toUpperCase() ||
      Math.round(estimate.amount * 100) !== Math.round(order.totalAmount * 100));
  });

  ngOnInit(): void {
    if (this.userId) this.ordersFacade.loadByClientId(this.userId);
  }

  reload(): void {
    if (this.userId) this.ordersFacade.loadCart(this.userId);
    this.retryCatalog();
  }

  retryCatalog(): void {
    this.catalogRefresh.update(value => value + 1);
  }

  incrementQuantity(item: ShoppingCartLineResponse): void {
    if (this.userId) this.ordersFacade.incrementItem(this.userId, item.productId);
  }

  decrementQuantity(item: ShoppingCartLineResponse): void {
    if (this.userId) this.ordersFacade.decrementItem(this.userId, item.productId);
  }

  removeItem(item: ShoppingCartLineResponse): void {
    if (this.userId) this.ordersFacade.removeItem(this.userId, item.productId);
  }

  clearCart(): void {
    if (this.userId) this.ordersFacade.clearCart(this.userId);
  }

  checkout(): void {
    if (!this.canCheckout()) return;
    const subtotal = this.subtotals()[0];
    this.checkoutEstimate.set({ amount: subtotal.amount, currency: subtotal.currency });
    if (this.userId) this.ordersFacade.checkout(this.userId);
  }

  goBack(): void {
    this.location.back();
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { OrdersFacade } from '../../application/orders.facade';
import { cartFeature } from '../../state/orders.feature';
import { ShoppingCartLineResponse } from '../../domain/model/shopping-cart-line-response.model';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShoppingCartComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly ordersFacade = inject(OrdersFacade);
  private readonly location = inject(Location);

  private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  readonly displayedColumns: string[] = ['name', 'price', 'quantity', 'total', 'actions'];

  readonly shoppingCart = this.store.selectSignal(cartFeature.selectShoppingCart);
  readonly status = this.store.selectSignal(cartFeature.selectStatus);
  readonly error = this.store.selectSignal(cartFeature.selectError);

  readonly cartLines = computed(() => this.shoppingCart()?.lines ?? []);
  readonly grandTotal = computed(() => this.shoppingCart()?.totalAmount ?? 0);
  readonly cartCurrency = computed(() => this.shoppingCart()?.totalCurrency ?? 'USD');
  readonly totalItems = computed(() =>
    this.cartLines().reduce((sum, line) => sum + (line.quantity ?? 0), 0)
  );

  ngOnInit(): void {
    this.ordersFacade.loadByClientId(this.userId);
  }

  incrementQuantity(item: ShoppingCartLineResponse): void {
  }

  decrementQuantity(item: ShoppingCartLineResponse): void {
  }

  removeItem(productId?: string | null): void {
    if (!productId) return;
  }

  clearCart(): void {
  }

  goBack(): void {
    this.location.back();
  }
}
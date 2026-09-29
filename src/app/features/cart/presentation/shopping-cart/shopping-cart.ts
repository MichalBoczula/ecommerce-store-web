import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { OrdersFacade } from '../../application/orders.facade';
import { ShoppingCartLineResponse } from '../../domain/model/shopping-cart-line-response.model';

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

  private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  readonly displayedColumns: string[] = ['productId', 'quantity', 'actions'];

  readonly shoppingCart = this.ordersFacade.shoppingCart;
  readonly status = this.ordersFacade.status;
  readonly error = this.ordersFacade.error;
  readonly isUpdating = computed(() => this.status() === 'updating');

  readonly cartLines = computed(() => this.shoppingCart()?.lines ?? []);
  readonly totalItems = computed(() =>
    this.cartLines().reduce((sum, line) => sum + (line.quantity ?? 0), 0)
  );

  ngOnInit(): void {
    this.ordersFacade.loadByClientId(this.userId);
  }

  reload(): void {
    this.ordersFacade.loadCart(this.userId);
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

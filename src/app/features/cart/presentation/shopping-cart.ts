import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { CartItem } from '../domain/model/cart-item.model';
import { cartFeature } from '../state/shopping-cart.feature';
import { CartActions } from '../state/shopping-cart.actions';
import { OrdersFacade } from '../application/orders.facade';

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
  private readonly shoppingCartFacade = inject(OrdersFacade);

  private cartId: string = '239af05-6e03-4612-94be-bb7e99ec3ece';
  private userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  readonly displayedColumns: string[] = ['image', 'name', 'price', 'quantity', 'total', 'actions'];
  readonly items = this.store.selectSignal(cartFeature.selectCartItems);
  readonly grandTotal = this.store.selectSignal(cartFeature.selectGrandTotal);
  readonly totalItems = this.store.selectSignal(cartFeature.selectTotalItems);

  ngOnInit(): void {
    this.shoppingCartFacade.loadByClientId(this.userId);
  }

  incrementQuantity(item: CartItem): void {
    this.store.dispatch(
      CartActions.changeQuantity({ id: item.id, quantity: item.quantity + 1 })
    );
  }

  decrementQuantity(item: CartItem): void {
    this.store.dispatch(
      CartActions.changeQuantity({ id: item.id, quantity: item.quantity - 1 })
    );
  }

  removeItem(id: string): void {
    this.store.dispatch(CartActions.removeFromList({ id }));
  }

  clearCart(): void {
    this.store.dispatch(CartActions.cleanUp());
  }
}
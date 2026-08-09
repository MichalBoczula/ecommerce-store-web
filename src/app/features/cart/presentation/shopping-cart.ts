import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CartItem } from '../domain/model/cart-item.model';

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
export class ShoppingCartComponent {
  displayedColumns: string[] = ['image', 'name', 'price', 'quantity', 'total', 'actions'];

  // State managed via Signals
  readonly items = signal<CartItem[]>([
    {
      id: '1',
      name: 'Nova X1 Ultra',
      price: 999,
      quantity: 1,
      imageUrl: 'https://picsum.photos/seed/nova-x1/100/100'
    },
    {
      id: '2',
      name: 'Galaxy Pixel Pro',
      price: 1199,
      quantity: 2,
      imageUrl: 'https://picsum.photos/seed/galaxy-pixel/100/100'
    }
  ]);

  // Derived state calculations
  readonly grandTotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  incrementQuantity(id: string): void {
    this.items.update(list =>
      list.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  decrementQuantity(id: string): void {
    this.items.update(list =>
      list
        .map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  removeItem(id: string): void {
    this.items.update(list => list.filter(item => item.id !== id));
  }

  clearCart(): void {
    this.items.set([]);
  }
}
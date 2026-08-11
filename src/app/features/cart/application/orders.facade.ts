import { inject, Injectable, signal } from '@angular/core';
import { OrdersRepository } from '../domain/interfaces/orders-repository.port';
import { ShoppingCartResponse } from '../domain/model/shopping-cart-response.model';

@Injectable({ providedIn: 'root' })
export class OrdersFacade {
    private readonly repository = inject(OrdersRepository);

    readonly cart = signal<ShoppingCartResponse | null>(null);
    readonly isLoading = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    loadByClientId(clientId: string): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.repository.getByClientId(clientId).subscribe({
            next: (data) => {
                console.log('--- 🛠️ Kiota Repository Fetch Success ---', data);
                this.cart.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('--- ❌ Kiota Repository Fetch Error ---', err);
                this.error.set(err.message || 'Failed to fetch shopping cart');
                this.isLoading.set(false);
            },
        });
    }
}
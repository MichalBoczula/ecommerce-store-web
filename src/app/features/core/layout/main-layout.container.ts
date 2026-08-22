import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { MobilePhoneFilter } from '../../mobile-phones/presentation/mobile-phone.filter/mobile-phone.filter';
import { UsersFacade } from '../../users/application/users.facade';
import { OrdersFacade } from '../../cart/application/orders.facade';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MobilePhoneFilter,
    RouterOutlet,
  ],
  templateUrl: './main-layout.container.html',
  styleUrl: './main-layout.container.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usersFacade = inject(UsersFacade);
  private readonly ordersFacade = inject(OrdersFacade);

  private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  readonly sidenavMode = computed<'over'>(() => 'over');
  readonly sidenavOpened = computed(() => false);

  readonly favorites = this.usersFacade.favorites;
  readonly favoritesCount = computed(() => this.favorites()?.length ?? 0);

  readonly shoppingCart = this.ordersFacade.shoppingCart;
  readonly cartItemsCount = computed(() => {
    const cart = this.shoppingCart();
    if (!cart?.lines?.length) return 0;
    return cart.lines.reduce((total: number, line: { quantity?: number }) => total + (line.quantity ?? 1), 0);
  });

  ngOnInit(): void {
    this.usersFacade.loadFavorites(this.userId);
    this.ordersFacade.loadCart(this.userId);
  }

  onNavClick(sidenav: { close: () => void }): void {
    sidenav.close();
  }

  onCartClick(): void {
    this.router.navigate(['/cart']);
  }

  onFavoritesClick(): void {
    this.router.navigate(['/favorites']);
  }
}
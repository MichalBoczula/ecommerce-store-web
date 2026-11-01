import { CustomerContext } from '../../../shared/application/customer-context';
import { Component, computed, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { StoreHeader } from '../../../shared/presentation/store-header/store-header';
import { StoreMobileNav } from '../../../shared/presentation/store-mobile-nav/store-mobile-nav';
import { StoreFooter } from '../../../shared/presentation/store-footer/store-footer';

import { MobilePhoneFilter } from '../../mobile-phones/presentation/mobile-phone.filter/mobile-phone.filter';
import { UsersFacade } from '../../users/application/users.facade';
import { OrdersFacade } from '../../cart/application/orders.facade';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    StoreHeader,
    StoreMobileNav,
    StoreFooter,
    RouterLink,
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

  readonly customer = inject(CustomerContext);
  private get userId(): string | null {
    return this.customer.clientId();
  }

  private readonly filters = viewChild<MatSidenav>('filters');

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.filters()?.close());
  }

  get showCatalogFilters(): boolean {
    return this.router.url.startsWith('/list');
  }

  readonly favorites = this.usersFacade.favorites;
  readonly favoritesCount = computed(() => this.favorites()?.length ?? 0);

  readonly shoppingCart = this.ordersFacade.shoppingCart;
  readonly cartError = this.ordersFacade.error;
  get showCartError(): boolean {
    return !!this.cartError() && !this.router.url.startsWith('/cart');
  }
  readonly cartItemsCount = computed(() => {
    const cart = this.shoppingCart();
    if (!cart?.lines?.length) return 0;
    return cart.lines.reduce(
      (total: number, line: { quantity?: number }) => total + (line.quantity ?? 1),
      0,
    );
  });

  ngOnInit(): void {
    if (this.userId) {
      this.usersFacade.loadFavorites(this.userId);
      this.ordersFacade.loadCart(this.userId);
    }
  }
}

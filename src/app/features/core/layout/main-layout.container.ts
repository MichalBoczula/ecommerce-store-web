import { CustomerContext } from '../../../shared/application/customer-context';
import { Component, computed, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule, DOCUMENT, ViewportScroller } from '@angular/common';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterLink,
  RouterOutlet,
  Scroll,
} from '@angular/router';

import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { StorefrontLayoutState } from '../../../shared/presentation/storefront-layout-state';
import { StoreHeader } from '../../../shared/presentation/store-header/store-header';
import { StoreMobileNav } from '../../../shared/presentation/store-mobile-nav/store-mobile-nav';
import { StoreFooter } from '../../../shared/presentation/store-footer/store-footer';

import { CatalogFilterDrawer } from '../../mobile-phones/presentation/mobile-phone.filter/catalog-filter-drawer';
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
  private readonly document = inject(DOCUMENT);
  private readonly viewport = inject(ViewportScroller);
  private previousPage: string | null = null;
  private cancelScrollRestore?: () => void;
  private readonly usersFacade = inject(UsersFacade);
  private readonly ordersFacade = inject(OrdersFacade);

  readonly layoutState = inject(StorefrontLayoutState);
  readonly customer = inject(CustomerContext);
  private get userId(): string | null {
    return this.customer.clientId();
  }

  private readonly filters = viewChild<MatSidenav>('filters');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelScrollRestore?.());
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) this.cancelScrollRestore?.();
      if (event instanceof Scroll && event.position) this.restoreScroll(event.position);
    });
    inject(CatalogFilterDrawer)
      .openRequested$.pipe(takeUntilDestroyed())
      .subscribe(() => this.filters()?.open());
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.filters()?.close();
        const page = event.urlAfterRedirects.split(/[?#]/)[0];
        if (this.previousPage !== null && this.previousPage !== page) {
          this.document.getElementById('main-content')?.focus({ preventScroll: true });
        }
        this.previousPage = page;
      });
  }

  private restoreScroll(position: [number, number]): void {
    const view = this.document.defaultView;
    const main = this.document.getElementById('main-content');
    if (!view || !main || typeof ResizeObserver === 'undefined') return;
    const ready = () =>
      this.document.documentElement.scrollHeight - view.innerHeight >= position[1];
    if (ready()) {
      this.viewport.scrollToPosition(position);
      return;
    }
    // Router scrolling can run while API-backed pages still show their short loading state.
    // Restore after content grows, unless the user has started interacting elsewhere.
    const interactions = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    const observer = new ResizeObserver(() => {
      if (ready()) {
        this.viewport.scrollToPosition(position);
        cancel();
      }
    });
    const cancel = () => {
      observer.disconnect();
      for (const event of interactions) view.removeEventListener(event, cancel);
      this.cancelScrollRestore = undefined;
    };
    this.cancelScrollRestore = cancel;
    for (const event of interactions)
      view.addEventListener(event, cancel, { passive: true, once: true });
    observer.observe(main);
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

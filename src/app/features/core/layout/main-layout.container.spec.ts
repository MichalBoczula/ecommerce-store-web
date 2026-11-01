import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerContext } from '../../../shared/application/customer-context';
import { UsersFacade } from '../../users/application/users.facade';
import { OrdersFacade } from '../../cart/application/orders.facade';
import { MobilePhonesFacade } from '../../mobile-phones/application/mobile-phones.facade';
import { MainLayoutComponent } from './main-layout.container';

@Component({ template: '' })
class EmptyPage {}

async function setup(clientId: string | null = 'customer') {
  const users = { favorites: signal([{ productId: 'phone' }]), loadFavorites: vi.fn() };
  const orders = {
    shoppingCart: signal<{ lines: { quantity?: number }[] } | null>({
      lines: [{ quantity: 2 }, {}],
    }),
    error: signal<string | null>(null),
    loadCart: vi.fn(),
  };
  const phones = { loadByFilter: vi.fn() };
  TestBed.configureTestingModule({
    imports: [MainLayoutComponent],
    providers: [
      provideRouter(
        ['home', 'list', 'favorites', 'cart', 'orders', 'orders/:id', 'profile'].map((path) => ({
          path,
          component: EmptyPage,
        })),
      ),
      { provide: CustomerContext, useValue: { clientId: signal(clientId) } },
      { provide: UsersFacade, useValue: users },
      { provide: OrdersFacade, useValue: orders },
      { provide: MobilePhonesFacade, useValue: phones },
    ],
  });
  const fixture = TestBed.createComponent(MainLayoutComponent);
  const router = TestBed.inject(Router);
  await router.navigateByUrl('/home');
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, router, users, orders, phones };
}

describe('storefront shell', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads selected customer state and updates the shared badges from quantities', async () => {
    const { fixture, users, orders } = await setup();
    expect(users.loadFavorites).toHaveBeenCalledWith('customer');
    expect(orders.loadCart).toHaveBeenCalledWith('customer');
    expect(fixture.nativeElement.querySelector('.desktop-cart').textContent).toContain('Cart (3)');
    expect(fixture.componentInstance.favoritesCount()).toBe(1);
    orders.shoppingCart.set({ lines: [{ quantity: 5 }] });
    users.favorites.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.desktop-cart').textContent).toContain('Cart (5)');
    expect(fixture.componentInstance.favoritesCount()).toBe(0);
    orders.shoppingCart.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.desktop-cart').textContent).toContain('Cart (0)');
  });

  it('keeps guest guidance and the profile route without issuing customer requests', async () => {
    const { fixture, users, orders } = await setup(null);
    expect(users.loadFavorites).not.toHaveBeenCalled();
    expect(orders.loadCart).not.toHaveBeenCalled();
    const notice = fixture.nativeElement.querySelector('[role="status"]');
    expect(notice.textContent).toContain('No demo customer is selected');
    expect(notice.querySelector('a').getAttribute('href')).toBe('/profile');
  });

  it('navigates through real links and keeps Orders active on an order detail', async () => {
    const { fixture, router } = await setup();
    const nav = fixture.nativeElement.querySelector('nav[aria-label="Mobile navigation"]');
    expect(
      Array.from(nav.querySelectorAll('a')).map((a) =>
        (a as HTMLAnchorElement).getAttribute('href'),
      ),
    ).toEqual(['/list', '/favorites', '/cart', '/orders', '/profile']);
    (nav.querySelector('a[href="/favorites"]') as HTMLAnchorElement).click();
    await fixture.whenStable();
    expect(router.url).toBe('/favorites');
    await router.navigateByUrl('/orders/order-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(nav.querySelector('a[href="/orders"]').classList.contains('active')).toBe(true);
  });

  it('opens and closes filters, including applying them on the current catalog route', async () => {
    const { fixture, router } = await setup();
    await router.navigateByUrl('/list');
    fixture.detectChanges();
    const drawer = fixture.debugElement.query(By.directive(MatSidenav))
      .componentInstance as MatSidenav;
    (
      fixture.nativeElement.querySelector('button[aria-label="Open filters"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(drawer.opened).toBe(true);
    (
      fixture.nativeElement.querySelector('button[aria-label="Close filters"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();
    expect(drawer.opened).toBe(false);
    await drawer.open();
    (fixture.nativeElement.querySelector('.filter-form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    await fixture.whenStable();
    expect(router.url).toBe('/list');
    expect(drawer.opened).toBe(false);
  });

  it('shows cart errors elsewhere and leaves the cart screen to present its own error', async () => {
    const { fixture, router, orders } = await setup();
    orders.error.set('Cart could not be loaded');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Cart could not be loaded',
    );
    await router.navigateByUrl('/cart');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
  it('focuses new page content while preserving focus for filter-only navigation', async () => {
    const { fixture, router } = await setup();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    const focus = vi.spyOn(main, 'focus');
    await router.navigateByUrl('/list');
    expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
    await router.navigateByUrl('/list?brand=Apple');
    expect(focus).toHaveBeenCalledTimes(1);
    await router.navigateByUrl('/orders/order-1');
    expect(focus).toHaveBeenCalledTimes(2);
  });
});

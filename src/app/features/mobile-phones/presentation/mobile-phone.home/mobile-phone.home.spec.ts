import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerContext } from '../../../../shared/application/customer-context';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { LoadStatus } from '../../state/mobile-phones.feature';
import { MobilePhoneHome } from './mobile-phone.home';

function setup(
  photo: string | null = 'https://photos.example.com/phone/Main.webp',
  clientId: string | null = 'customer',
) {
  const status = new BehaviorSubject<LoadStatus>('loaded');
  const facade = {
    top$: new BehaviorSubject([
      {
        id: 'phone-id',
        commonDescription: { name: 'Top phone', brand: 'Apple', mainPhoto: photo },
        price: { amount: 3999, currency: 'PLN' },
      },
    ]),
    topStatus$: status,
    loadTop: vi.fn(),
  };
  const users = {
    favorites: signal<{ productId: string; clientId: string }[]>([]),
    loadFavorites: vi.fn(),
    addFavoriteByProductId: vi.fn(),
    removeFavorite: vi.fn(),
  };
  const orders = { addItem: vi.fn() };
  TestBed.configureTestingModule({
    imports: [MobilePhoneHome],
    providers: [
      provideRouter([]),
      { provide: MobilePhonesFacade, useValue: facade },
      { provide: CustomerContext, useValue: { clientId: signal(clientId) } },
      { provide: OrdersFacade, useValue: orders },
      { provide: UsersFacade, useValue: users },
    ],
  });
  const fixture = TestBed.createComponent(MobilePhoneHome);
  fixture.detectChanges();
  return { fixture, facade, status, users, orders };
}

describe('mobile phone home', () => {
  afterEach(() => TestBed.resetTestingModule());

  it.each(['https://photos.example.com/phone/Main.webp', null, ''])(
    'renders API photos and prices without duplicating accessible hero images (%s)',
    (photo) => {
      const { fixture, facade } = setup(photo);
      expect(facade.loadTop).toHaveBeenCalledOnce();
      const card = fixture.nativeElement.querySelector('app-store-phone-card') as HTMLElement;
      expect(card.textContent).toContain('Top phone');
      expect(card.querySelector('.price')?.textContent).toContain('3,999 PLN');
      expect(card.querySelector('a')?.getAttribute('href')).toBe('/details/phone-id');
      if (photo) {
        expect(card.querySelector('img')?.getAttribute('src')).toBe(photo);
        expect(fixture.nativeElement.querySelector('.hero-image img').alt).toBe('');
      } else
        expect(card.querySelector('span[role="img"]')?.getAttribute('aria-label')).toBe(
          'Photo unavailable for Top phone',
        );
      expect(
        fixture.nativeElement
          .querySelector('nav[aria-label="Shop by brand"] a')
          .getAttribute('href'),
      ).toBe('/list?brand=Apple');
    },
  );

  it('wires featured cart and favorite actions to the selected customer', () => {
    const { fixture, users, orders } = setup();
    const card = fixture.nativeElement.querySelector('app-store-phone-card') as HTMLElement;
    users.favorites.set([{ productId: 'phone-id', clientId: 'another-customer' }]);
    fixture.detectChanges();
    expect(card.querySelector('.favorite')?.getAttribute('aria-pressed')).toBe('false');
    expect(users.loadFavorites).toHaveBeenCalledWith('customer');
    card.querySelector<HTMLButtonElement>('.add-button')?.click();
    expect(orders.addItem).toHaveBeenCalledWith('customer', { productId: 'phone-id', quantity: 1 });
    card.querySelector<HTMLButtonElement>('.favorite')?.click();
    expect(users.addFavoriteByProductId).toHaveBeenCalledWith('customer', 'phone-id');
    users.favorites.set([{ productId: 'PHONE-ID', clientId: 'customer' }]);
    fixture.detectChanges();
    expect(card.querySelector('.favorite')?.getAttribute('aria-pressed')).toBe('true');
    card.querySelector<HTMLButtonElement>('.favorite')?.click();
    expect(users.removeFavorite).toHaveBeenCalledWith('customer', 'phone-id');
  });

  it('disables mutations for a guest while keeping product links available', () => {
    const { fixture, orders, users } = setup(null, null);
    const card = fixture.nativeElement.querySelector('app-store-phone-card') as HTMLElement;
    expect(card.querySelector<HTMLButtonElement>('.add-button')?.disabled).toBe(true);
    fixture.componentInstance.addToCart(fixture.componentInstance.phones()[0]);
    fixture.componentInstance.toggleFavorite(fixture.componentInstance.phones()[0]);
    expect(orders.addItem).not.toHaveBeenCalled();
    expect(users.addFavoriteByProductId).not.toHaveBeenCalled();
    expect(card.querySelector('a')?.getAttribute('href')).toBe('/details/phone-id');
  });

  it('shows loading, failed/retry and empty states without stale featured cards', () => {
    const { fixture, status, facade } = setup();
    status.next('loading');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading smartphones');
    expect(fixture.nativeElement.querySelector('app-store-phone-card')).toBeNull();
    status.next('error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Couldn’t load phones',
    );
    (
      fixture.nativeElement.querySelector('app-catalog-feedback button') as HTMLButtonElement
    ).click();
    expect(facade.loadTop).toHaveBeenCalledTimes(2);
    facade.top$.next([]);
    status.next('loaded');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No phones found');
  });

  it('falls back for a broken hero photo and retries that photo after reloading', () => {
    const { fixture } = setup();
    fixture.nativeElement.querySelector('.hero-image img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.hero-image img')).toBeNull();
    fixture.componentInstance.load();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.hero-image img')).not.toBeNull();
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerContext } from '../../../../shared/application/customer-context';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { LoadStatus } from '../../state/mobile-phones.feature';
import { CatalogFilterDrawer } from '../mobile-phone.filter/catalog-filter-drawer';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { MobilePhoneList } from './mobile-phone.list';

function setup(query = {}, clientId: string | null = 'customer') {
  const params = new BehaviorSubject(convertToParamMap(query));
  const status = new BehaviorSubject<LoadStatus>('loaded');
  const phone: MobilePhone = {
    id: 'phone-id',
    name: 'Catalog phone',
    brand: 'Apple',
    mainPhoto: 'https://photos.example.com/phone/Main.webp',
    screenSizeInches: 6.3,
    displayType: 'OLED',
    camera: 'Not a processor',
    price: { amount: 25, currency: 'EUR' },
    isFavorite: false,
  };
  const facade = {
    items$: new BehaviorSubject([phone]),
    catalogStatus$: status,
    load: vi.fn(),
    loadByFilter: vi.fn(),
  };
  const users = {
    favorites: signal<{ productId: string; clientId: string }[]>([]),
    loadFavorites: vi.fn(),
    addFavoriteByProductId: vi.fn(),
    removeFavorite: vi.fn(),
  };
  const orders = { addItem: vi.fn() };
  TestBed.configureTestingModule({
    imports: [MobilePhoneList],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { queryParamMap: params, snapshot: { queryParamMap: params.value } },
      },
      { provide: MobilePhonesFacade, useValue: facade },
      { provide: UsersFacade, useValue: users },
      { provide: OrdersFacade, useValue: orders },
      { provide: CustomerContext, useValue: { clientId: signal(clientId) } },
    ],
  });
  const fixture = TestBed.createComponent(MobilePhoneList);
  fixture.detectChanges();
  return { fixture, params, status, facade, users, orders, phone };
}

describe('mobile phone catalog', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads the catalog once and renders actual photos, money and supported specifications', () => {
    const { fixture, facade, phone } = setup();
    expect(facade.load).toHaveBeenCalledOnce();
    expect(facade.load).toHaveBeenCalledWith(15);
    const card = fixture.nativeElement.querySelector('app-store-phone-card') as HTMLElement;
    expect(card.querySelector('img')?.getAttribute('src')).toBe(phone.mainPhoto);
    expect(card.textContent).toContain('25 EUR');
    expect(card.textContent).toContain('6.3″ · OLED');
    expect(card.textContent).not.toContain('Not a processor');
    expect(card.querySelector('a')?.getAttribute('href')).toBe('/details/phone-id');
  });

  it('loads URL criteria without issuing an all-products request and reacts to Back/clear navigation', () => {
    const { fixture, facade, params } = setup({ brand: 'Xiaomi', minPrice: '1000' });
    expect(facade.load).not.toHaveBeenCalled();
    expect(facade.loadByFilter).toHaveBeenCalledWith({
      brand: 'Xiaomi',
      minimalPrice: 1000,
      maximalPrice: undefined,
    });
    params.next(convertToParamMap({ brand: 'Samsung', maxPrice: '2000' }));
    fixture.detectChanges();
    expect(facade.loadByFilter).toHaveBeenLastCalledWith({
      brand: 'Samsung',
      minimalPrice: undefined,
      maximalPrice: 2000,
    });
    expect(fixture.nativeElement.querySelector('.brand-label').textContent).toBe('Samsung');
    params.next(convertToParamMap({}));
    expect(facade.load).toHaveBeenCalledOnce();
  });

  it('preserves customer cart mutations and reactive saved state', () => {
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
    card.querySelector<HTMLButtonElement>('.favorite')?.click();
    expect(users.removeFavorite).toHaveBeenCalledWith('customer', 'phone-id');
  });

  it('blocks guest mutations and opens the shared filter drawer', () => {
    const { fixture, orders, users, phone } = setup({}, null);
    const open = vi.spyOn(TestBed.inject(CatalogFilterDrawer), 'requestOpen');
    (fixture.nativeElement.querySelector('.mobile-filter') as HTMLButtonElement).click();
    expect(open).toHaveBeenCalledOnce();
    fixture.componentInstance.addToCart(phone);
    fixture.componentInstance.toggleFavorite(phone);
    expect(orders.addItem).not.toHaveBeenCalled();
    expect(users.addFavoriteByProductId).not.toHaveBeenCalled();
    expect((fixture.nativeElement.querySelector('.add-button') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('distinguishes loading, filtered-empty and retry states without showing stale products', () => {
    const { fixture, facade, status } = setup({ brand: 'Apple' });
    status.next('loading');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading smartphones');
    expect(fixture.nativeElement.querySelector('app-store-phone-card')).toBeNull();
    facade.items$.next([]);
    status.next('loaded');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No phones found');
    const open = vi.spyOn(TestBed.inject(CatalogFilterDrawer), 'requestOpen');
    (
      fixture.nativeElement.querySelector('app-catalog-feedback button') as HTMLButtonElement
    ).click();
    expect(open).toHaveBeenCalledOnce();
    status.next('error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Couldn’t load phones',
    );
    (
      fixture.nativeElement.querySelector('app-catalog-feedback button') as HTMLButtonElement
    ).click();
    expect(facade.loadByFilter).toHaveBeenCalledTimes(2);
    expect(facade.load).not.toHaveBeenCalled();
  });
});

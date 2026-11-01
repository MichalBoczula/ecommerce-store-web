import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerContext } from '../../../../shared/application/customer-context';
import { StorefrontLayoutState } from '../../../../shared/presentation/storefront-layout-state';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { MobilePhoneDetails as Phone } from '../../domain/model/mobile-phone-details';
import { LoadStatus } from '../../state/mobile-phones.feature';
import { MobilePhoneDetails } from './mobile-phone.details';

const clientId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const productId = '11111111-1111-1111-1111-111111111111';
const phone: Phone = {
  id: productId,
  commonDescription: {
    brand: 'Apple',
    name: 'Apple Phone',
    mainPhoto: 'https://photos.example.com/Main.webp',
    otherPhotos: ['https://photos.example.com/Front.webp', 'https://photos.example.com/Back.webp'],
    description: 'API description',
  },
  electronicDetails: {
    ram: '8 GB',
    storage: '256 GB',
    cpu: 'CPU',
    screenSizeInches: 6.3,
    displayType: 'OLED',
  },
  faceId: false,
  description2: 'More details',
  price: { amount: 3999, currency: 'PLN' },
};
function setup(customerId: string | null = clientId) {
  const params = new BehaviorSubject(convertToParamMap({ id: productId }));
  const details = new BehaviorSubject<Phone | null>(phone);
  const status = new BehaviorSubject<LoadStatus>('loaded');
  const facade = { details$: details, detailsStatus$: status, loadById: vi.fn() };
  const users = {
    favorites: signal<{ clientId: string; productId: string }[]>([]),
    loadFavorites: vi.fn(),
    addFavoriteByProductId: vi.fn(),
    removeFavorite: vi.fn(),
  };
  const orders = { addItem: vi.fn() },
    location = { back: vi.fn() };
  TestBed.configureTestingModule({
    imports: [MobilePhoneDetails],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: params, snapshot: { paramMap: params.value } },
      },
      { provide: CustomerContext, useValue: { clientId: signal(customerId) } },
      { provide: MobilePhonesFacade, useValue: facade },
      { provide: UsersFacade, useValue: users },
      { provide: OrdersFacade, useValue: orders },
      { provide: Location, useValue: location },
    ],
  });
  const fixture = TestBed.createComponent(MobilePhoneDetails);
  fixture.detectChanges();
  return { fixture, params, details, status, facade, users, orders, location };
}

describe('product details', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('loads the route product, real gallery, supplied currency, descriptions and specifications', () => {
    const { fixture, facade, users } = setup();
    const element = fixture.nativeElement as HTMLElement;
    expect(facade.loadById).toHaveBeenCalledWith(productId);
    expect(users.loadFavorites).toHaveBeenCalledWith(clientId);
    expect(element.querySelector('h1')?.textContent).toBe('Apple Phone');
    expect(element.querySelector('.main-photo img')?.getAttribute('src')).toBe(
      phone.commonDescription!.mainPhoto,
    );
    expect(element.querySelectorAll('.thumbnail')).toHaveLength(3);
    expect(element.querySelector('.product-price')?.textContent).toContain('3,999 PLN');
    expect(element.textContent).toContain('API description');
    expect(element.textContent).toContain('More details');
    expect(element.textContent).not.toContain('GB GB');
    const faceIdRow = [...element.querySelectorAll('.specifications dl > div')].find(
      (row) => row.querySelector('dt')?.textContent === 'Face ID',
    );
    expect(faceIdRow?.querySelector('dd')?.textContent?.trim()).toBe('No');
    expect(
      element.querySelectorAll('img[src*="shiba"],swiper-container,input[type="checkbox"]'),
    ).toHaveLength(0);
  });
  it('selects thumbnails, skips broken photos and falls back when all photos fail', () => {
    const { fixture } = setup();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelectorAll<HTMLButtonElement>('.thumbnail')[1].click();
    fixture.detectChanges();
    expect(element.querySelector('.main-photo img')?.getAttribute('src')).toContain('Front.webp');
    expect(element.querySelectorAll('.thumbnail')[1].getAttribute('aria-pressed')).toBe('true');
    element.querySelector('.main-photo img')?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(element.querySelector('.main-photo img')?.getAttribute('src')).toContain('Main.webp');
    expect(element.querySelectorAll('.thumbnail')[1].getAttribute('aria-label')).toContain(
      'Unavailable photo 2',
    );
    for (const photo of fixture.componentInstance.photos())
      fixture.componentInstance.photoFailed(photo);
    fixture.detectChanges();
    expect(element.querySelector('.main-photo img')).toBeNull();
    expect(element.querySelector('.photo-fallback')?.getAttribute('aria-label')).toBe(
      'Photo unavailable for Apple Phone',
    );
  });
  it('keeps ID-only cart commands, customer-scoped favorites and Back navigation', () => {
    const { fixture, users, orders, location } = setup();
    users.favorites.set([{ clientId: 'another', productId }]);
    fixture.detectChanges();
    fixture.componentInstance.addToCart();
    fixture.componentInstance.toggleFavorite();
    fixture.componentInstance.goBack();
    expect(orders.addItem).toHaveBeenCalledWith(clientId, { productId, quantity: 1 });
    expect(users.addFavoriteByProductId).toHaveBeenCalledWith(clientId, productId);
    expect(location.back).toHaveBeenCalledOnce();
    users.favorites.set([{ clientId, productId: productId.toUpperCase() }]);
    fixture.detectChanges();
    fixture.componentInstance.toggleFavorite();
    expect(users.removeFavorite).toHaveBeenCalledWith(clientId, productId);
  });
  it('disables both purchase controls and favorites for a guest', () => {
    const { fixture, users, orders } = setup(null);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector<HTMLButtonElement>('.purchase-button')?.disabled).toBe(true);
    expect(element.querySelector<HTMLButtonElement>('.mobile-purchase button')?.disabled).toBe(
      true,
    );
    fixture.componentInstance.addToCart();
    fixture.componentInstance.toggleFavorite();
    expect(orders.addItem).not.toHaveBeenCalled();
    expect(users.addFavoriteByProductId).not.toHaveBeenCalled();
    expect(users.loadFavorites).not.toHaveBeenCalled();
  });
  it('hides stale actions during route changes, errors and retry', () => {
    const { fixture, params, details, status, facade, orders } = setup();
    const nextId = '22222222-2222-2222-2222-222222222222';
    status.next('loading');
    params.next(convertToParamMap({ id: nextId }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading phone');
    expect(fixture.nativeElement.querySelector('.purchase-panel')).toBeNull();
    fixture.componentInstance.addToCart();
    expect(orders.addItem).not.toHaveBeenCalled();
    status.next('error');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Couldn’t load this phone');
    (
      fixture.nativeElement.querySelector('app-catalog-feedback button') as HTMLButtonElement
    ).click();
    expect(facade.loadById).toHaveBeenLastCalledWith(nextId);
    status.next('loaded');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.purchase-panel')).toBeNull();
    details.next({ ...phone, id: nextId, commonDescription: { name: 'New phone' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('New phone');
  });
  it('handles missing photos/money and preserves valid zero prices and supplied currencies', () => {
    const { fixture, details } = setup();
    details.next({ id: productId });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Price unavailable');
    expect(fixture.nativeElement.querySelector('.thumbnail')).toBeNull();
    details.next({ ...phone, price: { amount: 0, currency: 'EUR' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.product-price').textContent).toContain('0 EUR');
  });
  it('reserves mobile action space only while the loaded details view exists', () => {
    const { fixture, status } = setup();
    const layout = TestBed.inject(StorefrontLayoutState);
    expect(layout.mobileActionBarVisible()).toBe(true);
    status.next('error');
    fixture.detectChanges();
    expect(layout.mobileActionBarVisible()).toBe(false);
    status.next('loaded');
    fixture.detectChanges();
    expect(layout.mobileActionBarVisible()).toBe(true);
    fixture.destroy();
    expect(layout.mobileActionBarVisible()).toBe(false);
  });
});

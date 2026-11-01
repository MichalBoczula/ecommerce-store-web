import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StorePhoneCard } from './store-phone-card';

function setup() {
  TestBed.configureTestingModule({ imports: [StorePhoneCard], providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(StorePhoneCard);
  fixture.componentRef.setInput('productId', 'phone-1');
  fixture.componentRef.setInput('name', 'Catalog phone');
  fixture.componentRef.setInput('photo', 'https://photos.example.com/Main.webp');
  fixture.componentRef.setInput('price', { amount: 3999, currency: 'PLN' });
  fixture.detectChanges();
  return fixture;
}

describe('shared phone card', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('uses API data and emits independent cart and favorite actions', () => {
    const fixture = setup();
    const add = vi.fn(),
      save = vi.fn();
    fixture.componentInstance.addToCart.subscribe(add);
    fixture.componentInstance.toggleFavorite.subscribe(save);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.price')?.textContent).toContain('3,999 PLN');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/details/phone-1');
    expect(element.querySelector('img')?.alt).toBe('');
    expect(element.querySelector('.details')?.getAttribute('aria-label')).toBe(
      'View details for Catalog phone',
    );
    expect(element.querySelector('.add-button')?.getAttribute('aria-label')).toBe(
      'Add to cart: Catalog phone',
    );
    element.querySelector<HTMLButtonElement>('.favorite')?.click();
    expect(save).toHaveBeenCalledOnce();
    expect(add).not.toHaveBeenCalled();
    element.querySelector<HTMLButtonElement>('.add-button')?.click();
    expect(add).toHaveBeenCalledOnce();
    fixture.componentRef.setInput('saved', true);
    fixture.componentRef.setInput('actionsDisabled', true);
    fixture.detectChanges();
    expect(element.querySelector('.favorite')?.getAttribute('aria-pressed')).toBe('true');
    element.querySelector<HTMLButtonElement>('.favorite')?.click();
    element.querySelector<HTMLButtonElement>('.add-button')?.click();
    expect(save).toHaveBeenCalledOnce();
    expect(add).toHaveBeenCalledOnce();
  });

  it('shows missing and failed photos and recovers when the photo changes', () => {
    const fixture = setup();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector('img')?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(element.querySelector('span[role="img"]')?.getAttribute('aria-label')).toBe(
      'Photo unavailable for Catalog phone',
    );
    fixture.componentRef.setInput('photo', 'https://photos.example.com/Replacement.webp');
    fixture.detectChanges();
    expect(element.querySelector('img')?.getAttribute('src')).toContain('Replacement.webp');
    fixture.componentRef.setInput('photo', null);
    fixture.detectChanges();
    expect(element.querySelector('img')).toBeNull();
  });

  it.each([
    null,
    { amount: null, currency: 'PLN' },
    { amount: 22 },
    { amount: NaN, currency: 'EUR' },
  ])('does not invent a price or currency for incomplete data (%o)', (price) => {
    const fixture = setup();
    fixture.componentRef.setInput('price', price);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.price').textContent).toContain(
      'Price unavailable',
    );
  });

  it('preserves zero prices and non-PLN currencies from the API', () => {
    const fixture = setup();
    fixture.componentRef.setInput('price', { amount: 0, currency: 'EUR' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.price').textContent).toContain('0 EUR');
  });
});

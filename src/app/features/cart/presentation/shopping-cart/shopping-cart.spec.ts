import { CustomerContext } from '../../../../shared/application/customer-context';
import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { CatalogProductsLookup } from '../../../mobile-phones/application/catalog-products-lookup';
import { MobilePhone } from '../../../mobile-phones/domain/model/mobile-phone';
import { OrdersFacade } from '../../application/orders.facade';
import { ShoppingCartResponse } from '../../domain/model/shopping-cart-response.model';
import { ShoppingCartComponent } from './shopping-cart';
import { provideRouter } from '@angular/router';
import { Order } from '../../../orders/domain/model/order';

const clientId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const productId = '11111111-1111-1111-1111-111111111111';
const placedOrder: Order = {
    id: '55555555-5555-5555-5555-555555555555', clientId,
    status: 'Pending', createdAt: new Date('2026-09-29T12:00:00Z'), updatedAt: null,
    totalAmount: 115, totalCurrency: 'PLN', lines: [],
};

describe('shopping cart screen', () => {
    afterEach(() => TestBed.resetTestingModule());

    function render(initialCart: ShoppingCartResponse | null, initialError: string | null = null,
        products: MobilePhone[] = [{ id: productId, name: 'Test phone', price: { amount: 100, currency: 'PLN' }, isFavorite: false }]) {
        const facade = {
            shoppingCart: signal(initialCart),
            status: signal(initialError ? 'error' : 'loaded'),
            error: signal(initialError),
            checkoutStatus: signal<'idle' | 'pending' | 'succeeded' | 'error'>('idle'),
            checkoutError: signal<string | null>(null),
            placedOrder: signal<Order | null>(null),
            loadByClientId: vi.fn(),
            loadCart: vi.fn(),
            incrementItem: vi.fn(),
            decrementItem: vi.fn(),
            removeItem: vi.fn(),
            clearCart: vi.fn(),
            checkout: vi.fn(),
        };
        TestBed.configureTestingModule({
            imports: [ShoppingCartComponent],
            providers: [
                { provide: CustomerContext, useValue: { clientId: () => '3fa85f64-5717-4562-b3fc-2c963f66afa6' } },
                provideRouter([]),
                { provide: OrdersFacade, useValue: facade },
                { provide: CatalogProductsLookup, useValue: { observe: () => of({
                    products,
                    unavailableIds: [], status: 'loaded', error: null,
                }) } },
                { provide: Location, useValue: { back: vi.fn() } },
            ],
        });
        const fixture: ComponentFixture<ShoppingCartComponent> = TestBed.createComponent(ShoppingCartComponent);
        fixture.detectChanges();
        return { fixture, facade };
    }

    it('wires quantity, remove and clear controls to cart commands', async () => {
        const { fixture, facade } = render({ id: clientId, clientId, lines: [{ productId, quantity: 2 }] });
        await fixture.whenStable();

        const button = (label: string) => fixture.nativeElement.querySelector(`button[aria-label^="${label}"]`) as HTMLButtonElement;
        button('Increase quantity').click();
        button('Decrease quantity').click();
        button('Remove').click();
        (fixture.nativeElement.querySelector('mat-card-actions button:last-of-type') as HTMLButtonElement).click();

        expect(facade.loadByClientId).toHaveBeenCalledWith(clientId);
        expect(facade.incrementItem).toHaveBeenCalledWith(clientId, productId);
        expect(facade.decrementItem).toHaveBeenCalledWith(clientId, productId);
        expect(facade.removeItem).toHaveBeenCalledWith(clientId, productId);
        expect(facade.clearCart).toHaveBeenCalledWith(clientId);
    });

    it('shows a missing cart error rather than an empty cart and allows a retry', () => {
        const { fixture, facade } = render(null, 'Shopping cart is missing.');
        const content = fixture.nativeElement.textContent as string;

        expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
        expect(content).toContain('Shopping cart is missing.');
        expect(content).not.toContain('Your shopping cart is empty.');
        (fixture.nativeElement.querySelector('[role="alert"] button') as HTMLButtonElement).click();
        expect(facade.loadCart).toHaveBeenCalledWith(clientId);
    });

    it('shows separate estimates and marks unavailable products without inventing a price', async () => {
        const missingId = '22222222-2222-2222-2222-222222222222';
        const euroId = '33333333-3333-3333-3333-333333333333';
        const { fixture } = render({ id: clientId, clientId, lines: [
            { productId, quantity: 2 }, { productId: euroId, quantity: 1 }, { productId: missingId, quantity: 1 },
        ] }, null, [
            { id: productId, name: 'PL phone', price: { amount: 100, currency: 'PLN' }, isFavorite: false },
            { id: euroId, name: 'Euro phone', price: { amount: 30, currency: 'EUR' }, isFavorite: false },
        ]);
        await fixture.whenStable();
        fixture.detectChanges();
        const content = fixture.nativeElement.textContent as string;

        expect(content).toContain('PL phone');
        expect(content).toContain('Euro phone');
        expect(content).toContain('Unavailable in catalog');
        expect(content).toContain('Estimated subtotal (PLN)');
        expect(content).toContain('Estimated subtotal (EUR)');
        expect(content).toContain('200.00');
        expect(content).toContain('30.00');
        expect(content).toContain('excluded from these estimates');
        expect((fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement).disabled).toBe(true);
    });

    it('submits only a priced single-currency cart and shows the final backend price', async () => {
        const { fixture, facade } = render({ id: clientId, clientId, lines: [{ productId, quantity: 1 }] });
        await fixture.whenStable();
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement;
        expect(button.disabled).toBe(false);
        button.click();
        expect(facade.checkout).toHaveBeenCalledExactlyOnceWith(clientId);
        facade.checkoutStatus.set('pending');
        fixture.detectChanges();
        expect(button.disabled).toBe(true);

        facade.placedOrder.set(placedOrder);
        facade.checkoutStatus.set('succeeded');
        facade.shoppingCart.set({ id: clientId, clientId, lines: [] });
        fixture.detectChanges();
        const content = fixture.nativeElement.textContent as string;
        expect(content).toContain('Final total:');
        expect(content).toContain('115.00');
        expect(content).toContain('final price changed from the cart estimate');
        expect(fixture.nativeElement.querySelector('a[href="/orders/' + placedOrder.id + '"]')).not.toBeNull();
    });

    it('keeps a failed checkout visible and points to history before retry', async () => {
        const { fixture, facade } = render({ id: clientId, clientId, lines: [{ productId, quantity: 1 }] });
        await fixture.whenStable();
        facade.checkoutStatus.set('error');
        facade.checkoutError.set('Order confirmation is uncertain.');
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Order confirmation is uncertain.');
        expect(fixture.nativeElement.querySelector('a[href="/orders"]')).not.toBeNull();
        expect((fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement).disabled).toBe(true);
    });

    it('marks a zero-priced catalog product unavailable for checkout', async () => {
        const { fixture } = render({ id: clientId, clientId, lines: [{ productId, quantity: 1 }] },
            null, [{ id: productId, name: 'Test phone',
                price: { amount: 0, currency: 'PLN' }, isFavorite: false }]);
        await fixture.whenStable();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Price unavailable');
        expect((fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement).disabled).toBe(true);
    });
});

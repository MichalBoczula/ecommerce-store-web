import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrdersFacade } from '../../application/orders.facade';
import { ShoppingCartResponse } from '../../domain/model/shopping-cart-response.model';
import { ShoppingCartComponent } from './shopping-cart';

const clientId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const productId = '11111111-1111-1111-1111-111111111111';

describe('shopping cart screen', () => {
    afterEach(() => TestBed.resetTestingModule());

    function render(initialCart: ShoppingCartResponse | null, initialError: string | null = null) {
        const facade = {
            shoppingCart: signal(initialCart),
            status: signal(initialError ? 'error' : 'loaded'),
            error: signal(initialError),
            loadByClientId: vi.fn(),
            loadCart: vi.fn(),
            incrementItem: vi.fn(),
            decrementItem: vi.fn(),
            removeItem: vi.fn(),
            clearCart: vi.fn(),
        };
        TestBed.configureTestingModule({
            imports: [ShoppingCartComponent],
            providers: [
                { provide: OrdersFacade, useValue: facade },
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
        (fixture.nativeElement.querySelector('mat-card-actions button') as HTMLButtonElement).click();

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
});

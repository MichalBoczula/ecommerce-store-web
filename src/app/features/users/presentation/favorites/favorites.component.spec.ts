import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogProductsLookup } from '../../../mobile-phones/application/catalog-products-lookup';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../application/users.facade';
import { FavoritesComponent } from './favorites.component';

const clientId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const foundId = '11111111-1111-1111-1111-111111111111';
const missingId = '22222222-2222-2222-2222-222222222222';

describe('favorites screen', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('loads favorites by ID, shows missing products, and prevents adding them to the cart', async () => {
        const users = {
            favorites: signal([
                { id: 'a', clientId, productId: foundId, addedAt: new Date() },
                { id: 'b', clientId, productId: missingId, addedAt: new Date() },
            ]),
            status: signal('loaded'), error: signal(null),
            loadFavorites: vi.fn(), removeFavorite: vi.fn(), clearAllFavorites: vi.fn(),
        };
        const orders = { addItem: vi.fn() };
        const observe = vi.fn(() => of({
            status: 'loaded', error: null,
            products: [{ id: foundId, name: 'Beyond page 1', price: { amount: 44, currency: 'EUR' }, isFavorite: false }],
            unavailableIds: [missingId],
        }));
        TestBed.configureTestingModule({
            imports: [FavoritesComponent],
            providers: [
                { provide: UsersFacade, useValue: users },
                { provide: OrdersFacade, useValue: orders },
                { provide: CatalogProductsLookup, useValue: { observe } },
                { provide: Location, useValue: { back: vi.fn() } },
            ],
        });
        const fixture: ComponentFixture<FavoritesComponent> = TestBed.createComponent(FavoritesComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(users.loadFavorites).toHaveBeenCalledWith(clientId);
        expect(observe).toHaveBeenCalled();
        const content = fixture.nativeElement.textContent as string;
        expect(content).toContain('Beyond page 1');
        expect(content).toContain('Unavailable in catalog');
        expect(content).toContain('Price unavailable');
        const buttons = fixture.nativeElement.querySelectorAll('button[aria-label^="Add "]') as NodeListOf<HTMLButtonElement>;
        expect(buttons.length).toBe(2);
        expect(buttons[0].disabled).toBe(false);
        expect(buttons[1].disabled).toBe(true);
        buttons[0].click();
        expect(orders.addItem).toHaveBeenCalledWith(clientId, { productId: foundId, quantity: 1 });
    });
});

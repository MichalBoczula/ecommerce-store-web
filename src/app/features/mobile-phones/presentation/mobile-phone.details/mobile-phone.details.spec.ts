import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { MobilePhoneDetails } from './mobile-phone.details';

const clientId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const productId = '11111111-1111-1111-1111-111111111111';

describe('mobile phone details', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('loads the route product and sends ID-only cart and favorite commands', async () => {
        const phone = { id: productId, commonDescription: { brand: 'Saved brand', name: 'Model' } };
        const phones = { details$: of(phone), loadById: vi.fn() };
        const users = { favorites: signal([]), loadFavorites: vi.fn(), addFavoriteByProductId: vi.fn(), removeFavorite: vi.fn() };
        const orders = { addItem: vi.fn() };
        TestBed.configureTestingModule({ imports: [MobilePhoneDetails], providers: [
            { provide: MobilePhonesFacade, useValue: phones },
            { provide: UsersFacade, useValue: users },
            { provide: OrdersFacade, useValue: orders },
            { provide: Location, useValue: { back: vi.fn() } },
            { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: productId }) } } },
        ] });
        const fixture = TestBed.createComponent(MobilePhoneDetails);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(phones.loadById).toHaveBeenCalledWith(productId);
        expect(users.loadFavorites).toHaveBeenCalledWith(clientId);
        expect(fixture.nativeElement.textContent).toContain('Saved brand Model');
        fixture.componentInstance.addToCart();
        fixture.componentInstance.toggleFavorite();
        expect(orders.addItem).toHaveBeenCalledWith(clientId, { productId, quantity: 1 });
        expect(users.addFavoriteByProductId).toHaveBeenCalledWith(clientId, productId);
    });
});

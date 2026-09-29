import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { MobilePhoneList } from './mobile-phone.list';

const clientId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const productId = '11111111-1111-1111-1111-111111111111';

describe('mobile phone list', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('loads products and favorites, wires cart action, and exposes a native details button', async () => {
        const phones = { items$: of([{ id: productId, name: 'Phone', isFavorite: false }]), load: vi.fn() };
        const users = { favorites: signal([]), loadFavorites: vi.fn(), addFavoriteByProductId: vi.fn(), removeFavorite: vi.fn() };
        const orders = { addItem: vi.fn() };
        const router = { navigate: vi.fn() };
        TestBed.configureTestingModule({ imports: [MobilePhoneList], providers: [
            { provide: MobilePhonesFacade, useValue: phones },
            { provide: UsersFacade, useValue: users },
            { provide: OrdersFacade, useValue: orders },
            { provide: Router, useValue: router },
        ] });
        const fixture = TestBed.createComponent(MobilePhoneList);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(phones.load).toHaveBeenCalledWith(15);
        expect(users.loadFavorites).toHaveBeenCalledWith(clientId);
        expect(fixture.nativeElement.textContent).toContain('Phone');

        const cartButton = fixture.nativeElement.querySelector('button[matButton="elevated"]') as HTMLButtonElement;
        cartButton.click();
        expect(orders.addItem).toHaveBeenCalledWith(clientId, { productId, quantity: 1 });
        expect(router.navigate).not.toHaveBeenCalled();

        const product = fixture.nativeElement.querySelector('button[aria-label^="View details"]') as HTMLButtonElement;
        expect(product.type).toBe('button');
        product.click();
        expect(router.navigate).toHaveBeenCalledWith(['/details', productId]);
    });
});

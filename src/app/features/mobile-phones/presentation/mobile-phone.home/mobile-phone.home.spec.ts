import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { MobilePhoneHome } from './mobile-phone.home';

describe('mobile phone home', () => {
    afterEach(() => TestBed.resetTestingModule());

    it.each([
        'https://photos.example.com/top-phone/Main.webp', null, '',
    ])('requests top products and renders their photo state (%s)', async mainPhoto => {
        const facade = { top$: of([{ id: 'phone-id', commonDescription: { name: 'Top phone', mainPhoto },
            price: { amount: 199, currency: 'USD' } }]), loadTop: vi.fn() };
        TestBed.configureTestingModule({ imports: [MobilePhoneHome], providers: [
            provideRouter([]), { provide: MobilePhonesFacade, useValue: facade },
        ] });
        const fixture = TestBed.createComponent(MobilePhoneHome);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(facade.loadTop).toHaveBeenCalledOnce();
        expect(fixture.nativeElement.textContent).toContain('Top phone');
        const image = fixture.nativeElement.querySelector('.image img') as HTMLImageElement | null;
        if (mainPhoto) {
            expect(image?.getAttribute('src')).toBe(mainPhoto);
            expect(image?.alt).toBe('Top phone');
        } else {
            expect(image).toBeNull();
            expect(fixture.nativeElement.querySelector('[role="img"]')?.getAttribute('aria-label'))
                .toBe('Photo unavailable for Top phone');
        }
    });
});

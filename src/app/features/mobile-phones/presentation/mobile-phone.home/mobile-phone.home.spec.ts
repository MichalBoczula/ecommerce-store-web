import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { MobilePhoneHome } from './mobile-phone.home';

describe('mobile phone home', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('requests and displays top products', async () => {
        const facade = { top$: of([{ id: 'phone-id', commonDescription: { name: 'Top phone' },
            price: { amount: 199, currency: 'USD' } }]), loadTop: vi.fn() };
        TestBed.configureTestingModule({ imports: [MobilePhoneHome], providers: [
            provideRouter([]), { provide: MobilePhonesFacade, useValue: facade },
        ] });
        const fixture = TestBed.createComponent(MobilePhoneHome);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(facade.loadTop).toHaveBeenCalledOnce();
        expect(fixture.nativeElement.textContent).toContain('Top phone');
    });
});

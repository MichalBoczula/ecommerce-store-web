import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { MobilePhoneFilter } from './mobile-phone.filter';

describe('mobile phone filter', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('submits selected criteria and navigates to the list', () => {
        const facade = { loadByFilter: vi.fn() };
        const router = { navigate: vi.fn() };
        TestBed.configureTestingModule({ imports: [MobilePhoneFilter], providers: [
            { provide: MobilePhonesFacade, useValue: facade },
            { provide: Router, useValue: router },
        ] });
        const fixture = TestBed.createComponent(MobilePhoneFilter);
        fixture.componentInstance.form.setValue({ brand: 'Samsung', minimalPrice: 100, maxPrice: 500 });
        fixture.componentInstance.onSubmit();

        expect(facade.loadByFilter).toHaveBeenCalledWith({ brand: 'Samsung', minimalPrice: 100, maximalPrice: 500 });
        expect(router.navigate).toHaveBeenCalledWith(['/list']);
    });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerContext } from '../../../../shared/application/customer-context';
import { CustomerProfileFacade } from '../../application/customer-profile.facade';
import { mapCustomerProfile } from '../../infrastructure/mappers/customer-profile.mapper';
import { profileDto } from '../../infrastructure/mappers/customer-profile.fixture';
import { CustomerProfileComponent } from './customer-profile';

const profile = mapCustomerProfile(profileDto);

describe('customer profile screen', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('loads a selected profile and submits the complete edited individual record', async () => {
        const facade = {
            profile: signal<typeof profile | null>(null),
            loadStatus: signal('idle'), saveStatus: signal('idle'), error: signal<string | null>(null),
            load: vi.fn(), save: vi.fn(), saveCompany: vi.fn(),
        };
        const context = { clientId: signal(profile.id), externalId: signal(profile.externalId),
            select: vi.fn(), clear: vi.fn() };
        TestBed.configureTestingModule({ imports: [CustomerProfileComponent], providers: [
            { provide: CustomerProfileFacade, useValue: facade },
            { provide: CustomerContext, useValue: context },
        ] });
        const fixture = TestBed.createComponent(CustomerProfileComponent);
        fixture.detectChanges();
        expect(facade.load).toHaveBeenCalledWith(profile.externalId);
        facade.profile.set(profile);
        facade.loadStatus.set('loaded');
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input[name=lastName]') as HTMLInputElement;
        input.value = 'Edited';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        const save = Array.from(fixture.nativeElement.querySelectorAll('button'))
            .find(button => (button as HTMLButtonElement).textContent?.includes('Save profile')) as HTMLButtonElement;
        expect(save.disabled).toBe(false);
        save.click();
        expect(facade.save).toHaveBeenCalledWith(profile.id, expect.objectContaining({
            lastName: 'Edited',
            billingAddress: profile.individual.billingAddress,
            shippingAddress: profile.individual.shippingAddress,
        }));
        expect(context.select).not.toHaveBeenCalled();
        const companyName = fixture.nativeElement.querySelector('input[name=companyName]') as HTMLInputElement;
        companyName.value = 'Updated Company';
        companyName.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        const saveCompany = Array.from(fixture.nativeElement.querySelectorAll('button'))
            .find(button => (button as HTMLButtonElement).textContent?.includes('Save company')) as HTMLButtonElement;
        saveCompany.click();
        expect(facade.saveCompany).toHaveBeenCalledWith(profile.id, expect.objectContaining({
            companyName: 'Updated Company', taxId: profile.companies[0].taxId,
        }));
        facade.saveStatus.set('conflict');
        facade.error.set('Reload before saving');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Reload before saving');
    });

    it('shows a missing profile and leaves the demo selection unchanged', () => {
        const facade = {
            profile: signal(null), loadStatus: signal('notFound'), saveStatus: signal('idle'),
            error: signal('Customer profile was not found.'),
            load: vi.fn(), save: vi.fn(), saveCompany: vi.fn(),
        };
        const context = { clientId: signal<string | null>(null), externalId: signal<string | null>(null),
            select: vi.fn(), clear: vi.fn() };
        TestBed.configureTestingModule({ imports: [CustomerProfileComponent], providers: [
            { provide: CustomerProfileFacade, useValue: facade },
            { provide: CustomerContext, useValue: context },
        ] });
        const fixture = TestBed.createComponent(CustomerProfileComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('not found');
        expect(context.select).not.toHaveBeenCalled();
    });
});

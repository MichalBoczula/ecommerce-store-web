import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { MobilePhoneFilter } from './mobile-phone.filter';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { MobilePhonesBrand } from '../../../../shared/api/nswag/api-client';

class FacadeStub {
  loadByFilter = jasmine.createSpy('loadByFilter');
}

describe('MobilePhoneFilter (component)', () => {
  let facade: FacadeStub;
  let router: Router;

  beforeEach(async () => {
    facade = new FacadeStub();

    await TestBed.configureTestingModule({
      imports: [MobilePhoneFilter],
      providers: [provideRouter([]), { provide: MobilePhonesFacade, useValue: facade }],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(MobilePhoneFilter);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders all filter controls and submit button', () => {
    const fixture = TestBed.createComponent(MobilePhoneFilter);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form.filter-form');
    expect(form).toBeTruthy();

    const inputFields = fixture.nativeElement.querySelectorAll('input[matinput]');
    expect(inputFields.length).toBe(2);

    const brandSelect = fixture.nativeElement.querySelector('mat-select[formControlName="brand"]');
    expect(brandSelect).toBeTruthy();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as
      | HTMLButtonElement
      | null;
    expect(submitButton).toBeTruthy();
    expect(submitButton?.textContent?.trim()).toContain('Apply filters');
  });

  it('submits form values via facade and navigates to /list', () => {
    const fixture = TestBed.createComponent(MobilePhoneFilter);
    const navigateSpy = spyOn(router, 'navigate');

    fixture.detectChanges();

    fixture.componentInstance.form.patchValue({
      brand: MobilePhonesBrand._0,
      minimalPrice: 100,
      maxPrice: 1200,
    });

    fixture.componentInstance.onSubmit();

    expect(facade.loadByFilter).toHaveBeenCalledTimes(1);
    expect(facade.loadByFilter).toHaveBeenCalledWith(
      jasmine.objectContaining({
        brand: MobilePhonesBrand._0,
        minimalPrice: 100,
        maximalPrice: 1200,
      }),
    );

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/list']);
  });

  it('maps empty form values to undefined in filter payload', () => {
    const fixture = TestBed.createComponent(MobilePhoneFilter);
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();

    const [filterArg] = facade.loadByFilter.calls.mostRecent().args;
    expect(filterArg.brand).toBeUndefined();
    expect(filterArg.minimalPrice).toBeUndefined();
    expect(filterArg.maximalPrice).toBeUndefined();
  });
});

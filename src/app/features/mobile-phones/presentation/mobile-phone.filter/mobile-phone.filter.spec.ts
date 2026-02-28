import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilePhoneFilter } from './mobile-phone.filter';

describe('MobilePhoneFilter', () => {
  let component: MobilePhoneFilter;
  let fixture: ComponentFixture<MobilePhoneFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePhoneFilter]
    }).compileComponents();

    fixture = TestBed.createComponent(MobilePhoneFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send form body on submit', () => {
    const sendSpy = spyOn(component, 'send');

    component.form.patchValue({
      brand: 'Apple',
      minimalPrice: 100,
      maxPrice: 1200
    });

    component.onSubmit();

    expect(sendSpy).toHaveBeenCalledWith({
      brand: 'Apple',
      minimalPrice: 100,
      maxPrice: 1200
    });
  });
});

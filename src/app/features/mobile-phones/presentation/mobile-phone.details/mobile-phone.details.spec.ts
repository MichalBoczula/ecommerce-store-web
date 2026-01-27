import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilePhoneDetails } from './mobile-phone.details';

describe('MobilePhoneDetails', () => {
  let component: MobilePhoneDetails;
  let fixture: ComponentFixture<MobilePhoneDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePhoneDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilePhoneDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

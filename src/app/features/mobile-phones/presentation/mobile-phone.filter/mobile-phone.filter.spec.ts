import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilePhoneFilter } from './mobile-phone.filter';

describe('MobilePhoneFilter', () => {
  let component: MobilePhoneFilter;
  let fixture: ComponentFixture<MobilePhoneFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePhoneFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilePhoneFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

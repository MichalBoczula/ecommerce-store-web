import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilePhoneHome } from './mobile-phone.home';

describe('MobilePhoneHome', () => {
  let component: MobilePhoneHome;
  let fixture: ComponentFixture<MobilePhoneHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePhoneHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilePhoneHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

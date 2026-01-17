import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilePhoneList } from './mobile-phone.list';

describe('MobilePhoneList', () => {
  let component: MobilePhoneList;
  let fixture: ComponentFixture<MobilePhoneList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePhoneList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilePhoneList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

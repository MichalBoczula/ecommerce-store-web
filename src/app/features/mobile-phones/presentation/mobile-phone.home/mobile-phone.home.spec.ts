import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MobilePhoneHome } from './mobile-phone.home';

describe('MobilePhoneHome', () => {
  let fixture: ComponentFixture<MobilePhoneHome>;
  let component: MobilePhoneHome;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePhoneHome],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) },
            paramMap: undefined,
            queryParamMap: undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobilePhoneHome);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

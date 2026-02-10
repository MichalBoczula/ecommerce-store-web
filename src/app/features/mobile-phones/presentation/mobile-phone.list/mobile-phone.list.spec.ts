import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MobilePhoneList } from './mobile-phone.list';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade'; // <- dopasuj ścieżkę jeśli inna

class MobilePhonesFacadeStub {
  // dajemy minimalne strumienie, żeby template się nie wywalił
  // (jeśli komponent używa innych nazw, zmień je 1:1)
  readonly items$ = of([]);
  readonly isLoading$ = of(false);
  readonly error$ = of(null);

  load = jasmine.createSpy('load');
}

describe('MobilePhoneList', () => {
  let component: MobilePhoneList;
  let fixture: ComponentFixture<MobilePhoneList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePhoneList],
      providers: [
        provideRouter([]),
        { provide: MobilePhonesFacade, useClass: MobilePhonesFacadeStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobilePhoneList);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { MobilePhoneList } from './mobile-phone.list';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';

import type { MobilePhoneDto } from '../../../../shared/api/nswag/api-client';

function makePhone(patch: Partial<MobilePhoneDto> = {}): MobilePhoneDto {
  return {
    id: '1',
    name: 'iPhone 15',
    screenSizeInches: 6.1 as any,
    camera: '48 MP',
    displayType: 'A17 Pro',
    price: {
      amount: 4999,
      currency: 'PLN',
    } as any,
    ...patch,
  } as MobilePhoneDto;
}

class FacadeStub {
  private readonly _items$ = new BehaviorSubject<MobilePhoneDto[] | null>([]);
  readonly items$ = this._items$.asObservable();

  load = jasmine.createSpy('load');

  emit(items: MobilePhoneDto[] | null) {
    this._items$.next(items);
  }
}

describe('MobilePhoneList (component)', () => {
  let facade: FacadeStub;
  let router: Router;

  beforeEach(async () => {
    facade = new FacadeStub();

    await TestBed.configureTestingModule({
      imports: [MobilePhoneList],
      providers: [provideRouter([]), { provide: MobilePhonesFacade, useValue: facade }],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('calls facade.load(15) on init', () => {
    const fixture = TestBed.createComponent(MobilePhoneList);
    fixture.detectChanges();

    expect(facade.load).toHaveBeenCalledTimes(1);
    expect(facade.load).toHaveBeenCalledWith(15);
  });

  it('renders list items with phone basic data', fakeAsync(() => {
    const fixture = TestBed.createComponent(MobilePhoneList);
    facade.emit([
      makePhone(),
      makePhone({
        id: '2',
        name: 'Galaxy S24',
        screenSizeInches: 6.2 as any,
        camera: '50 MP',
        displayType: 'Snapdragon 8 Gen 3',
        price: { amount: 4299, currency: 'PLN' } as any,
      }),
    ]);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('section.container');
    expect(cards.length).toBe(2);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('iPhone 15');
    expect(text).toContain('6.1');
    expect(text).toContain('48 MP');
    expect(text).toContain('A17 Pro');
    expect(text).toContain('4999 PLN');

    expect(text).toContain('Galaxy S24');
    expect(text).toContain('6.2');
    expect(text).toContain('50 MP');
    expect(text).toContain('Snapdragon 8 Gen 3');
    expect(text).toContain('4299 PLN');
  }));

  it('renders fallback model name when phone.name is empty', fakeAsync(() => {
    const fixture = TestBed.createComponent(MobilePhoneList);
    facade.emit([makePhone({ id: '3', name: undefined as any })]);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Unknown model');
  }));

  it('opens details route when clicking on a phone card', () => {
    const fixture = TestBed.createComponent(MobilePhoneList);
    const navigateSpy = spyOn(router, 'navigate');

    facade.emit([makePhone({ id: 'abc-123' })]);
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector('section.container') as HTMLElement;
    firstCard.click();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/details', 'abc-123']);
  });
});
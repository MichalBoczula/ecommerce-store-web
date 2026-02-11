import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MobilePhoneDetails } from './mobile-phone.details';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';

import type {
    MobilePhoneDetailsDto,
    CommonDescriptionDto,
    ElectronicDetailsDto,
    ConnectivityDto,
    SatelliteNavigationSystemDto,
    SensorsDto,
    MoneyDto,
} from '../../../../shared/api/nswag/api-client';

function makeDto(patch: Partial<MobilePhoneDetailsDto> = {}): MobilePhoneDetailsDto {
    return {
        commonDescription: { description: '' } as CommonDescriptionDto,
        electronicDetails: {} as ElectronicDetailsDto,
        connectivity: {} as ConnectivityDto,
        satelliteNavigationSystems: {} as SatelliteNavigationSystemDto,
        sensors: {} as SensorsDto,
        camera: '',
        price: {} as MoneyDto,
        fingerPrint: false,
        faceId: false,
        description2: '',
        description3: '',
        categoryId: '',
        id: 'id-1',
        isActive: true,
        ...patch,
    } as MobilePhoneDetailsDto;
}

class FacadeStub {
    private readonly _details$ = new BehaviorSubject<MobilePhoneDetailsDto | null>(null);
    readonly details$ = this._details$.asObservable();

    loadById = jasmine.createSpy('loadById');

    emit(patch: Partial<MobilePhoneDetailsDto>) {
        this._details$.next(makeDto(patch));
    }

    clear() {
        this._details$.next(null);
    }
}

describe('MobilePhoneDetails (component)', () => {
    let facade: FacadeStub;

    beforeEach(async () => {
        facade = new FacadeStub();

        await TestBed.configureTestingModule({
            imports: [MobilePhoneDetails],
            providers: [
                { provide: MobilePhonesFacade, useValue: facade },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '123' }) },
                    },
                },
            ],
        }).compileComponents();
    });

    it('calls facade.loadById with id from route on init', () => {
        const fixture = TestBed.createComponent(MobilePhoneDetails);
        fixture.detectChanges();

        expect(facade.loadById).toHaveBeenCalledTimes(1);
        expect(facade.loadById).toHaveBeenCalledWith('123');
    });

    it('renders Specification title always', () => {
        const fixture = TestBed.createComponent(MobilePhoneDetails);
        fixture.detectChanges();

        const h2: HTMLElement | null = fixture.nativeElement.querySelector('h2.title');
        expect(h2).toBeTruthy();
        expect((h2?.textContent ?? '').trim()).toBe('Specification');
    });

    it('renders text spec row (Cameras/CPU) and bool spec row (FingerPrint)', fakeAsync(() => {
        const fixture = TestBed.createComponent(MobilePhoneDetails);
        fixture.detectChanges();

        facade.emit({
            camera: '50MP',
            fingerPrint: true,
            electronicDetails: { cpu: 'Snapdragon' } as ElectronicDetailsDto,
        });

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const text = fixture.nativeElement.textContent as string;

        expect(text).toContain('Cameras');
        expect(text).toContain('50MP');

        expect(text).toContain('CPU');
        expect(text).toContain('Snapdragon');

        expect(text).toContain('FingerPrint');

        const checkboxInput = fixture.debugElement.query(
            By.css('mat-checkbox.spec-checkbox input[type="checkbox"]')
        )?.nativeElement as HTMLInputElement | undefined;

        const plainCheckbox = fixture.debugElement.query(
            By.css('input.spec-checkbox[type="checkbox"]')
        )?.nativeElement as HTMLInputElement | undefined;

        const input = checkboxInput ?? plainCheckbox;

        expect(input).toBeTruthy();
        expect(input!.disabled).toBeTrue();
        expect(input!.checked).toBeTrue();
    }));

    it('renders value-line for text row (single string becomes one line)', fakeAsync(() => {
        const fixture = TestBed.createComponent(MobilePhoneDetails);
        fixture.detectChanges();

        facade.emit({ camera: '12MP' });

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const nodeList = fixture.nativeElement.querySelectorAll('.value-line') as NodeListOf<HTMLElement>;
        const lines = Array.from(nodeList).map(el => (el.textContent ?? '').trim());

        expect(lines).toContain('12MP');
    }));

    it('renders multiple value lines for string[] (if your UI supports it)', fakeAsync(() => {
        const fixture = TestBed.createComponent(MobilePhoneDetails);
        fixture.detectChanges();

        facade.emit({ camera: (['12MP', '8MP'] as any) });

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const nodeList = fixture.nativeElement.querySelectorAll('.value-line') as NodeListOf<HTMLElement>;
        const lines = Array.from(nodeList).map(el => (el.textContent ?? '').trim());

        expect(lines).toContain('12MP');
        expect(lines).toContain('8MP');
    }));

    it('renders description sections only when description is not empty', fakeAsync(() => {
        const fixture = TestBed.createComponent(MobilePhoneDetails);
        fixture.detectChanges();

        facade.emit({
            commonDescription: { description: 'desc 1' } as CommonDescriptionDto,
            description2: '   ',
            description3: 'desc 3',
        });

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const container1: HTMLElement | null = fixture.nativeElement.querySelector('section.container');
        expect(container1).toBeTruthy();
        expect(container1!.textContent).toContain('desc 1');

        const reverse: HTMLElement | null = fixture.nativeElement.querySelector('section.reverse-container');
        expect(reverse).toBeFalsy();

        expect(fixture.nativeElement.textContent).toContain('desc 3');
    }));

    it('renders swiper container and correct number of slides', () => {
        const fixture = TestBed.createComponent(MobilePhoneDetails);
        fixture.detectChanges();

        const swiper = fixture.nativeElement.querySelector('swiper-container');
        expect(swiper).toBeTruthy();

        const slides = fixture.nativeElement.querySelectorAll('swiper-slide');
        expect(slides.length).toBe(3);
    });
});

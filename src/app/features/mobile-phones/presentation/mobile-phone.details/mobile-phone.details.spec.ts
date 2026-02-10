// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { TestBed } from '@angular/core/testing';
// import { BehaviorSubject } from 'rxjs';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// import { By } from '@angular/platform-browser';

// import { MobilePhoneDetails } from './mobile-phone.details';
// import { MobilePhonesFacade } from '../../application/mobile-phones.facade';

// import type {
//   MobilePhoneDetailsDto,
//   CommonDescriptionDto,
//   ElectronicDetailsDto,
//   ConnectivityDto,
//   SatelliteNavigationSystemDto,
//   SensorsDto,
//   MoneyDto,
// } from '../../../../shared/api/nswag/api-client';

// function makeDto(patch: Partial<MobilePhoneDetailsDto> = {}): MobilePhoneDetailsDto {
//   return {
//     commonDescription: { description: '' } as CommonDescriptionDto,
//     electronicDetails: {} as ElectronicDetailsDto,
//     connectivity: {} as ConnectivityDto,
//     satelliteNavigationSystems: {} as SatelliteNavigationSystemDto,
//     sensors: {} as SensorsDto,
//     camera: '',
//     price: {} as MoneyDto,
//     fingerPrint: false,
//     faceId: false,
//     description2: '',
//     description3: '',
//     categoryId: '',
//     id: 'id-1',
//     isActive: true,
//     ...patch,
//   } as MobilePhoneDetailsDto;
// }

// class FacadeStub {
//   private readonly _details$ = new BehaviorSubject<MobilePhoneDetailsDto | null>(null);
//   readonly details$ = this._details$.asObservable();

//   loadById = vi.fn();

//   emit(patch: Partial<MobilePhoneDetailsDto>) {
//     this._details$.next(makeDto(patch));
//   }

//   clear() {
//     this._details$.next(null);
//   }
// }

// describe('MobilePhoneDetails (component)', () => {
//   let facade: FacadeStub;

//   beforeEach(async () => {
//     TestBed.resetTestingModule();
//     facade = new FacadeStub();

//     TestBed.overrideComponent(MobilePhoneDetails, {
//       set: {
//         template: `
//         <article class="grid-list">
//           <swiper-container class="swiper" slides-per-view="1" loop="true" navigation="true" pagination="true">
//             <swiper-slide *ngFor="let img of images">
//               <img class="carousel-img" [src]="img" alt="Shiba Inu" />
//             </swiper-slide>
//           </swiper-container>

//           <ng-container *ngIf="(descriptions$ | async) as descriptions">
//             <section class="container" *ngIf="isNotNullOrWhiteSpace(descriptions[0])">
//               <div class="content">{{ descriptions[0] }}</div>
//             </section>

//             <section class="reverse-container" *ngIf="isNotNullOrWhiteSpace(descriptions[1])">
//               <div class="reverse-content">{{ descriptions[1] }}</div>
//             </section>

//             <section class="container" *ngIf="isNotNullOrWhiteSpace(descriptions[2])">
//               <div class="content">{{ descriptions[2] }}</div>
//             </section>
//           </ng-container>

//           <h2 class="title">Specification</h2>

//           <div class="spec-table">
//             <div class="spec-row" *ngFor="let row of ((specRows$ | async) ?? [])">
//               <div class="label">{{ row.label }}</div>

//               <ng-container [ngSwitch]="row.kind">
//                 <input
//                   *ngSwitchCase="'bool'"
//                   class="spec-checkbox"
//                   type="checkbox"
//                   [checked]="row.value"
//                   disabled
//                 />

//                 <ng-container *ngSwitchDefault>
//                   <div class="value-line" *ngFor="let v of asLines(row.value)">{{ v }}</div>
//                 </ng-container>
//               </ng-container>
//             </div>
//           </div>
//         </article>
//       `,
//         templateUrl: undefined as any,
//         styleUrl: undefined as any,
//         styleUrls: [] as any,
//         styles: [],
//       } as any,
//     });

//     await TestBed.configureTestingModule({
//       imports: [MobilePhoneDetails],
//       providers: [
//         { provide: MobilePhonesFacade, useValue: facade },
//         {
//           provide: ActivatedRoute,
//           useValue: { snapshot: { paramMap: convertToParamMap({ id: '123' }) } },
//         },
//       ],
//     }).compileComponents();
//   });

//   it('calls facade.loadById with id from route on init', () => {
//     const fixture = TestBed.createComponent(MobilePhoneDetails);
//     fixture.detectChanges();

//     expect(facade.loadById).toHaveBeenCalledTimes(1);
//     expect(facade.loadById).toHaveBeenCalledWith('123');
//   });

//   it('renders Specification title always', () => {
//     const fixture = TestBed.createComponent(MobilePhoneDetails);
//     fixture.detectChanges();

//     const h2: HTMLElement | null = fixture.nativeElement.querySelector('h2.title');
//     expect(h2?.textContent?.trim()).toBe('Specification');
//   });

//   it('renders text spec row (Cameras/CPU) and bool spec row (FingerPrint)', () => {
//     const fixture = TestBed.createComponent(MobilePhoneDetails);
//     fixture.detectChanges();

//     facade.emit({
//       camera: '50MP',
//       fingerPrint: true,
//       electronicDetails: { cpu: 'Snapdragon' } as ElectronicDetailsDto,
//     });

//     fixture.detectChanges();

//     expect(fixture.nativeElement.textContent).toContain('Cameras');
//     expect(fixture.nativeElement.textContent).toContain('50MP');

//     expect(fixture.nativeElement.textContent).toContain('CPU');
//     expect(fixture.nativeElement.textContent).toContain('Snapdragon');

//     expect(fixture.nativeElement.textContent).toContain('FingerPrint');

//     const checkboxDe = fixture.debugElement.query(By.css('input.spec-checkbox'));
//     expect(checkboxDe).toBeTruthy();

//     const checkbox = checkboxDe.nativeElement as HTMLInputElement;
//     expect(checkbox.disabled).toBe(true);
//     expect(checkbox.checked).toBe(true);
//   });

//   it('renders value-line for text row (single string becomes one line)', () => {
//     const fixture = TestBed.createComponent(MobilePhoneDetails);
//     fixture.detectChanges();

//     facade.emit({ camera: '12MP' });
//     fixture.detectChanges();

//     const nodeList = fixture.nativeElement.querySelectorAll('.value-line') as NodeListOf<HTMLElement>;
//     const lines = Array.from(nodeList).map(el => (el.textContent ?? '').trim());

//     expect(lines).toContain('12MP');
//   });

//   it('renders description sections only when description is not empty', () => {
//     const fixture = TestBed.createComponent(MobilePhoneDetails);
//     fixture.detectChanges();

//     facade.emit({
//       commonDescription: { description: 'desc 1' } as CommonDescriptionDto,
//       description2: '   ',
//       description3: 'desc 3',
//     });

//     fixture.detectChanges();

//     const container1: HTMLElement | null = fixture.nativeElement.querySelector('section.container');
//     expect(container1).toBeTruthy();
//     expect(container1?.textContent).toContain('desc 1');

//     const reverse: HTMLElement | null = fixture.nativeElement.querySelector('section.reverse-container');
//     expect(reverse).toBeFalsy();

//     const containers = fixture.nativeElement.querySelectorAll('section.container');
//     expect(containers.length).toBeGreaterThanOrEqual(2);
//     expect(fixture.nativeElement.textContent).toContain('desc 3');
//   });

//   it('renders swiper container and correct number of slides', () => {
//     const fixture = TestBed.createComponent(MobilePhoneDetails);
//     fixture.detectChanges();

//     const swiper = fixture.nativeElement.querySelector('swiper-container');
//     expect(swiper).toBeTruthy();

//     const slides = fixture.nativeElement.querySelectorAll('swiper-slide');
//     expect(slides.length).toBe(3);
//   });
// });

import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { MobilePhoneHome } from './mobile-phone.home';

describe('MobilePhoneHome (component)', () => {
  let router: Router;
  const facade = {
    top$: of([]),
    loadTop: jasmine.createSpy('loadTop'),
  } satisfies Partial<MobilePhonesFacade>;

  beforeEach(async () => {
    facade.loadTop.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MobilePhoneHome],
      providers: [provideRouter([]), { provide: MobilePhonesFacade, useValue: facade }],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(MobilePhoneHome);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(facade.loadTop).toHaveBeenCalledTimes(1);
  });

  it('renders 3 preview cards with images', () => {
    const fixture = TestBed.createComponent(MobilePhoneHome);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('article.grid-list section.container');
    expect(cards.length).toBe(3);

    const images = fixture.nativeElement.querySelectorAll('article.grid-list section.container img');
    expect(images.length).toBe(3);

    images.forEach((img: HTMLImageElement) => {
      expect(img.src).toContain('shiba2.jpg');
      expect(img.alt).toBe('Photo of a Shiba Inu');
    });
  });

  it('renders CTA button with text and icon', () => {
    const fixture = TestBed.createComponent(MobilePhoneHome);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.home-btn') as HTMLButtonElement | null;
    expect(button).toBeTruthy();

    const buttonText = (button?.textContent ?? '').replace(/\s+/g, ' ').trim();
    expect(buttonText).toContain('Check more ...');

    const icon = button?.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe('home');
  });

  it('navigates to /list when CTA button is clicked', () => {
    const fixture = TestBed.createComponent(MobilePhoneHome);
    const navigateByUrlSpy = spyOn(router, 'navigateByUrl');

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.home-btn') as HTMLButtonElement;
    button.click();

    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
    const [calledUrl] = navigateByUrlSpy.calls.mostRecent().args;
    expect(calledUrl.toString()).toContain('/list');
  });
});

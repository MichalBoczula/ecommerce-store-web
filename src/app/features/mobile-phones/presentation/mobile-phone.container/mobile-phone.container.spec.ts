import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { of } from 'rxjs';

import { MobilePhoneContainer } from './mobile-phone.container';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';

describe('MobilePhoneContainer (component)', () => {
  const facade = {
    items$: of([]),
    loadByFilter: jasmine.createSpy('loadByFilter'),
  } satisfies Partial<MobilePhonesFacade>;

  beforeEach(async () => {
    facade.loadByFilter.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MobilePhoneContainer],
      providers: [provideRouter([]), { provide: MobilePhonesFacade, useValue: facade }],
    }).compileComponents();
  });

  it('creates the component with default sidenav state', () => {
    const fixture = TestBed.createComponent(MobilePhoneContainer);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.sidenavMode()).toBe('over');
    expect(component.sidenavOpened()).toBeFalse();
  });

  it('renders shell layout elements', () => {
    const fixture = TestBed.createComponent(MobilePhoneContainer);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-sidenav-container.container')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('mat-toolbar.toolbar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-mobile-phone-filter')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('eCommerce');
    expect(text).toContain('Menu');
  });

  it('toggles sidenav when clicking brand and menu button', () => {
    const fixture = TestBed.createComponent(MobilePhoneContainer);
    fixture.detectChanges();

    const sidenav = fixture.debugElement.query(By.directive(MatSidenav)).componentInstance as MatSidenav;
    const toggleSpy = spyOn(sidenav, 'toggle').and.callFake(() => Promise.resolve('open'));

    const brand = fixture.nativeElement.querySelector('.brand') as HTMLElement;
    brand.click();

    const menuButton = fixture.nativeElement.querySelector('button.menu') as HTMLButtonElement;
    menuButton.click();

    expect(toggleSpy).toHaveBeenCalledTimes(2);
  });

  it('closes sidenav in onNavClick handler', () => {
    const fixture = TestBed.createComponent(MobilePhoneContainer);
    const component = fixture.componentInstance;
    const sidenav = { close: jasmine.createSpy('close') };

    component.onNavClick(sidenav);

    expect(sidenav.close).toHaveBeenCalledTimes(1);
  });
});

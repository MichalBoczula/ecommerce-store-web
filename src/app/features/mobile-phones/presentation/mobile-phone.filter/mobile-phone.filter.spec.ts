import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobilePhoneFilter } from './mobile-phone.filter';

function setup(query = {}) {
  const params = new BehaviorSubject(convertToParamMap(query));
  const router = { navigate: vi.fn().mockResolvedValue(true) };
  TestBed.configureTestingModule({
    imports: [MobilePhoneFilter],
    providers: [
      { provide: ActivatedRoute, useValue: { queryParamMap: params } },
      { provide: Router, useValue: router },
    ],
  });
  const fixture = TestBed.createComponent(MobilePhoneFilter);
  fixture.detectChanges();
  return { fixture, router, params };
}

describe('mobile phone filter', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('submits brand and price criteria through the catalog URL', () => {
    const { fixture, router } = setup();
    const applied = vi.fn();
    fixture.componentInstance.applied.subscribe(applied);
    fixture.componentInstance.form.setValue({ brand: 'Samsung', minimalPrice: 0, maxPrice: 500 });
    fixture.componentInstance.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/list'], {
      queryParams: { brand: 'Samsung', minPrice: 0, maxPrice: 500 },
    });
    expect(applied).toHaveBeenCalledOnce();
  });

  it('keeps desktop and drawer controls aligned with navigation and cleared filters', () => {
    const { fixture, params, router } = setup({ brand: 'Xiaomi', minPrice: '1000' });
    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      brand: 'Xiaomi',
      minimalPrice: 1000,
      maxPrice: null,
    });
    params.next(convertToParamMap({ brand: 'Apple', maxPrice: '4000' }));
    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      brand: 'Apple',
      minimalPrice: null,
      maxPrice: 4000,
    });
    params.next(convertToParamMap({}));
    fixture.componentInstance.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/list'], {
      queryParams: { brand: null, minPrice: null, maxPrice: null },
    });
  });

  it.each([
    { minimalPrice: -1, maxPrice: 100 },
    { minimalPrice: 500, maxPrice: 100 },
  ])('blocks invalid price criteria (%o)', (values) => {
    const { fixture, router } = setup();
    const applied = vi.fn();
    fixture.componentInstance.applied.subscribe(applied);
    fixture.componentInstance.form.patchValue(values);
    fixture.componentInstance.onSubmit();
    fixture.detectChanges();
    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(applied).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });
});

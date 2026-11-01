import { ParamMap } from '@angular/router';
import { FilterMobilePhone } from '../../domain/model/filter-mobile-phones';
import { MobilePhonesBrand } from '../../domain/model/mobile-phones-brand';

export const catalogBrands = Object.values(MobilePhonesBrand);

function priceParameter(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

export function readCatalogFilter(params: ParamMap): FilterMobilePhone {
  const brand = catalogBrands.find((value) => value === params.get('brand'));
  let minimalPrice = priceParameter(params.get('minPrice'));
  let maximalPrice = priceParameter(params.get('maxPrice'));
  if (minimalPrice !== undefined && maximalPrice !== undefined && minimalPrice > maximalPrice) {
    minimalPrice = undefined;
    maximalPrice = undefined;
  }
  return { brand, minimalPrice, maximalPrice };
}

export function catalogFilterQuery(filter: FilterMobilePhone) {
  return {
    brand: filter.brand ?? null,
    minPrice: filter.minimalPrice ?? null,
    maxPrice: filter.maximalPrice ?? null,
  };
}

export function hasCatalogFilter(filter: FilterMobilePhone): boolean {
  return !!filter.brand || filter.minimalPrice != null || filter.maximalPrice != null;
}

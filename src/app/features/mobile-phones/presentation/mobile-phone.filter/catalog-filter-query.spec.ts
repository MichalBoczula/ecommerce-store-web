import { convertToParamMap } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { catalogFilterQuery, hasCatalogFilter, readCatalogFilter } from './catalog-filter-query';

describe('catalog URL criteria', () => {
  it('keeps known brands, decimals and zero bounds', () => {
    const filter = readCatalogFilter(
      convertToParamMap({ brand: 'Apple', minPrice: '0', maxPrice: '3499.99' }),
    );
    expect(filter).toEqual({ brand: 'Apple', minimalPrice: 0, maximalPrice: 3499.99 });
    expect(hasCatalogFilter(filter)).toBe(true);
    expect(catalogFilterQuery(filter)).toEqual({ brand: 'Apple', minPrice: 0, maxPrice: 3499.99 });
  });
  it.each(['NaN', 'Infinity', '-10', 'abc', ' '])(
    'ignores unsupported brands and invalid prices (%s)',
    (value) => {
      const filter = readCatalogFilter(
        convertToParamMap({ brand: 'Other', minPrice: value, maxPrice: value }),
      );
      expect(hasCatalogFilter(filter)).toBe(false);
    },
  );
  it('rejects an inverted URL range and clears all criteria without inventing values', () => {
    expect(
      hasCatalogFilter(readCatalogFilter(convertToParamMap({ minPrice: '500', maxPrice: '10' }))),
    ).toBe(false);
    expect(catalogFilterQuery({})).toEqual({ brand: null, minPrice: null, maxPrice: null });
  });
});

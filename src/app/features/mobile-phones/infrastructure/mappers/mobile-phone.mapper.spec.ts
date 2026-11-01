import { describe, expect, it } from 'vitest';
import { mapTopMobilePhoneDtoToTopMobilePhone } from './mobile-phone.mapper';

describe('top phone money mapping', () => {
  it('preserves supplied amounts and currencies, including zero', () => {
    expect(
      mapTopMobilePhoneDtoToTopMobilePhone({ price: { amount: 0, currency: 'PLN' } }).price,
    ).toEqual({ amount: 0, currency: 'PLN' });
    expect(
      mapTopMobilePhoneDtoToTopMobilePhone({ price: { amount: 45.5, currency: 'EUR' } }).price,
    ).toEqual({ amount: 45.5, currency: 'EUR' });
  });
  it('preserves missing money without creating a zero price or USD currency', () => {
    expect(mapTopMobilePhoneDtoToTopMobilePhone({ price: {} }).price).toEqual({
      amount: null,
      currency: null,
    });
    expect(mapTopMobilePhoneDtoToTopMobilePhone({}).price).toBeNull();
  });
});

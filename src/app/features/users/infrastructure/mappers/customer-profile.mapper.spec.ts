import { describe, expect, it } from 'vitest';
import { profileDto } from './customer-profile.fixture';
import { mapCustomerProfile, mapCompanyRequest, mapIndividualRequest } from './customer-profile.mapper';

describe('customer profile mapper', () => {
    it('maps the real individual and company billing addresses', () => {
        const result = mapCustomerProfile(profileDto);
        expect(result.id).toBe(profileDto.id);
        expect(result.individual.shippingAddress.apartmentNumber).toBe('');
        expect(result.companies[0].taxId).toBe('1234567890');
        expect(result.companies[0].shippingAddress.street).toBe('Warehouse');
        expect(mapCompanyRequest(result.companies[0]).companyName).toBe('Example Ltd');
        expect(result.updatedAt).toEqual(new Date('2026-09-29T12:00:00Z'));
        expect(mapIndividualRequest(result.individual)).toEqual({ individual: {
            ...result.individual,
            billingAddress: result.individual.billingAddress,
            shippingAddress: result.individual.shippingAddress,
        } });
    });

    it('rejects an incomplete individual response rather than inventing invoice data', () => {
        expect(() => mapCustomerProfile({ ...profileDto, individual: null })).toThrow('individual');
        expect(() => mapCustomerProfile({ ...profileDto, individual: {
            ...profileDto.individual, billingAddress: null,
        } })).toThrow('billingAddress');
    });
});

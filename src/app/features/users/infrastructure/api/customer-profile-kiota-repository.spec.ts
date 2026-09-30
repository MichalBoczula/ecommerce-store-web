import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { profileDto } from '../mappers/customer-profile.fixture';
import { CustomerProfileKiotaRepository, ProfileConflictError, ProfileNotFoundError } from './customer-profile-kiota-repository';

const body = {
    ...profileDto, updatedAt: '2026-09-29T12:00:00Z',
};

describe('customer profile Kiota repository', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('reads by external ID and updates individual fields by GUID through the BFF', async () => {
        const calls: { url: string; method: string; body?: string }[] = [];
        vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
            const data = init.body;
            calls.push({ url, method: init.method ?? 'GET', body: data
                ? new TextDecoder().decode(data as Uint8Array) : undefined });
            return new Response(JSON.stringify(body),
                { status: 200, headers: { 'content-type': 'application/json' } });
        }));
        const repository = new CustomerProfileKiotaRepository();
        const profile = await firstValueFrom(repository.getByExternalId('demo-external-1'));
        await firstValueFrom(repository.updateIndividual(profile.id, profile.individual));
        await firstValueFrom(repository.updateCompany(profile.id, profile.companies[0]));
        expect(calls.map(call => [call.url, call.method])).toEqual([
            ['/backend/customers/external/demo-external-1', 'GET'],
            [`/backend/customers/${profile.id}/individual`, 'PUT'],
            [`/backend/customers/${profile.id}/companies/${profile.companies[0].id}`, 'PUT'],
        ]);
        expect(JSON.parse(calls[1].body ?? '{}')).toEqual({ individual: {
            ...profile.individual,
        } });
        expect(JSON.parse(calls[2].body ?? '{}')).toEqual({
            companyName: 'Example Ltd', taxId: '1234567890',
            billingAddress: profile.companies[0].billingAddress,
            shippingAddress: profile.companies[0].shippingAddress,
        });
    });

    it('maps 404 and update conflict to distinct states', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 404, title: 'Not Found' }),
            { status: 404, headers: { 'content-type': 'application/problem+json' } })));
        const repository = new CustomerProfileKiotaRepository();
        await expect(firstValueFrom(repository.getByExternalId('unknown'))).rejects.toBeInstanceOf(ProfileNotFoundError);
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 409, title: 'Conflict' }),
            { status: 409, headers: { 'content-type': 'application/problem+json' } })));
        await expect(firstValueFrom(repository.updateIndividual(profileDto.id!, mapProfileIndividual())))
            .rejects.toBeInstanceOf(ProfileConflictError);
    });
});

function mapProfileIndividual() {
    return {
        firstName: 'Mike', lastName: 'Customer', email: 'mike@example.com', phone: '123456789',
        billingAddress: { street: 'Main', buildingNumber: '10', apartmentNumber: '2', city: 'Warsaw', postalCode: '00-001' },
        shippingAddress: { street: 'Shipping', buildingNumber: '11', apartmentNumber: '', city: 'Krakow', postalCode: '30-001' },
    };
}

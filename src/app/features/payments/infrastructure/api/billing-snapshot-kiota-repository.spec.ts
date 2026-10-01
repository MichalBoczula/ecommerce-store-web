import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerProfileRepository } from '../../../users/domain/interfaces/customer-profile-repository.port';
import { CustomerProfile } from '../../../users/domain/model/customer-profile';
import { BillingSnapshotKiotaRepository, mapBillingSnapshot } from './billing-snapshot-kiota-repository';

const clientId = '22222222-2222-2222-2222-222222222222';
const profile: CustomerProfile = { id: clientId, externalId: 'demo', companies: [], updatedAt: null,
    individual: { firstName: 'Payment', lastName: 'Customer', email: 'customer@example.test', phone: '+48 123-456-789',
        billingAddress: { postalCode: '00-001', city: 'Warsaw', street: 'Main', buildingNumber: '10', apartmentNumber: '2' },
        shippingAddress: { postalCode: '99-001', city: 'Other', street: 'Shipping', buildingNumber: '1', apartmentNumber: '' } } };
const snapshot = { id: clientId, clientId, ...mapBillingSnapshot(profile) };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
    status, headers: { 'content-type': status === 404 ? 'application/problem+json' : 'application/json' } });

function setup(selected = profile) {
    const getByExternalId = vi.fn(() => of(selected));
    TestBed.configureTestingModule({ providers: [BillingSnapshotKiotaRepository,
        { provide: CustomerProfileRepository, useValue: { getByExternalId } }] });
    return { repository: TestBed.inject(BillingSnapshotKiotaRepository), getByExternalId };
}

describe('Invoice billing snapshot before Checkout', () => {
    afterEach(() => { vi.unstubAllGlobals(); TestBed.resetTestingModule(); });
    it('creates a missing snapshot from Users billing data through BFF', async () => {
        const calls: { url: string; method: string; body: unknown }[] = [];
        vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
            calls.push({ url, method: init.method!, body: init.body });
            return init.method === 'GET' ? json({ status: 404, title: 'Not Found' }, 404) : json(snapshot);
        }));
        const { repository, getByExternalId } = setup();
        await firstValueFrom(repository.ensure(clientId, profile.externalId));
        expect(getByExternalId).toHaveBeenCalledWith(profile.externalId);
        expect(calls.map(call => [call.method, call.url])).toEqual([
            ['GET', `/backend/client-data-versions/client/${clientId}`], ['POST', `/backend/client-data-versions/${clientId}`] ]);
        const posted = JSON.parse(new TextDecoder().decode(calls[1].body as ArrayBuffer));
        expect(posted).toEqual(mapBillingSnapshot(profile));
        expect(posted.city).toBe('Warsaw');
        expect(posted.phonePrefix).toBe('48');
    });
    it('reuses unchanged billing data during a resumed/repeated Checkout', async () => {
        const fetch = vi.fn(async () => json(snapshot));
        vi.stubGlobal('fetch', fetch);
        await firstValueFrom(setup().repository.ensure(clientId, profile.externalId));
        expect(fetch).toHaveBeenCalledTimes(1);
    });
    it('does not copy billing from another profile and does not submit a snapshot', async () => {
        const fetch = vi.fn(async () => json({ status: 404, title: 'Not Found' }, 404));
        vi.stubGlobal('fetch', fetch);
        await expect(firstValueFrom(setup({ ...profile, id: 'other' }).repository.ensure(clientId, 'other'))).rejects.toThrow('does not belong');
        expect(fetch).toHaveBeenCalledTimes(1);
    });
    it('requires Profile selection for legacy customers with no Invoice snapshot', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => json({ status: 404, title: 'Not Found' }, 404)));
        const { repository, getByExternalId } = setup();
        await expect(firstValueFrom(repository.ensure(clientId, null))).rejects.toThrow('external ID');
        expect(getByExternalId).not.toHaveBeenCalled();
    });
    it('allows legacy selected customers whose snapshot already exists', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => json(snapshot)));
        const { repository, getByExternalId } = setup();
        await firstValueFrom(repository.ensure(clientId, null));
        expect(getByExternalId).not.toHaveBeenCalled();
    });
    it('rejects unsupported phone formats before payment submission', () => {
        expect(() => mapBillingSnapshot({ ...profile, individual: { ...profile.individual, phone: '+1 555 123 1234' } })).toThrow('Polish');
        expect(mapBillingSnapshot({ ...profile, individual: { ...profile.individual, phone: '0048123456789' } }).phoneNumber).toBe('123456789');
    });
});

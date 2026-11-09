import { Pact } from '@pact-foundation/pact';
import { firstValueFrom } from 'rxjs';
import { expect, it } from 'vitest';
import {
  CustomerProfileKiotaRepository,
  ProfileNotFoundError,
} from '../../src/app/features/users/infrastructure/api/customer-profile-kiota-repository';
import { throughBrowserPrefix, writeReproduciblePact } from './web-pact';

const billingAddress = {
  postalCode: '00-001', city: 'Warsaw', street: 'Main', buildingNumber: '10', apartmentNumber: '2',
};
const shippingAddress = {
  postalCode: '30-001', city: 'Krakow', street: 'Shipping', buildingNumber: '11', apartmentNumber: null,
};
const profile = {
  id: '43000000-0000-4000-8000-000000000001',
  externalId: 'pact-profile-external-id',
  updatedAt: '2026-09-29T12:00:00Z',
  individual: {
    firstName: 'Demo', lastName: 'Customer', email: 'customer@example.com', phone: '123456789',
    billingAddress, shippingAddress,
  },
  companies: [{
    id: '43000000-0000-4000-8000-000000000002',
    companyName: 'Example Company', taxId: '1234567890', billingAddress, shippingAddress,
  }],
};
const missingExternalId = 'pact-missing-external-id';
const profileState = 'one customer profile exists and another external ID is absent';

async function verify(dir: string): Promise<void> {
  const pact = new Pact({ consumer: 'web', provider: 'users', dir });
  const state = { profile, missingExternalId };
  const profilePath = `/customers/external/${profile.externalId}`;
  const missingPath = `/customers/external/${missingExternalId}`;
  const mappedShippingAddress = { ...shippingAddress, apartmentNumber: '' };

  await pact.addInteraction()
    .given(profileState, state)
    .uponReceiving('load an existing customer profile by external ID')
    .withRequest('GET', profilePath)
    .willRespondWith(200, response => response.jsonBody(profile))
    .executeTest(({ url }) => throughBrowserPrefix(url, profilePath, async () => {
      const repository = new CustomerProfileKiotaRepository();
      const result = await firstValueFrom(repository.getByExternalId(profile.externalId));
      expect(result).toEqual({
        ...profile,
        updatedAt: new Date(profile.updatedAt),
        individual: { ...profile.individual, shippingAddress: mappedShippingAddress },
        companies: [{ ...profile.companies[0], shippingAddress: mappedShippingAddress }],
      });
    }));

  await pact.addInteraction()
    .given(profileState, state)
    .uponReceiving('load a customer profile for an unknown external ID')
    .withRequest('GET', missingPath)
    .willRespondWith(404, response => {
      response.headers({ 'Content-Type': 'application/problem+json' }).jsonBody({ status: 404 });
    })
    .executeTest(({ url }) => throughBrowserPrefix(url, missingPath, async () => {
      const repository = new CustomerProfileKiotaRepository();
      await expect(firstValueFrom(repository.getByExternalId(missingExternalId)))
        .rejects.toBeInstanceOf(ProfileNotFoundError);
    }));
}

it('emits a reproducible Web Users profile Pact from the real Kiota repository',
  () => writeReproduciblePact('users', 2, verify));

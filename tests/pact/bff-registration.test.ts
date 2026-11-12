import { MatchersV3, Pact } from '@pact-foundation/pact';
import { expect, it } from 'vitest';
import { demoRegistration, registerCustomer, repairCustomerCart } from '../support/bff-registration';
import { throughBrowserPrefix, writeReproduciblePact } from './web-pact';

const registrationPath = '/registrations/customers';
const registration = demoRegistration('web-pact-registration', 'register@example.test');
const legacy = demoRegistration('web-pact-legacy', 'legacy@example.test');
const registeredId = '46000000-0000-4000-8000-000000000001';
const legacyId = '46000000-0000-4000-8000-000000000002';

async function verify(dir: string): Promise<void> {
    const pact = new Pact({ consumer: 'web', provider: 'bff', dir });

    await pact.addInteraction()
        .given('the requested customer does not exist', { registration, customerId: registeredId })
        .uponReceiving('register a new customer and confirm the cart')
        .withRequest('POST', registrationPath, request => request.jsonBody(registration))
        .willRespondWith(200, response => response.jsonBody({ id: MatchersV3.uuid(registeredId) }))
        .executeTest(({ url }) => throughBrowserPrefix(url, registrationPath, async () => {
            expect(await registerCustomer(url, registration)).toBe(registeredId);
        }));

    const repairPath = `${registrationPath}/${legacy.externalId}/cart`;
    await pact.addInteraction()
        .given('the requested customer exists without a cart', { registration: legacy, customerId: legacyId })
        .uponReceiving('repair the cart for an existing customer')
        .withRequest('POST', repairPath)
        .willRespondWith(200, response => response.jsonBody({ id: MatchersV3.uuid(legacyId) }))
        .executeTest(({ url }) => throughBrowserPrefix(url, repairPath, async () => {
            expect(await repairCustomerCart(url, legacy.externalId)).toBe(legacyId);
        }));
}

it('emits a reproducible Web BFF Pact from the browser acceptance client',
    () => writeReproduciblePact('bff', 2, verify));

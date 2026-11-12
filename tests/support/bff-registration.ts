const registrationPath = '/backend/registrations/customers';
const customerIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function demoRegistration(externalId: string, email: string) {
    const address = {
        postalCode: '00-001', city: 'Warsaw', street: 'Main Street', buildingNumber: '10', apartmentNumber: '2',
    };
    return {
        externalId,
        individual: {
            firstName: 'Acceptance', lastName: 'Customer', email, phone: '123456789',
            billingAddress: address, shippingAddress: address,
        },
    };
}

export async function registerCustomer(
    baseUrl: string | undefined, data: ReturnType<typeof demoRegistration>,
): Promise<string> {
    const response = await fetch(new URL(registrationPath, baseUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return readCustomerId(response);
}

export async function repairCustomerCart(baseUrl: string | undefined, externalId: string): Promise<string> {
    const url = new URL(`${registrationPath}/${encodeURIComponent(externalId)}/cart`, baseUrl);
    return readCustomerId(await fetch(url, { method: 'POST' }));
}

async function readCustomerId(response: Response): Promise<string> {
    if (response.status !== 200) {
        throw new Error(`BFF registration request failed with HTTP ${response.status}: ${await response.text()}`);
    }
    const customer: { id?: unknown } | null = await response.json();
    if (typeof customer?.id !== 'string' || !customerIdPattern.test(customer.id)) {
        throw new Error('BFF registration response did not contain a customer GUID.');
    }
    return customer.id;
}

import { randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type BrowserContext } from '@playwright/test';

type Cart = { clientId: string; lines: { productId: string; quantity: number }[] };
type Phone = { id: string; name: string };

async function registerCustomer(request: APIRequestContext): Promise<string> {
    const id = randomUUID();
    const address = { postalCode: '00-001', city: 'Warsaw', street: 'Main Street', buildingNumber: '10', apartmentNumber: '2' };
    const response = await request.post('/backend/customers', {
        data: {
            externalId: `web-acceptance-${id}`,
            individual: {
                firstName: 'Acceptance', lastName: 'Customer', email: `${id}@example.com`,
                phone: '123456789', billingAddress: address, shippingAddress: address,
            },
        },
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    const customer = await response.json() as { id: string };
    expect(customer.id).toMatch(/^[0-9a-f-]{36}$/i);
    return customer.id;
}

async function createCartFixture(request: APIRequestContext, clientId: string): Promise<void> {
    // Current pinned APIs expose separate customer and cart creation routes.
    // This fixture provisions cart-specific scenarios until registration orchestrates both.
    const response = await request.post(`/backend/shopping-carts/${clientId}`);
    expect(response.ok(), await response.text()).toBeTruthy();
    const cart = await response.json() as Cart;
    expect(cart.clientId).toBe(clientId);
    expect(cart.lines).toEqual([]);
}

async function selectCustomer(context: BrowserContext, clientId: string): Promise<void> {
    await context.addInitScript(id => localStorage.setItem('demoClientId', id), clientId);
}

async function getCart(request: APIRequestContext, clientId: string): Promise<Cart> {
    const response = await request.get(`/backend/shopping-carts/client/${clientId}`);
    expect(response.ok(), await response.text()).toBeTruthy();
    return await response.json() as Cart;
}

test('registration creates an empty cart for its customer', async ({ request }) => {
    const clientId = await registerCustomer(request);
    // Contract expectation: no second create-cart call after registration.
    const cart = await getCart(request, clientId);
    expect(cart.clientId).toBe(clientId);
    expect(cart.lines).toEqual([]);
});

test('customer adds, changes quantity and removes a catalog product through the UI', async ({ page, request, context }) => {
    const clientId = await registerCustomer(request);
    await createCartFixture(request, clientId);
    await selectCustomer(context, clientId);

    const phonesResponse = await request.get('/backend/mobile-phones?amount=15');
    expect(phonesResponse.ok(), await phonesResponse.text()).toBeTruthy();
    const phones = await phonesResponse.json() as Phone[];
    expect(phones.length).toBeGreaterThan(0);
    const phone = phones[0];

    await page.goto('/list');
    const card = page.locator('section.container').filter({ has: page.getByRole('button', { name: `View details for ${phone.name}` }) });
    await expect(card).toBeVisible();
    await card.locator('button[matbutton="elevated"]').click();
    await expect.poll(async () => (await getCart(request, clientId)).lines).toEqual([{ productId: phone.id, quantity: 1 }]);

    await page.goto('/cart');
    await expect(page.getByText(phone.name, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Increase quantity for ${phone.id}` }).click();
    await expect.poll(async () => (await getCart(request, clientId)).lines).toEqual([{ productId: phone.id, quantity: 2 }]);
    await page.getByRole('button', { name: `Decrease quantity for ${phone.id}` }).click();
    await expect.poll(async () => (await getCart(request, clientId)).lines).toEqual([{ productId: phone.id, quantity: 1 }]);
    await page.getByRole('button', { name: `Remove ${phone.id}` }).click();
    await expect(page.getByText('Your shopping cart is empty.')).toBeVisible();
    expect((await getCart(request, clientId)).lines).toEqual([]);
});

test('a product removed from the catalog stays visible as unavailable', async ({ page, request, context }) => {
    const clientId = await registerCustomer(request);
    await createCartFixture(request, clientId);
    await selectCustomer(context, clientId);
    const missingId = randomUUID();
    const update = await request.put(`/backend/shopping-carts/${clientId}`, {
        data: { lines: [{ productId: missingId, quantity: 1 }] },
    });
    expect(update.ok(), await update.text()).toBeTruthy();

    await page.goto('/cart');
    await expect(page.getByText('Unavailable in catalog')).toBeVisible();
    await expect(page.getByText('Price unavailable')).toBeVisible();
    await page.getByRole('button', { name: `Remove ${missingId}` }).click();
    await expect(page.getByText('Your shopping cart is empty.')).toBeVisible();
});

test('an unknown customer sees the cart error and retry action', async ({ page, context }) => {
    await selectCustomer(context, randomUUID());
    await page.goto('/cart');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});

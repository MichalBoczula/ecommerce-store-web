import { randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type BrowserContext } from '@playwright/test';
import { demoRegistration, registerCustomer, repairCustomerCart } from '../support/bff-registration';

type Cart = { id: string; clientId: string; lines: { productId: string; quantity: number }[] };
type Phone = { id: string; name: string; price?: { amount: number; currency: string } };

async function registerDemoCustomer(baseURL: string | undefined): Promise<string> {
    return (await registerCustomerWithExternal(baseURL)).clientId;
}

async function registerCustomerWithExternal(baseURL: string | undefined): Promise<{ clientId: string; externalId: string }> {
    const id = randomUUID();
    const externalId = `web-acceptance-${id}`;
    const clientId = await registerCustomer(baseURL, demoRegistration(externalId, `${id}@example.com`));
    return { clientId, externalId };
}

async function selectCustomer(context: BrowserContext, clientId: string): Promise<void> {
    await context.addInitScript(id => localStorage.setItem('demoClientId', id), clientId);
}

async function getCart(request: APIRequestContext, clientId: string): Promise<Cart> {
    const response = await request.get(`/backend/shopping-carts/client/${clientId}`);
    expect(response.ok(), await response.text()).toBeTruthy();
    return await response.json() as Cart;
}

test('registration creates an empty cart for its customer', async ({ baseURL, request }) => {
    const clientId = await registerDemoCustomer(baseURL);
    const cart = await getCart(request, clientId);
    expect(cart.clientId).toBe(clientId);
    expect(cart.lines).toEqual([]);
    const duplicate = await request.post(`/backend/shopping-carts/${clientId}`);
    expect(duplicate.status()).toBe(409);
    expect((await getCart(request, clientId)).id).toBe(cart.id);
});

test('cart repair creates an empty cart for an existing customer', async ({ baseURL, request }) => {
    const id = randomUUID();
    const externalId = `web-acceptance-${id}`;
    const legacy = await request.post('/backend/customers', {
        data: demoRegistration(externalId, `${id}@example.com`),
    });
    expect(legacy.ok(), await legacy.text()).toBeTruthy();
    const { id: clientId } = await legacy.json() as { id: string };
    expect((await request.get(`/backend/shopping-carts/client/${clientId}`)).status()).toBe(404);

    expect(await repairCustomerCart(baseURL, externalId)).toBe(clientId);
    const cart = await getCart(request, clientId);
    expect(cart.clientId).toBe(clientId);
    expect(cart.lines).toEqual([]);
    expect(await repairCustomerCart(baseURL, externalId)).toBe(clientId);
    expect((await getCart(request, clientId)).id).toBe(cart.id);
});

test('customer adds, changes quantity and removes a catalog product through the UI', async ({ baseURL, page, request, context }) => {
    const clientId = await registerDemoCustomer(baseURL);
    await selectCustomer(context, clientId);

    const phonesResponse = await request.get('/backend/mobile-phones?amount=15');
    expect(phonesResponse.ok(), await phonesResponse.text()).toBeTruthy();
    const phones = await phonesResponse.json() as Phone[];
    expect(phones.length).toBeGreaterThan(0);
    const phone = phones[0];

    await page.goto('/list');
    const card = page.locator('app-store-phone-card').filter({ has: page.getByRole('link', { name: `View details for ${phone.name}` }) });
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: `Add to cart: ${phone.name}`, exact: true }).click();
    await expect.poll(async () => (await getCart(request, clientId)).lines).toEqual([{ productId: phone.id, quantity: 1 }]);

    await page.goto('/cart');
    await expect(page.getByText(phone.name, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Increase quantity for ${phone.name}` }).click();
    await expect.poll(async () => (await getCart(request, clientId)).lines).toEqual([{ productId: phone.id, quantity: 2 }]);
    await page.getByRole('button', { name: `Decrease quantity for ${phone.name}` }).click();
    await expect.poll(async () => (await getCart(request, clientId)).lines).toEqual([{ productId: phone.id, quantity: 1 }]);
    await page.getByRole('button', { name: `Remove ${phone.name}` }).click();
    await expect(page.getByText('Your shopping cart is empty.')).toBeVisible();
    expect((await getCart(request, clientId)).lines).toEqual([]);
});

test('a product removed from the catalog stays visible as unavailable', async ({ baseURL, page, request, context }) => {
    const clientId = await registerDemoCustomer(baseURL);
    await selectCustomer(context, clientId);
    const missingId = randomUUID();
    const update = await request.put(`/backend/shopping-carts/${clientId}`, {
        data: { lines: [{ productId: missingId, quantity: 1 }] },
    });
    expect(update.ok(), await update.text()).toBeTruthy();

    await page.goto('/cart');
    await expect(page.getByText('Unavailable in catalog')).toBeVisible();
    await expect(page.getByText('Price unavailable')).toBeVisible();
    await page.getByRole('button', { name: `Remove Product unavailable` }).click();
    await expect(page.getByText('Your shopping cart is empty.')).toBeVisible();
});

test('checkout creates one order, clears the cart and shows the backend total', async ({ baseURL, page, request, context }) => {
    const clientId = await registerDemoCustomer(baseURL);
    await selectCustomer(context, clientId);

    const phonesResponse = await request.get('/backend/mobile-phones?amount=15');
    expect(phonesResponse.ok(), await phonesResponse.text()).toBeTruthy();
    const phones = await phonesResponse.json() as Phone[];
    expect(phones.length).toBeGreaterThan(0);
    const phone = phones.find(item => item.price && item.price.amount > 0);
    expect(phone, 'The checkout fixture needs a positive-priced catalog product.').toBeDefined();
    if (!phone) throw new Error('No positive-priced catalog product was returned.');

    const beforeResponse = await request.get(`/backend/orders/client/${clientId}`);
    expect(beforeResponse.ok(), await beforeResponse.text()).toBeTruthy();
    expect(await beforeResponse.json()).toEqual([]);

    await page.goto('/list');
    const card = page.locator('app-store-phone-card').filter({
        has: page.getByRole('link', { name: `View details for ${phone.name}` }),
    });
    await card.getByRole('button', { name: `Add to cart: ${phone.name}`, exact: true }).click();
    await expect.poll(async () => (await getCart(request, clientId)).lines).toEqual([
        { productId: phone.id, quantity: 1 },
    ]);
    await page.goto('/cart');
    await expect(page.getByText(phone.name, { exact: true })).toBeVisible();

    const checkout = page.getByRole('button', { name: 'Place order' });
    await expect(checkout).toBeEnabled();
    await checkout.click();
    await expect(page.getByText('Your shopping cart is empty.')).toBeVisible();
    await expect(checkout).toHaveCount(0);

    const ordersResponse = await request.get(`/backend/orders/client/${clientId}`);
    expect(ordersResponse.ok(), await ordersResponse.text()).toBeTruthy();
    const orders = await ordersResponse.json() as {
        id: string; totalAmount: number; totalCurrency: string; status: string;
        lines: { productVersion: { productId: string; name: string } }[];
    }[];
    expect(orders).toHaveLength(1);
    expect(orders[0].lines[0].productVersion.productId).toBe(phone.id);
    expect(orders[0].status.toLowerCase()).not.toBe('paid');
    expect((await getCart(request, clientId)).lines).toEqual([]);
    await expect(page.getByText(`Order placed: ${orders[0].id}`)).toBeVisible();
    await expect(page.getByText('Order subtotal:').locator('..')).toContainText(
        new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
            .format(orders[0].totalAmount));
    await page.getByRole('link', { name: 'View order' }).click();
    await expect(page.getByText(`Order ${orders[0].id}`)).toBeVisible();
    await expect(page.getByText(orders[0].lines[0].productVersion.name)).toBeVisible();
});

test('an unknown customer sees the cart error and retry action', async ({ page, context }) => {
    await selectCustomer(context, randomUUID());
    await page.goto('/cart');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});

test('demo profile selects the customer and edits individual and company billing data through Users', async ({ baseURL, page, request }) => {
    const { clientId, externalId } = await registerCustomerWithExternal(baseURL);
    const companyAddress = { postalCode: '00-001', city: 'Warsaw', street: 'Office',
        buildingNumber: '4', apartmentNumber: '1' };
    const companyResponse = await request.post(`/backend/customers/${clientId}/companies`, {
        data: { companyName: 'Demo Company', taxId: '1234567890',
            billingAddress: companyAddress, shippingAddress: companyAddress },
    });
    expect(companyResponse.ok(), await companyResponse.text()).toBeTruthy();
    await page.goto('/profile');
    await expect(page.getByText('This is not authentication.')).toBeVisible();
    await page.getByLabel('External ID').fill(externalId);
    await page.getByRole('button', { name: 'Load profile' }).click();
    await expect(page.getByText(`Customer ID: ${clientId}`, { exact: true })).toBeVisible();
    await expect(page.getByLabel('First name')).toHaveValue('Acceptance');
    for (const width of [360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const billingCity = page.getByRole('region', { name: 'Billing address', exact: true }).getByLabel('City', { exact: true });
    await billingCity.fill('');
    await expect(page.getByRole('button', { name: 'Save profile', exact: true })).toBeDisabled();
    await billingCity.fill('Warsaw');
    await expect(page.getByRole('button', { name: 'Save profile', exact: true })).toBeEnabled();
    await page.getByLabel('Last name').fill('Updated');
    await page.getByLabel('City').first().fill('Krakow');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await expect(page.getByText('Profile saved.')).toBeVisible();
    await page.getByLabel('Company name').fill('Updated Company');
    const companySaved = page.waitForResponse(response =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname.startsWith(`/backend/customers/${clientId}/companies/`));
    await page.getByRole('button', { name: 'Save company' }).click();
    const savedResponse = await companySaved;
    expect(savedResponse.ok(), await savedResponse.text()).toBeTruthy();
    await expect(page.getByLabel('Company name')).toHaveValue('Updated Company');

    const result = await request.get(`/backend/customers/external/${externalId}`);
    expect(result.ok(), await result.text()).toBeTruthy();
    const profile = await result.json() as {
        id: string; individual: { lastName: string; billingAddress: { city: string } };
        companies: { companyName: string }[];
    };
    expect(profile.id).toBe(clientId);
    expect(profile.individual.lastName).toBe('Updated');
    expect(profile.individual.billingAddress.city).toBe('Krakow');
    expect(profile.companies[0].companyName).toBe('Updated Company');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('demoCustomer') ?? '{}')))
        .toEqual({ clientId, externalId });
    await page.goto('/cart');
    await expect(page.getByText('Your shopping cart is empty.')).toBeVisible();
    await page.goto('/orders');
    await expect(page.getByText('You have no orders yet.')).toBeVisible();
    await page.goto('/favorites');
    await expect(page.getByText('Your wishlist is empty.')).toBeVisible();
});

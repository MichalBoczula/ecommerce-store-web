import { randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type BrowserContext } from '@playwright/test';

type Cart = { id: string; clientId: string; lines: { productId: string; quantity: number }[] };
type Phone = { id: string; name: string; price?: { amount: number; currency: string } };

async function registerCustomer(request: APIRequestContext): Promise<string> {
    return (await registerCustomerWithExternal(request)).clientId;
}

async function registerCustomerWithExternal(request: APIRequestContext): Promise<{ clientId: string; externalId: string }> {
    const id = randomUUID();
    const externalId = `web-acceptance-${id}`;
    const address = { postalCode: '00-001', city: 'Warsaw', street: 'Main Street', buildingNumber: '10', apartmentNumber: '2' };
    const response = await request.post('/backend/registrations/customers', {
        data: {
            externalId,
            individual: {
                firstName: 'Acceptance', lastName: 'Customer', email: `${id}@example.com`,
                phone: '123456789', billingAddress: address, shippingAddress: address,
            },
        },
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    const customer = await response.json() as { id: string };
    expect(customer.id).toMatch(/^[0-9a-f-]{36}$/i);
    return { clientId: customer.id, externalId };
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
    const cart = await getCart(request, clientId);
    expect(cart.clientId).toBe(clientId);
    expect(cart.lines).toEqual([]);
    const duplicate = await request.post(`/backend/shopping-carts/${clientId}`);
    expect(duplicate.status()).toBe(409);
    expect((await getCart(request, clientId)).id).toBe(cart.id);
});

test('customer adds, changes quantity and removes a catalog product through the UI', async ({ page, request, context }) => {
    const clientId = await registerCustomer(request);
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

test('checkout creates one order, clears the cart and shows the backend total', async ({ page, request, context }) => {
    const clientId = await registerCustomer(request);
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
    const card = page.locator('section.container').filter({
        has: page.getByRole('button', { name: `View details for ${phone.name}` }),
    });
    await card.locator('button[matbutton="elevated"]').click();
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
    await expect(page.getByText('Final total:').locator('..')).toContainText(
        new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

test('demo profile selects the customer and edits individual and company billing data through Users', async ({ page, request }) => {
    const { clientId, externalId } = await registerCustomerWithExternal(request);
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
    await page.getByLabel('Last name').fill('Updated');
    await page.getByLabel('City').first().fill('Krakow');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await expect(page.getByText('Profile saved.')).toBeVisible();
    await page.getByLabel('Company name').fill('Updated Company');
    await page.getByRole('button', { name: 'Save company' }).click();
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

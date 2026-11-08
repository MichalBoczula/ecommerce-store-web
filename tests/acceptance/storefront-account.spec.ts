import { randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

type Phone = { id: string; name: string; mainPhoto: string; price: { amount: number; currency: string } };
type Order = { id: string; totalAmount: number; totalCurrency: string; lines: { quantity: number; productVersion: { name: string; priceAmount: number; priceCurrency: string } }[] };

async function setup(request: APIRequestContext) {
    const id = randomUUID();
    const address = { postalCode: '00-001', city: 'Warsaw', street: 'Main', buildingNumber: '10', apartmentNumber: '2' };
    const registration = await request.post('/backend/registrations/customers', { data: {
        externalId: `account-${id}`, individual: { firstName: 'Account', lastName: 'Customer', email: `${id}@example.com`, phone: '123456789', billingAddress: address, shippingAddress: address },
    } });
    expect(registration.ok(), await registration.text()).toBeTruthy();
    const { id: clientId } = await registration.json() as { id: string };
    const response = await request.get('/backend/mobile-phones?amount=15');
    expect(response.ok(), await response.text()).toBeTruthy();
    const phones = await response.json() as Phone[];
    return { clientId, phones };
}

async function photos(page: Page, phones: Phone[]) {
    // Product and customer APIs stay real; isolate external development-storage bytes only.
    for (const phone of phones) {
        expect(new URL(phone.mainPhoto).hostname).toMatch(/\.blob\.core\.windows\.net$/);
        await page.route(phone.mainPhoto, route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="200"><rect width="100" height="200" fill="silver"/></svg>' }));
    }
}

const money = (amount: number, currency: string) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)} ${currency}`;

test('saved phone cards retain real photos, add to cart, remove and clear favorites', async ({ page, request, context }) => {
    const { clientId, phones } = await setup(request);
    const saved = phones.slice(0, 3);
    for (const phone of saved) {
        const response = await request.post(`/backend/favorites/clients/${clientId}`, { data: { productId: phone.id } });
        expect(response.ok(), await response.text()).toBeTruthy();
    }
    await context.addInitScript(id => localStorage.setItem('demoClientId', id), clientId);
    await photos(page, saved);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/favorites');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Saved for later');
    await expect(page.locator('app-store-phone-card')).toHaveCount(3);
    for (const phone of saved) {
        const card = page.locator(`app-store-phone-card[data-product-id="${phone.id}"]`);
        await expect(card.getByRole('link', { name: `View details for ${phone.name}`, exact: true }).locator('img')).toHaveAttribute('src', phone.mainPhoto);
        await expect(card.locator('.price')).toHaveText(money(phone.price.amount, phone.price.currency));
    }
    for (const width of [360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await page.locator(`app-store-phone-card[data-product-id="${saved[0].id}"]`).getByRole('button', { name: `Add to cart: ${saved[0].name}`, exact: true }).click();
    await expect.poll(async () => {
        const response = await request.get(`/backend/shopping-carts/client/${clientId}`);
        expect(response.ok()).toBeTruthy();
        return (await response.json() as { lines: { productId: string; quantity: number }[] }).lines;
    }).toEqual([{ productId: saved[0].id, quantity: 1 }]);
    await page.locator(`app-store-phone-card[data-product-id="${saved[0].id}"]`).getByRole('button', { name: `Remove ${saved[0].name} from favorites`, exact: true }).click();
    await expect(page.locator('app-store-phone-card')).toHaveCount(2);
    await page.getByRole('button', { name: 'Clear all favorites', exact: true }).click();
    await expect(page.getByText('Your wishlist is empty.', { exact: true })).toBeVisible();
    const response = await request.get(`/backend/favorites/clients/${clientId}`);
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toEqual([]);
    await expect(page.getByRole('link', { name: 'Browse smartphones', exact: true })).toHaveAttribute('href', '/list');
});

test('responsive cart places an order and preserves purchase snapshots in the order and payment layout', async ({ page, request, context }) => {
    const { clientId, phones } = await setup(request);
    const products = phones.filter(phone => phone.price.currency === 'PLN' && phone.price.amount > 0).slice(0, 2);
    expect(products).toHaveLength(2);
    const response = await request.put(`/backend/shopping-carts/${clientId}`, { data: { lines: products.map((phone, index) => ({ productId: phone.id, quantity: index + 1 })) } });
    expect(response.ok(), await response.text()).toBeTruthy();
    await context.addInitScript(id => localStorage.setItem('demoClientId', id), clientId);
    await photos(page, products);
    await page.goto('/cart');
    await expect(page.locator('.cart-line')).toHaveCount(2);
    for (const phone of products) await expect(page.getByRole('img', { name: phone.name, exact: true })).toHaveAttribute('src', phone.mainPhoto);
    for (const width of [360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const placed = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname === `/backend/orders/client/${clientId}`);
    await page.getByRole('button', { name: 'Place order', exact: true }).click();
    const placedResponse = await placed;
    expect(placedResponse.ok(), await placedResponse.text()).toBeTruthy();
    const order = await placedResponse.json() as Order;
    await expect(page.locator('.checkout-confirmation')).toContainText(`Order subtotal: ${money(order.totalAmount, order.totalCurrency)}`);
    await page.getByRole('link', { name: 'View order', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Order ${order.id}`);
    await expect(page.locator('.purchased-line')).toHaveCount(2);
    for (const line of order.lines) {
        const item = page.locator('.purchased-line').filter({ has: page.getByRole('heading', { name: line.productVersion.name, exact: true }) });
        await expect(item).toContainText(`Quantity: ${line.quantity}`);
        await expect(item).toContainText(`Unit price: ${money(line.productVersion.priceAmount, line.productVersion.priceCurrency)}`);
    }
    await expect(page.locator('.order-total')).toHaveText(`Order subtotal: ${money(order.totalAmount, order.totalCurrency)}`);
    await expect(page.getByRole('region', { name: 'Payment', exact: true }).getByRole('button', { name: 'Pay with Stripe', exact: true })).toBeEnabled();
    await expect(page.locator('input[type="tel"], input[name="cardNumber"]')).toHaveCount(0);
    for (const width of [360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await page.getByRole('link', { name: 'Back to orders', exact: true }).click();
    const card = page.locator(`.order-card[data-order-id="${order.id}"]`);
    await expect(card.locator('.order-total')).toHaveText(money(order.totalAmount, order.totalCurrency));
    for (const width of [360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
});

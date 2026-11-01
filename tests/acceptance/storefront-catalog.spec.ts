import { randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext } from '@playwright/test';

type Phone = { id: string; name: string; brand: string; price?: { amount: number; currency: string } };

async function register(request: APIRequestContext): Promise<string> {
    const id = randomUUID();
    const address = { postalCode: '00-001', city: 'Warsaw', street: 'Main', buildingNumber: '10', apartmentNumber: '2' };
    const response = await request.post('/backend/registrations/customers', { data: {
        externalId: `storefront-${id}`, individual: { firstName: 'Storefront', lastName: 'Customer',
            email: `${id}@example.com`, phone: '123456789', billingAddress: address, shippingAddress: address },
    } });
    expect(response.ok(), await response.text()).toBeTruthy();
    return (await response.json() as { id: string }).id;
}

async function filteredPhones(request: APIRequestContext, filter: object): Promise<Phone[]> {
    const response = await request.post('/backend/mobile-phones/filter', { data: filter });
    expect(response.ok(), await response.text()).toBeTruthy();
    return await response.json() as Phone[];
}

test('featured phones keep backend currency, cart, favorites and product navigation', async ({ page, request, context }) => {
    const clientId = await register(request);
    await context.addInitScript(id => localStorage.setItem('demoClientId', id), clientId);
    const topResponse = await request.get('/backend/mobile-phones/top');
    expect(topResponse.ok(), await topResponse.text()).toBeTruthy();
    const top = await topResponse.json() as { id: string; commonDescription: { name: string }; price: { amount: number; currency: string } }[];
    expect(top.length).toBeGreaterThan(0);
    const phone = top[0];
    await page.goto('/home');
    const card = page.locator('app-store-phone-card').filter({ has: page.getByRole('link', { name: `View details for ${phone.commonDescription.name}`, exact: true }) });
    await expect(card).toBeVisible();
    const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(phone.price.amount);
    await expect(card.locator('.price')).toContainText(`${amount} ${phone.price.currency}`);
    await card.getByRole('button', { name: `Add to cart: ${phone.commonDescription.name}`, exact: true }).click();
    await expect.poll(async () => {
        const response = await request.get(`/backend/shopping-carts/client/${clientId}`);
        expect(response.ok()).toBeTruthy();
        return (await response.json() as { lines: { productId: string; quantity: number }[] }).lines;
    }).toEqual([{ productId: phone.id, quantity: 1 }]);
    const saved = card.getByRole('button', { name: / to favorites$/ });
    await saved.click();
    await expect(card.getByRole('button', { name: / from favorites$/ })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(async () => {
        const response = await request.get(`/backend/favorites/clients/${clientId}`);
        expect(response.ok()).toBeTruthy();
        return (await response.json() as { productId: string }[]).map(item => item.productId);
    }).toEqual([phone.id]);
    await card.getByRole('button', { name: / from favorites$/ }).click();
    await expect(card.getByRole('button', { name: / to favorites$/ })).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(async () => {
        const response = await request.get(`/backend/favorites/clients/${clientId}`);
        expect(response.ok()).toBeTruthy();
        return await response.json();
    }).toEqual([]);
    await expect(page).toHaveURL(/\/home$/);
    await card.getByRole('link', { name: `View details for ${phone.commonDescription.name}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/details/${phone.id}$`));
});

test('brand shortcuts and desktop budgets persist through refresh and Back without loading the unfiltered list', async ({ page, request }) => {
    await page.setViewportSize({ width: 1440, height: 950 });
    const allRequests: string[] = [];
    page.on('request', req => {
        if (req.method() === 'GET' && new URL(req.url()).pathname === '/backend/mobile-phones') allRequests.push(req.url());
    });
    const expectedBrand = await filteredPhones(request, { brand: 'Xiaomi' });
    const expectedBudget = await filteredPhones(request, { brand: 'Xiaomi', minimalPrice: 1000, maximalPrice: 2600 });
    expect(expectedBrand.length).toBeGreaterThan(0); expect(expectedBudget.length).toBeGreaterThan(0);
    await page.goto('/home');
    await page.getByRole('navigation', { name: 'Shop by brand' }).getByRole('link', { name: 'Xiaomi', exact: true }).click();
    await expect(page).toHaveURL(/\/list\?brand=Xiaomi$/);
    await expect(page.locator('app-store-phone-card')).toHaveCount(expectedBrand.length);
    const sidebar = page.getByRole('complementary', { name: 'Catalog filters' });
    await sidebar.getByLabel('Minimum price').fill('1000');
    await sidebar.getByLabel('Maximum price').fill('2600');
    await sidebar.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page).toHaveURL(/brand=Xiaomi&minPrice=1000&maxPrice=2600/);
    await expect(page.locator('app-store-phone-card')).toHaveCount(expectedBudget.length);
    for (const phone of expectedBudget) await expect(page.locator(`app-store-phone-card[data-product-id="${phone.id}"]`)).toBeVisible();
    await page.reload();
    await expect(sidebar.getByLabel('Minimum price')).toHaveValue('1000');
    await expect(sidebar.getByLabel('Maximum price')).toHaveValue('2600');
    await expect(page.locator('app-store-phone-card')).toHaveCount(expectedBudget.length);
    await page.goBack();
    await expect(page).toHaveURL(/\/list\?brand=Xiaomi$/);
    await expect(page.locator('app-store-phone-card')).toHaveCount(expectedBrand.length);
    expect(allRequests).toEqual([]);
    await page.locator('.active-filters').getByRole('link', { name: 'Clear filters' }).click();
    await expect(page).toHaveURL(/\/list$/);
    await expect(page.locator('app-store-phone-card')).toHaveCount(15);
    expect(allRequests).toHaveLength(1);
});

test('mobile catalog filters synchronize with the drawer and recover from empty results', async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const expected = await filteredPhones(request, { brand: 'Samsung' });
    await page.goto('/list?brand=Xiaomi');
    await expect(page.locator('.active-filters')).toContainText('Xiaomi');
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Filters' });
    await drawer.getByRole('combobox', { name: 'Brand' }).click();
    await page.getByRole('option', { name: 'Samsung', exact: true }).click();
    await drawer.getByRole('button', { name: 'Apply filters' }).click();
    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(/\/list\?brand=Samsung$/);
    await expect(page.locator('app-store-phone-card')).toHaveCount(expected.length);
    expect(await page.locator('.catalog-grid').evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(350);
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await drawer.getByLabel('Minimum price').fill('1000000');
    await drawer.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page.locator('app-catalog-feedback')).toContainText('No phones found');
    await expect(page.locator('app-store-phone-card')).toHaveCount(0);
    await page.locator('.active-filters').getByRole('link', { name: 'Clear filters' }).click();
    await expect(page.locator('app-store-phone-card')).toHaveCount(15);
});

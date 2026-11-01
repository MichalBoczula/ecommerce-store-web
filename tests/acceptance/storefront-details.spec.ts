import { randomUUID } from 'node:crypto';
import { expect, test, type APIRequestContext } from '@playwright/test';

type Phone = {
    id: string;
    price: { amount: number; currency: string };
    commonDescription: { name: string; brand: string; mainPhoto: string; otherPhotos: string[]; description: string };
    electronicDetails: { ram: string; storage: string };
    description2: string;
    description3: string;
};

async function product(request: APIRequestContext): Promise<Phone> {
    const list = await request.get('/backend/mobile-phones?amount=15');
    expect(list.ok(), await list.text()).toBeTruthy();
    const phones = await list.json() as { id: string; name: string }[];
    const selected = phones.find(phone => phone.name.includes('iPhone 17 '));
    expect(selected).toBeDefined();
    const response = await request.get(`/backend/mobile-phones/${selected!.id}`);
    expect(response.ok(), await response.text()).toBeTruthy();
    return await response.json() as Phone;
}

async function register(request: APIRequestContext): Promise<string> {
    const id = randomUUID();
    const address = { postalCode: '00-001', city: 'Warsaw', street: 'Main', buildingNumber: '10', apartmentNumber: '2' };
    const response = await request.post('/backend/registrations/customers', { data: {
        externalId: `details-${id}`, individual: { firstName: 'Details', lastName: 'Customer',
            email: `${id}@example.com`, phone: '123456789', billingAddress: address, shippingAddress: address },
    } });
    expect(response.ok(), await response.text()).toBeTruthy();
    return (await response.json() as { id: string }).id;
}

test('details gallery, specifications, cart and favorites use the real product and customer APIs', async ({ page, request, context }) => {
    const phone = await product(request);
    const clientId = await register(request);
    await context.addInitScript(id => localStorage.setItem('demoClientId', id), clientId);
    const photos = [...new Set([phone.commonDescription.mainPhoto, ...phone.commonDescription.otherPhotos])];
    expect(photos).toHaveLength(4);
    // Only image bytes are isolated from the external development storage account.
    // Product data and all customer mutations still traverse the real BFF/services.
    for (const url of photos) {
        expect(new URL(url).hostname).toMatch(/\.blob\.core\.windows\.net$/);
        await page.route(url, route => route.fulfill({ contentType: 'image/svg+xml',
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="200"><rect width="100" height="200" fill="silver"/></svg>' }));
    }
    await page.goto(`/details/${phone.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(phone.commonDescription.name);
    const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(phone.price.amount);
    await expect(page.locator('.product-price')).toHaveText(`${amount} ${phone.price.currency}`);
    await expect(page.locator('.thumbnail')).toHaveCount(photos.length);
    const main = page.locator('.main-photo img');
    for (const [index, photo] of photos.entries()) {
        const thumbnail = page.getByRole('button', { name: `View photo ${index + 1} of ${photos.length} for ${phone.commonDescription.name}`, exact: true });
        await thumbnail.focus();
        await page.keyboard.press('Enter');
        await expect(thumbnail).toHaveAttribute('aria-pressed', 'true');
        await expect(main).toHaveAttribute('src', photo);
        await expect.poll(() => main.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await expect(page.locator('.description')).toContainText(phone.commonDescription.description);
    await expect(page.locator('.description')).toContainText(phone.description2);
    await expect(page.locator('.description')).toContainText(phone.description3);
    await expect(page.locator('.specifications')).toContainText(phone.electronicDetails.ram);
    await expect(page.locator('.specifications')).toContainText(phone.electronicDetails.storage);
    await expect(page.locator('.specifications')).not.toContainText('GB GB');
    await expect(page.locator('img[src*="shiba"], swiper-container, .specifications input')).toHaveCount(0);
    const purchase = page.locator('.purchase-panel');
    await purchase.getByRole('button', { name: 'Add to cart', exact: true }).click();
    await expect.poll(async () => {
        const response = await request.get(`/backend/shopping-carts/client/${clientId}`);
        expect(response.ok()).toBeTruthy();
        return (await response.json() as { lines: { productId: string; quantity: number }[] }).lines;
    }).toEqual([{ productId: phone.id, quantity: 1 }]);
    await purchase.getByRole('button', { name: 'Save to favorites', exact: true }).click();
    await expect(purchase.getByRole('button', { name: 'Remove from favorites', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(purchase.getByRole('button', { name: 'Remove from favorites', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await purchase.getByRole('button', { name: 'Remove from favorites', exact: true }).click();
    await expect(purchase.getByRole('button', { name: 'Save to favorites', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(async () => {
        const response = await request.get(`/backend/favorites/clients/${clientId}`);
        expect(response.ok()).toBeTruthy();
        return await response.json();
    }).toEqual([]);
    await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: phone.commonDescription.brand, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/list\\?brand=${phone.commonDescription.brand}$`));
});

test('details adapt across five widths and mobile purchase controls leave navigation and footer reachable', async ({ page, request, context }) => {
    const phone = await product(request);
    const clientId = await register(request);
    await context.addInitScript(id => localStorage.setItem('demoClientId', id), clientId);
    await page.goto(`/details/${phone.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(phone.commonDescription.name);
    const purchase = page.getByRole('region', { name: 'Mobile purchase' });
    for (const width of [360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        if (width < 768) {
            await expect(purchase).toBeVisible();
            const nav = await page.getByRole('navigation', { name: 'Mobile navigation' }).boundingBox();
            const bar = await purchase.boundingBox();
            expect(bar!.y + bar!.height).toBeLessThanOrEqual(nav!.y + 1);
        } else await expect(purchase).toBeHidden();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = await page.getByRole('contentinfo').boundingBox();
    const bar = await purchase.boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(bar!.y);
    await purchase.getByRole('button', { name: 'Add to cart', exact: true }).click();
    await expect.poll(async () => {
        const response = await request.get(`/backend/shopping-carts/client/${clientId}`);
        expect(response.ok()).toBeTruthy();
        return (await response.json() as { lines: { productId: string; quantity: number }[] }).lines;
    }).toEqual([{ productId: phone.id, quantity: 1 }]);
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Cart', exact: true }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(purchase).toHaveCount(0);
    await expect(page.locator('.with-mobile-action')).toHaveCount(0);
});

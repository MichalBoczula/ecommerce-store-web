import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type BrowserContext, type Page, type TestInfo } from '@playwright/test';

type Phone = { id: string; name: string; mainPhoto: string; price: { amount: number; currency: string } };

async function prepare(request: APIRequestContext, context: BrowserContext, page: Page) {
    const externalFonts: string[] = [];
    page.on('request', req => {
        if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(new URL(req.url()).hostname)) externalFonts.push(req.url());
    });
    const externalId = `audit-${randomUUID()}`;
    const address = { postalCode: '00-001', city: 'Warsaw', street: 'Main', buildingNumber: '10', apartmentNumber: '2' };
    const registration = await request.post('/backend/registrations/customers', { data: {
        externalId, individual: { firstName: 'Audit', lastName: 'Customer', email: `${randomUUID()}@example.com`, phone: '123456789', billingAddress: address, shippingAddress: address },
    } });
    expect(registration.ok(), await registration.text()).toBeTruthy();
    const { id: clientId } = await registration.json() as { id: string };
    const company = await request.post(`/backend/customers/${clientId}/companies`, { data: {
        companyName: 'Audit Company', taxId: '1234567890', billingAddress: address, shippingAddress: address,
    } });
    expect(company.ok(), await company.text()).toBeTruthy();
    await context.addInitScript(selection => localStorage.setItem('demoCustomer', JSON.stringify(selection)), { clientId, externalId });
    const response = await request.get('/backend/mobile-phones?amount=15');
    expect(response.ok(), await response.text()).toBeTruthy();
    const phones = await response.json() as Phone[];
    const products = phones.filter(phone => phone.price?.amount > 0 && phone.price.currency === 'PLN').slice(0, 2);
    expect(products).toHaveLength(2);
    const lines = products.map(phone => ({ productId: phone.id, quantity: 1 }));
    let cart = await request.put(`/backend/shopping-carts/${clientId}`, { data: { lines } });
    expect(cart.ok(), await cart.text()).toBeTruthy();
    const placed = await request.post(`/backend/orders/client/${clientId}`);
    expect(placed.ok(), await placed.text()).toBeTruthy();
    const order = await placed.json() as { id: string };
    cart = await request.put(`/backend/shopping-carts/${clientId}`, { data: { lines } });
    expect(cart.ok(), await cart.text()).toBeTruthy();
    const favorite = await request.post(`/backend/favorites/clients/${clientId}`, { data: { productId: products[0].id } });
    expect(favorite.ok(), await favorite.text()).toBeTruthy();
    const detail = await request.get(`/backend/mobile-phones/${products[0].id}`);
    expect(detail.ok(), await detail.text()).toBeTruthy();
    const { commonDescription } = await detail.json() as { commonDescription: { otherPhotos: string[] } };
    // Keep real BFF/service data. External development-storage image bytes alone are isolated.
    for (const url of new Set([...phones.map(phone => phone.mainPhoto), ...commonDescription.otherPhotos])) {
        expect(new URL(url).hostname).toMatch(/\.blob\.core\.windows\.net$/);
        await page.route(url, route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="200"><rect width="100" height="200" fill="silver"/></svg>' }));
    }
    return { clientId, products, order, photos: commonDescription.otherPhotos, externalFonts };
}

async function audit(page: Page, info: TestInfo, label: string) {
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page }).analyze();
    await info.attach(label.replaceAll(/[^a-z0-9-]/gi, '-') + '.json', { contentType: 'application/json', body: JSON.stringify({
        url: page.url(), viewport: page.viewportSize(), engine: result.testEngine,
        violations: result.violations, incomplete: result.incomplete,
        passedRules: result.passes.map(rule => rule.id),
    }, null, 2) });
    expect(result.violations, `${label}: ${JSON.stringify(result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })))}`).toEqual([]);
}

async function ready(page: Page, path: string) {
    await page.goto(path);
    if (path === '/home') await expect(page.locator('.featured-grid')).toBeVisible();
    else if (path === '/list') await expect(page.locator('.catalog-grid')).toBeVisible();
    else if (path.startsWith('/details/')) await expect(page.locator('.purchase-panel')).toBeVisible();
    else if (path === '/cart') await expect(page.locator('.cart-line')).toHaveCount(2);
    else if (path === '/favorites') await expect(page.locator('app-store-phone-card')).toHaveCount(1);
    else if (path === '/profile') await expect(page.getByLabel('First name', { exact: true })).toHaveValue('Audit');
    else if (path === '/orders') await expect(page.locator('.order-card')).toHaveCount(1);
    else await expect(page.getByRole('button', { name: 'Pay with Stripe', exact: true })).toBeEnabled();
}

for (const width of [390, 1440]) {
    test(`all storefront pages pass automated accessibility checks at ${width}px`, async ({ page, request, context }, info) => {
        const { products, order, externalFonts } = await prepare(request, context, page);
        await page.setViewportSize({ width, height: 844 });
        const paths = ['/home', '/list', `/details/${products[0].id}`, '/cart', '/favorites', '/profile', '/orders', `/orders/${order.id}`];
        for (const path of paths) {
            await ready(page, path);
            await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
            await expect(page.getByRole('main')).toHaveCount(1);
            await expect(page).toHaveTitle(/\| eCommerce$/);
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
            await audit(page, info, `${width}-${path}`);
            const fonts = await page.evaluate(() => [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family.replaceAll(/[\"']/g, '')));
            expect(fonts).toEqual(expect.arrayContaining(['Roboto', 'Material Icons']));
            expect(externalFonts).toEqual([]);
            if (width === 390) {
                await page.setViewportSize({ width: 320, height: 568 });
                expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
                await page.setViewportSize({ width, height: 844 });
            }
        }
    });
}

async function checkKeyboardVisibility(page: Page) {
    let first: string | null = null;
    let checked = 0;
    for (let step = 0; step < 180; step++) {
        await page.keyboard.press('Tab');
        const target = await page.evaluate(() => {
            const element = document.activeElement as HTMLElement | null;
            if (!element || element === document.body) return null;
            const rect = element.getBoundingClientRect();
            const header = document.querySelector('app-store-header')!.getBoundingClientRect();
            const nav = document.querySelector('app-store-mobile-nav nav')!.getBoundingClientRect();
            const purchase = document.querySelector('.mobile-purchase')?.getBoundingClientRect();
            const fixed = !!element.closest('app-store-header, app-store-mobile-nav, .mobile-purchase, .skip-link');
            return { key: element.outerHTML.slice(0, 220), top: rect.top, bottom: rect.bottom, height: rect.height,
                header: header.bottom, overlay: Math.min(nav.height ? nav.top : innerHeight, purchase?.height ? purchase.top : innerHeight), fixed };
        });
        if (!target) continue;
        if (target.key === first) break;
        if (!first) first = target.key;
        if (!target.fixed && target.height <= 120) {
            expect(target.top, target.key).toBeGreaterThanOrEqual(target.header - 1);
            expect(target.bottom, target.key).toBeLessThanOrEqual(target.overlay + 1);
            checked++;
        }
    }
    expect(checked).toBeGreaterThan(0);
}

test('mobile keyboard controls stay visible and page navigation resets entry position', async ({ page, request, context }) => {
    const { products } = await prepare(request, context, page);
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/home', '/list', `/details/${products[0].id}`, '/cart', '/profile']) {
        await ready(page, path);
        await checkKeyboardVisibility(page);
    }
    await ready(page, '/home');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    await ready(page, '/list');
    const details = page.locator('.catalog-grid .details').last();
    const href = await details.getAttribute('href');
    await details.focus();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator('.purchase-panel')).toBeVisible();
    await expect(page.getByRole('main')).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    const title = await page.getByRole('heading', { level: 1 }).boundingBox();
    const header = await page.getByRole('banner').boundingBox();
    expect(title!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    // Delay the next real catalog request to exercise restoration after its loading layout.
    let delayedCatalog = false;
    await page.route('**/backend/mobile-phones?amount=15', async route => {
        delayedCatalog = true;
        await new Promise(resolve => setTimeout(resolve, 250));
        await route.continue();
    }, { times: 1 });
    await page.goBack();
    await expect(page).toHaveURL(/\/list$/);
    await expect(page.locator('.catalog-grid')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    expect(delayedCatalog).toBe(true);
    // A new user action while waiting must cancel deferred restoration.
    await page.locator('.catalog-grid .details').last().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.purchase-panel')).toBeVisible();
    await page.route('**/backend/mobile-phones?amount=15', async route => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
    }, { times: 1 });
    await page.goBack();
    await expect(page.getByText('Loading smartphones', { exact: true })).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.catalog-grid')).toBeVisible();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(1000);
});

test('filter dialog and real empty/error states retain accessible controls', async ({ page, request, context }, info) => {
    const { products, photos } = await prepare(request, context, page);
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page, '/list');
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Filters', exact: true });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Close filters', exact: true })).toBeFocused();
    await page.waitForFunction(() => !document.querySelector('mat-sidenav')?.classList.contains('mat-drawer-animating'));
    await audit(page, info, 'mobile-filter-dialog');
    for (let index = 0; index < 7; index++) {
        await page.keyboard.press('Tab');
        expect(await drawer.evaluate(element => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeFocused();
    await page.goto('/list?minPrice=1000000');
    await expect(page.getByRole('heading', { name: 'No phones found', exact: true })).toBeVisible();
    await audit(page, info, 'empty-catalog');
    const missingProductId = randomUUID();
    const missingProduct = page.waitForResponse(response => new URL(response.url()).pathname === `/backend/mobile-phones/${missingProductId}`);
    await page.goto(`/details/${missingProductId}`);
    expect((await missingProduct).status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Couldn’t load this phone', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeEnabled();
    await audit(page, info, 'missing-product');
    const missingOrderId = randomUUID();
    const missingOrder = page.waitForResponse(response => new URL(response.url()).pathname === `/backend/orders/${missingOrderId}`);
    await page.goto(`/orders/${missingOrderId}`);
    expect((await missingOrder).status()).toBe(404);
    await expect(page.getByRole('alert')).toBeVisible();
    await audit(page, info, 'missing-order');
    for (const url of photos) await page.route(url, route => route.fulfill({ status: 404, body: '' }));
    await ready(page, `/details/${products[0].id}`);
    await expect(page.getByRole('button', { name: /^Unavailable photo 2 / })).toBeDisabled();
    await audit(page, info, 'unavailable-gallery-photos');
});

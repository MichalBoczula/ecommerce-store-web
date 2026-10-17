import { expect, test } from '@playwright/test';

type Phone = { name: string; mainPhoto: string };
type TopPhone = { commonDescription: Phone };

test('home and list display the main photos returned through the BFF', async ({ page, request }) => {
    const listResponse = await request.get('/backend/mobile-phones?amount=15');
    expect(listResponse.ok(), await listResponse.text()).toBeTruthy();
    const phones = await listResponse.json() as Phone[];
    expect(phones).toHaveLength(15);

    const topResponse = await request.get('/backend/mobile-phones/top');
    expect(topResponse.ok(), await topResponse.text()).toBeTruthy();
    const top = await topResponse.json() as TopPhone[];
    expect(top.length).toBeGreaterThan(0);
    const topPhones = top.map(phone => phone.commonDescription);

    // Keep the real catalog/BFF responses. Only external image bytes are a fixture,
    // so this UI gate does not depend on the lifetime or ACL of a development RG.
    const photoUrls = new Set([...phones, ...topPhones].map(phone => phone.mainPhoto));
    for (const url of photoUrls) {
        expect(new URL(url).hostname).toMatch(/\.blob\.core\.windows\.net$/);
        await page.route(url, async route => {
            expect(route.request().headers()['authorization']).toBeUndefined();
            await route.fulfill({
                contentType: 'image/svg+xml',
                body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="200"><rect width="100" height="200" fill="silver"/></svg>',
            });
        });
    }

    for (const screen of [{ path: '/home', phones: topPhones }, { path: '/list', phones }]) {
        await page.goto(screen.path);
        await expect(page.locator('.image img')).toHaveCount(screen.phones.length);
        for (const phone of screen.phones) {
            const image = page.getByRole('img', { name: phone.name, exact: true });
            await expect(image).toHaveAttribute('src', phone.mainPhoto);
            await image.scrollIntoViewIfNeeded();
            await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth))
                .toBeGreaterThan(0);
        }
        await expect(page.locator('img[src*="shiba"]')).toHaveCount(0);
    }
});

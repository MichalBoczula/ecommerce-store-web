import { expect, test } from '@playwright/test';

test('storefront navigation adapts across desktop, tablet and mobile widths', async ({ page }) => {
    await page.goto('/orders');
    for (const width of [360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 850 });
        const mobile = page.getByRole('navigation', { name: 'Mobile navigation' });
        const desktop = page.getByRole('navigation', { name: 'Main navigation' });
        if (width < 768) {
            await expect(mobile).toBeVisible();
            await expect(desktop).toBeHidden();
            await expect(mobile.getByRole('link', { name: 'Orders', exact: true })).toHaveAttribute('aria-current', 'page');
            await expect(page.getByRole('button', { name: 'Open filters' })).toBeVisible();
        } else {
            await expect(desktop).toBeVisible();
            await expect(mobile).toBeHidden();
        }
        expect(await page.getByRole('banner').evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Smartphones' }).click();
    await expect(page).toHaveURL(/\/list$/);
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await page.getByRole('button', { name: 'Close filters' }).click();
    await expect(page.getByRole('dialog', { name: 'Filters' })).toBeHidden();
});

test('mobile filters restore focus and bottom navigation remains accessible after scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/orders');
    const menu = page.getByRole('button', { name: 'Open filters' });
    await menu.click();
    const drawer = page.getByRole('dialog', { name: 'Filters' });
    await expect(drawer).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer.getByRole('button', { name: 'Close filters' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(menu).toBeFocused();
    await menu.click();
    await drawer.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page).toHaveURL(/\/list$/);
    await expect(drawer).toBeHidden();
    const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect.poll(() => page.evaluate(() => document.body.scrollHeight)).toBeGreaterThan(1688);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const bounds = await nav.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(845);
    await expect(page.getByRole('banner')).toBeInViewport();
    await nav.getByRole('link', { name: 'Profile', exact: true }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await nav.getByRole('link', { name: 'Cart', exact: true }).click();
    await expect(page).toHaveURL(/\/cart$/);
});

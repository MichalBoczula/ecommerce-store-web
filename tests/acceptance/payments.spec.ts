import { randomUUID } from 'node:crypto';
import { APIRequestContext, BrowserContext, expect, Page, test } from '@playwright/test';

const fixtureUrl = process.env.STRIPE_FIXTURE_URL ?? 'http://127.0.0.1:15138';
type Session = { id: string; amount_total: number; success_url: string; cancel_url: string };

async function createOrder(request: APIRequestContext, context: BrowserContext) {
    const address = { postalCode: '00-001', city: 'Warsaw', street: 'Main Street', buildingNumber: '10', apartmentNumber: '2' };
    const externalId = `web-stripe-${randomUUID()}`;
    const registration = await request.post('/backend/registrations/customers', {
        data: { externalId, individual: {
            firstName: 'Payment', lastName: 'Customer', email: `${randomUUID()}@example.com`,
            phone: '123456789', billingAddress: address, shippingAddress: address,
        } },
    });
    expect(registration.ok(), await registration.text()).toBeTruthy();
    const { id: clientId } = await registration.json() as { id: string };
    await context.addInitScript(selection => localStorage.setItem('demoCustomer', JSON.stringify(selection)), { clientId, externalId });
    const products = await request.get('/backend/mobile-phones?amount=100');
    expect(products.ok(), await products.text()).toBeTruthy();
    const phone = (await products.json() as { id: string; price?: { amount: number; currency: string } }[])
        .find(product => product.price?.currency === 'PLN' && product.price.amount >= 2);
    expect(phone, 'The real catalog must contain a payable PLN product.').toBeDefined();
    if (!phone) throw new Error('No payable PLN product was returned.');
    const cart = await request.put(`/backend/shopping-carts/${clientId}`, {
        data: { lines: [{ productId: phone.id, quantity: 1 }] },
    });
    expect(cart.ok(), await cart.text()).toBeTruthy();
    const placed = await request.post(`/backend/orders/client/${clientId}`);
    expect(placed.ok(), await placed.text()).toBeTruthy();
    return await placed.json() as { id: string; clientId: string; status: string; totalAmount: number };
}

async function sessions(request: APIRequestContext, orderId: string): Promise<Session[]> {
    const result = await request.get(`${fixtureUrl}/fixtures/sessions?order=${orderId}`);
    expect(result.ok(), await result.text()).toBeTruthy();
    return result.json() as Promise<Session[]>;
}

async function openCheckout(page: Page, request: APIRequestContext, orderId: string) {
    // Only the external provider page is substituted. Browser-to-BFF API calls stay real.
    await page.route('https://checkout.stripe.com/**', route => route.fulfill({
        contentType: 'text/html', body: '<h1>Deterministic provider Checkout fixture</h1><p>Card entry belongs to Stripe.</p>',
    }));
    await page.goto(`/orders/${orderId}`);
    const pay = page.getByRole('button', { name: /Pay with Stripe|Resume Stripe Checkout/ });
    await expect(pay).toBeEnabled();
    await pay.click();
    await expect(page).toHaveURL(/^https:\/\/checkout\.stripe\.com\/c\/pay\/cs_test_/);
    const records = await sessions(request, orderId);
    return records.at(-1)!;
}

async function event(request: APIRequestContext, sessionId: string, outcome: string) {
    const response = await request.post(`${fixtureUrl}/fixtures/events/${sessionId}/${outcome}`);
    expect(response.ok(), await response.text()).toBeTruthy();
}

async function fulfill(request: APIRequestContext) {
    const response = await request.post(`${fixtureUrl}/fixtures/fulfill`);
    expect(response.ok(), await response.text()).toBeTruthy();
}

async function noInvoice(request: APIRequestContext, orderId: string) {
    expect((await request.get(`/backend/invoices/by-order/${orderId}`)).status()).toBe(404);
    expect((await (await request.get(`/backend/orders/${orderId}`)).json() as { status: string }).status).toBe('Created');
}

test('success return waits for signed delivery and real fulfillment; repeats reuse one invoice', async ({ page, context, request }) => {
    const order = await createOrder(request, context);
    const session = await openCheckout(page, request, order.id);
    const billing = await request.get(`/backend/client-data-versions/client/${order.clientId}`);
    expect(billing.ok(), await billing.text()).toBeTruthy();
    expect((await billing.json() as { clientName: string }).clientName).toBe('Payment Customer');
    expect(session.amount_total).toBe(Math.round(order.totalAmount * 100));
    await page.goto(session.success_url);
    await expect(page).toHaveURL(new RegExp(`/orders/${order.id}\\?checkout=success`));
    await expect(page.getByText('Payment status: pending', { exact: false })).toBeVisible();
    await noInvoice(request, order.id);
    await event(request, session.id, 'success');
    await expect(page.getByText('Payment confirmed. Order and invoice fulfillment', { exact: false })).toBeVisible();
    await fulfill(request);
    await expect(page.getByText('Status: Paid', { exact: true })).toBeVisible();
    await expect(page.getByText('Invoice ready:', { exact: false })).toBeVisible();
    const invoice = await (await request.get(`/backend/invoices/by-order/${order.id}`)).json() as { id: string };
    await event(request, session.id, 'success');
    await fulfill(request);
    const repeated = await (await request.get(`/backend/invoices/by-order/${order.id}`)).json() as { id: string };
    expect(repeated.id).toBe(invoice.id);
    await page.reload();
    await expect(page.getByText('Invoice ready:', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pay with Stripe' })).toBeDisabled();
    expect(await sessions(request, order.id)).toHaveLength(1);
});

test('cancel return resumes the existing open Checkout without another payment attempt', async ({ page, context, request }) => {
    const order = await createOrder(request, context);
    const first = await openCheckout(page, request, order.id);
    const payment = await (await request.get(`/backend/payments/order/${order.id}`)).json() as { id: string };
    await page.goto(first.cancel_url);
    await expect(page.getByText('Checkout was closed.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resume Stripe Checkout' })).toBeEnabled();
    await noInvoice(request, order.id);
    await page.getByRole('button', { name: 'Resume Stripe Checkout' }).click();
    await expect(page).toHaveURL(new RegExp(first.id));
    expect(await sessions(request, order.id)).toHaveLength(1);
    expect((await (await request.get(`/backend/payments/order/${order.id}`)).json() as { id: string }).id).toBe(payment.id);
});

for (const outcome of ['failed', 'expired']) {
    test(`${outcome} event permits a new attempt on the same Payment`, async ({ page, context, request }) => {
        const order = await createOrder(request, context);
        const first = await openCheckout(page, request, order.id);
        const payment = await (await request.get(`/backend/payments/order/${order.id}`)).json() as { id: string };
        await event(request, first.id, outcome);
        await page.goto(first.cancel_url);
        await expect(page.getByText('Payment status: failed', { exact: false })).toBeVisible();
        await noInvoice(request, order.id);
        await page.getByRole('button', { name: 'Pay with Stripe' }).click();
        await expect(page).toHaveURL(/^https:\/\/checkout\.stripe\.com/);
        const attempts = await sessions(request, order.id);
        expect(attempts).toHaveLength(2);
        expect(attempts[1].id).not.toBe(first.id);
        expect((await (await request.get(`/backend/payments/order/${order.id}`)).json() as { id: string }).id).toBe(payment.id);
    });
}

test('repeated Pay clicks create a single hosted session', async ({ page, context, request }) => {
    const order = await createOrder(request, context);
    await page.route('https://checkout.stripe.com/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Provider fixture</h1>' }));
    await page.goto(`/orders/${order.id}`);
    const pay = page.getByRole('button', { name: 'Pay with Stripe' });
    await expect(pay).toBeEnabled();
    await pay.evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
    await expect(page).toHaveURL(/^https:\/\/checkout\.stripe\.com/);
    expect(await sessions(request, order.id)).toHaveLength(1);
});

test('forged success query cannot pay an order or issue an invoice', async ({ page, context, request }) => {
    const order = await createOrder(request, context);
    await page.goto(`/orders/${order.id}?checkout=success`);
    await expect(page.getByText('Status: Created', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pay with Stripe' })).toBeEnabled();
    await expect(page.getByText('Invoice ready:', { exact: false })).toHaveCount(0);
    await noInvoice(request, order.id);
    expect(await sessions(request, order.id)).toHaveLength(0);
});

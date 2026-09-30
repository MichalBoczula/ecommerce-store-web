import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('preparing a payment keeps the order Created and does not issue an invoice', async ({ page, context, request }) => {
    const externalId = `web-payment-${randomUUID()}`;
    const address = { postalCode: '00-001', city: 'Warsaw', street: 'Main Street', buildingNumber: '10', apartmentNumber: '2' };
    const registration = await request.post('/backend/registrations/customers', {
        data: { externalId, individual: {
            firstName: 'Payment', lastName: 'Customer', email: `${randomUUID()}@example.com`,
            phone: '123456789', billingAddress: address, shippingAddress: address,
        } },
    });
    expect(registration.ok(), await registration.text()).toBeTruthy();
    const { id: clientId } = await registration.json() as { id: string };
    await context.addInitScript(id => localStorage.setItem('demoClientId', id), clientId);

    const products = await request.get('/backend/mobile-phones?amount=15');
    expect(products.ok(), await products.text()).toBeTruthy();
    const phone = (await products.json() as { id: string; price?: { amount: number } }[])
        .find(product => (product.price?.amount ?? 0) > 0);
    expect(phone).toBeDefined();
    if (!phone) throw new Error('No positive-priced product was returned.');
    const cart = await request.put(`/backend/shopping-carts/${clientId}`, {
        data: { lines: [{ productId: phone.id, quantity: 1 }] },
    });
    expect(cart.ok(), await cart.text()).toBeTruthy();
    const placed = await request.post(`/backend/orders/client/${clientId}`);
    expect(placed.ok(), await placed.text()).toBeTruthy();
    const order = await placed.json() as { id: string; status: string };
    expect(order.status).toBe('Created');

    await page.goto(`/orders/${order.id}`);
    await expect(page.getByRole('button', { name: 'Prepare payment' })).toBeVisible();
    await page.getByRole('button', { name: 'Prepare payment' }).click();
    await expect(page.getByText('Payment status: created', { exact: false })).toBeVisible();
    const read = await request.get(`/backend/payments/order/${order.id}`);
    expect(read.ok(), await read.text()).toBeTruthy();
    const payment = await read.json() as { id: string; order_id: string; status: string };
    expect(payment.order_id).toBe(order.id);
    expect(payment.status).toBe('created');
    const repeated = await request.post(`/backend/payments/${order.id}/pay`);
    expect(repeated.status()).toBe(200);
    expect((await repeated.json() as { id: string }).id).toBe(payment.id);

    const stillCreated = await request.get(`/backend/orders/${order.id}`);
    expect((await stillCreated.json() as { status: string }).status).toBe('Created');
    const invoice = await request.post(`/backend/invoices/${clientId}/${order.id}`);
    expect(invoice.status()).toBe(400);
});

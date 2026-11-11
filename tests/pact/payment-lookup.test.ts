import { Pact } from '@pact-foundation/pact';
import { firstValueFrom } from 'rxjs';
import { expect, it } from 'vitest';
import { PaymentsKiotaRepository } from '../../src/app/features/payments/infrastructure/api/payments-kiota-repository';
import { throughBrowserPrefix, writeReproduciblePact } from './web-pact';

const payment = {
  id: '45000000-0000-4000-8000-000000000001',
  order_id: '45000000-0000-4000-8000-000000000002',
  status: 'succeeded',
  amount_minor: 614754,
  currency: 'PLN',
};
const missingOrderId = '45000000-0000-4000-8000-000000000098';
const paymentState = 'a succeeded payment exists for an order and another order has no payment';

async function verify(dir: string): Promise<void> {
  const pact = new Pact({ consumer: 'web', provider: 'payments', dir });
  const state = { payment, missingOrderId };
  const paymentPath = `/payments/order/${payment.order_id}`;
  const missingPath = `/payments/order/${missingOrderId}`;

  await pact.addInteraction()
    .given(paymentState, state)
    .uponReceiving('load a succeeded payment by order ID')
    .withRequest('GET', paymentPath)
    .willRespondWith(200, response => response.jsonBody(payment))
    .executeTest(({ url }) => throughBrowserPrefix(url, paymentPath, async () => {
      const result = await firstValueFrom(new PaymentsKiotaRepository().getByOrderId(payment.order_id));
      expect(result).toEqual({
        id: payment.id,
        orderId: payment.order_id,
        status: 'succeeded',
        amountMinor: 614754,
        currency: 'PLN',
      });
    }));

  await pact.addInteraction()
    .given(paymentState, state)
    .uponReceiving('look up a payment for an order without one')
    .withRequest('GET', missingPath)
    .willRespondWith(404, response => {
      response.headers({ 'Content-Type': 'application/problem+json' }).jsonBody({ status: 404 });
    })
    .executeTest(({ url }) => throughBrowserPrefix(url, missingPath, async () => {
      const result = await firstValueFrom(new PaymentsKiotaRepository().getByOrderId(missingOrderId));
      expect(result).toBeNull();
    }));
}

it('emits a reproducible Web Payments lookup Pact from the real Kiota repository',
  () => writeReproduciblePact('payments', 2, verify));

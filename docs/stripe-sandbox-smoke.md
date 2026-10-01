# STRIPE/4 actual sandbox browser smoke

Ordinary acceptance CI uses deterministic provider-boundary fixtures. Stripe documents that its hosted frontend has security measures against automated testing: <https://docs.stripe.com/automated-testing>. This operator smoke uses an actual Stripe sandbox account and hosted Checkout. Do not include the acceptance overlay here and do not use live keys or real card data.

## Setup

1. Store `STRIPE_SECRET_KEY=sk_test_...` and the test endpoint's `STRIPE_WEBHOOK_SECRET=whsec_...` in your private environment or an ignored `.env` file. Do not commit keys, run `docker compose config` with secrets, or paste payloads/hosted URLs into logs. Payments rejects live keys.
2. Start the actual stack with `docker compose -f compose/ecommerce-compose.yml -f compose/ecommerce-compose.stripe-sandbox.yml up -d --build`. The return origin defaults to `http://localhost:4200`; set `STRIPE_RETURN_BASE_URL` for another browser-accessible origin.
3. Configure the sandbox endpoint to the public HTTPS BFF URL `/payments/webhooks/stripe`. For local work, run Stripe CLI `stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired --forward-to http://localhost:4200/backend/payments/webhooks/stripe`, use that listener's signing secret in Payments and recreate the Payments container. The frontend strips `/backend`; YARP forwards raw bytes and signature to Payments at `/payments/webhooks/stripe`.
4. Register a demo customer using the existing BFF registration flow and select its external ID in Account → Profile. Fill required billing/shipping data and a Polish billing phone (9 digits or +48). Checkout copies the current individual billing snapshot to Invoice before opening Stripe. The pinned Invoice validators currently reject street spaces and email hyphens that Users accepts. Use compatible synthetic demo data for this smoke; do not alter a real billing address or email to bypass validation. A rejected snapshot stops Checkout and displays the exact validation messages. Put a PLN product worth at least PLN 2 in the cart and place the order. Open its saved order details.

## Browser checks

| Scenario | Action | Required authoritative result |
| --- | --- | --- |
| Card success | Pay with Stripe; use `4242 4242 4242 4242`, a future expiry and any valid test CVC. | Actual sandbox request in Workbench, verified payment `succeeded`; initially processing until worker completes. |
| Card decline | Use `4000 0000 0000 0002`. | Stripe shows the decline; return/resume retains pending/open Checkout, Created order, no invoice. |
| Authentication | Use `4000 0025 0000 3155` and exercise Stripe's test authentication challenge. | Success only after verified event; cancellation/failure does not invent payment success. |
| Cancel/resume | Return without paying, then Resume Stripe Checkout. | Same open Checkout/payment attempt; no duplicate charge/invoice. |
| Delayed fulfillment | Return after verified successful payment before running the worker. | Payment confirmed, order/invoice processing; Pay stays unavailable. |
| Repeat return | Reload the return/order screen after completion. | Same completed invoice reference and Paid order, no new Checkout. |

Test cards: <https://docs.stripe.com/testing>. BLIK browser validation should use the guided scenario instructions in the Payments repository; its API-only BLIK CI scenario does not prove the hosted browser flow.

Run the actual one-shot worker after verified delivery:

```bash
docker compose -f compose/ecommerce-compose.yml -f compose/ecommerce-compose.stripe-sandbox.yml exec payments \
  python -m ecommerce_store_payments.infrastructure.persistence.mongodb.fulfill_payments --limit 100
```

Refresh status if bounded automatic polling has paused. Expect order `Paid` and `Invoice ready` with one completed invoice reference. The local PDF storage location is not a downloadable browser URL; durable download delivery remains DEP/7. Scheduling this worker in cloud runtime remains DEP/6.

Record sandbox mode, scenario, request/event IDs, payment/order/invoice IDs, date and result. Exclude keys, signing secrets, hosted URLs, raw payloads and customer billing data. This document is a checklist, not a claim that the actual browser smoke has run. Do not mark STRIPE/4 fully complete until its required review/merge and this smoke are recorded.

# PACT/10 Web → Payments lookup

The storefront's payment progress view uses `PaymentsKiotaRepository.getByOrderId`
to read `GET /backend/payments/order/{orderId}`. The consumer test checks the
browser path and replays the request against the Pact mock at
`GET /payments/order/{orderId}`, the route owned by Payments.

| Scenario | Expected result |
| --- | --- |
| Load a succeeded payment | HTTP 200 with `id`, `order_id`, `status`, `amount_minor` and `currency`. The repository maps the IDs, status and exact integer amount into the storefront model. |
| Look up an order without a payment | HTTP 404 with `application/problem+json` and `status: 404`. The repository returns `null`. |

Run `npm run test:pact` with Node 22 or later. The test generates Pact V4 twice
and compares the bytes. The required unit job uploads `web-payments-pact`
with the Pact and SHA-256 manifest. After the quality gate, `publish-web-pact (payments)`
publishes the original bytes on a push or manual run on `master` using `web-ci`.
The `web-payments-publication` receipt links the Web commit, Pact hash and CI run.

Payments provider verification follows publication. It can seed a succeeded
payment from the pinned provider state and leave the second order without a
payment. Payment preparation and hosted Checkout are separate interactions.

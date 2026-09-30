# ADR-0005: Prepare a payment without claiming settlement

- Status: Accepted
- Date: 2026-09-30

## Context

The Payments API exposes `POST /payments/{order_id}/pay` and `GET /payments/order/{order_id}`. The first operation creates a `created` payment after checking the order and is idempotent for that order. The current contract has no provider checkout session, confirmed charge, cancellation route, or order status callback. An Invoice can be issued only after the order is `Paid`.

## Decision

Generate a Payments Kiota client from the pinned upstream document and use it through the BFF. On a selected customer's `Created` order, read the existing payment and offer an explicitly labeled “Prepare payment” action if none exists. Display the upstream status and reference; preserve the order's status. Reject mismatched payment order IDs in the mapper and discard stale state responses after navigation. Do not expose an invoice action on payment preparation.

## Consequences

The storefront can demonstrate payment creation and idempotent reads. The UI explicitly explains that `created` is not a charge or a paid order. A complete checkout needs the Payments provider confirmation contract, the transition to `Paid`, and an invoice integration, followed by new browser and container tests. The browser-local customer selection remains a demo mechanism, not authorization.

## Alternatives considered

- Label `POST /pay` as a completed payment: it would misrepresent a record without provider settlement.
- Set the order to `Paid` in the browser: it would bypass server-side confirmation and issue invoices without proof of payment.

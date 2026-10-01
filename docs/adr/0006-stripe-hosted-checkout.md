# ADR-0006: Stripe-hosted Checkout and authoritative return state

Status: Accepted. Date: 2026-10-01. Supersedes the provider-free UI scope of ADR-0005.

## Context

Merged Payments supports sandbox Checkout, signed events and durable fulfillment. Orders owns purchase money. Building raw payment inputs would duplicate Stripe's payment entry, authentication and method-specific behavior. The current portfolio uses browser-local demo customer selection rather than an authenticated principal.

## Decision

Use Stripe-hosted Checkout. The Angular Material order summary and Pay action remain ours; Stripe owns card/BLIK entry. No Stripe.js dependency is needed for redirecting to the returned HTTPS URL. A handwritten adapter validates the exact `checkout.stripe.com` host and sandbox path. Checkout creation is bodyless through the BFF. It rechecks the order/customer association before requesting Checkout. This is a demo UI check, not production authorization.

Before creating/resuming Checkout, an adapter ensures Invoice has the selected customer’s billing snapshot. It reads Users by external ID, verifies the returned GUID matches the order customer, copies individual billing/contact fields through the BFF and reuses an unchanged snapshot. Legacy GUID-only selection can reuse an existing snapshot; otherwise it requires selecting the profile first. The current PLN demo maps 9-digit Polish phone numbers and +48/0048 formats into Invoice’s separate number/prefix fields; other formats require a supported profile before payment. This closes the real registration-to-invoice gap without inserting billing fixtures in tests. Invoice still selects the latest customer version during fulfillment; production orchestration and per-order billing-version binding remain separate architecture work. The pinned Invoice validators are stricter than Users: street spaces and email hyphens are currently rejected. The adapter preserves the profile and exposes validation messages before contacting Stripe. Acceptance uses synthetic data valid for both APIs; validator compatibility must be corrected in Invoice before relying on arbitrary Users profiles.

NgRx uses an exhaustive Checkout effect to prevent overlapping commands. Late results cannot redirect after navigation or customer selection changes. The backend retains the stable Payment and idempotent attempt semantics. Open pending Checkout is resumed; failed/expired attempts can create another provider session. After an ambiguous request error the UI requires a status refresh before trying again.

Only customer/order routing context is held in this browser tab's session storage. Hosted URLs are used immediately, never persisted in NgRx actions or storage. `/orders?checkout=success|cancel` recovers the matching order when tab context is available. Without it, normal order history remains available. Neither query string changes payment/order state. Cancellation return does not declare the backend payment cancelled.

A repository composes authoritative payment, order and completed invoice reads through the BFF. It verifies association and maps invoice metadata without storage URLs. Polling stops on a failed/cancelled payment or successful payment plus Paid order plus completed invoice, and pauses after 15 completed reads. Pending payment and recoverable fulfillment are separate messages. Navigation destroys polling. Local `file://` PDFs have no usable browser download; DEP/7 provides that boundary later. The API does not run its own fulfillment loop; DEP/6 supplies durable recurring scheduling.

## Verification

Vitest covers mapping, URL validation, stale results, association checks, double submission and bounded polling. Playwright runs real frontend/BFF/Payments/Orders/Invoice containers. Only the external SDK provider boundary and hosted provider page are fixtures. Tests deliver HMAC-signed snapshots through YARP and invoke the production one-shot worker against real APIs/databases. They check success, delayed event/fulfillment, cancel/resume, failed/expired retry, repeated submission and a forged success query. Actual hosted sandbox browser smoke is a separate operator check, not evidence produced by these fixtures.

## Consequences and alternatives

Hosted Checkout is a redirect and returns to the originating browser tab. Embedded Checkout or Payment Element can be adopted later if an in-page payment experience becomes a product requirement. Real production access control, worker scheduling and durable document downloads remain explicit follow-up work. Compose pins the scanned STRIPE/4 BFF publication from merged PR #13 by digest; the browser acceptance stack verifies Checkout and fulfillment against that published gateway.

# PACT/10 Web → BFF registration

The Web acceptance suite uses the BFF to create a demo customer and confirm its
cart. It also exercises explicit cart repair for a legacy profile. Both
acceptance and Pact use the same HTTP client in `tests/support/bff-registration.ts`.
The Angular profile screen loads existing customers by external ID.

| Scenario | BFF request | Response Web acceptance uses |
| --- | --- | --- |
| Register a demo customer with a cart | `POST /registrations/customers` with the external ID and individual details, including billing and shipping addresses | HTTP 200 with a customer GUID in `id` |
| Repair a missing cart for an existing customer | `POST /registrations/customers/{externalId}/cart` with no body | HTTP 200 with the existing customer GUID in `id` |

The Pact test checks the browser-facing `/backend` prefix and exercises the
request and response against the BFF route on the mock. The browser acceptance
suite goes through the real proxy, checks cart ownership and contents, and
checks that repeating repair preserves the same cart.

Run `npm run test:pact` with Node 22 or later. The test generates Pact V4 twice
and compares the bytes. The Web unit job uploads `web-bff-pact` with its
SHA-256 manifest. After the quality gate on `master`, Web CI publishes the
original artifact with the existing `web-ci` publisher. BFF provider
verification can then pin that publication.

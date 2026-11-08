# PACT/10 Web → Products catalog lookup

The storefront calls `POST /backend/mobile-phones/by-ids` through its production
Kiota repository. The consumer test checks the browser path before forwarding
the request to the Pact mock on `POST /mobile-phones/by-ids`. Products owns the
data contract. The existing real-container Playwright suite covers the deployed
Nginx and BFF routing behavior.

| Scenario | Expected result |
| --- | --- |
| Look up one active phone for the cart or favorites | HTTP 200 with the exact fixture ID, name, brand, photo, price, currency, and display details. The repository maps the result to the storefront model. |
| Look up an existing and a missing ID in the same batch | HTTP 404 for the batch. The repository surfaces `CatalogProductsNotFoundError`. |

The contract uses registry identities `web` and `products`. The list, detail,
top and filter operations remain open for Pact coverage.

Run `npm run test:pact` with Node 22 or later. The test runs two independent
Pact v4 verifications and checks that the JSON bytes match. The required
`unit-tests` CI job uploads those bytes and a SHA-256 manifest as
`web-products-pact`.

The `publish-web-products-pact` job publishes after a successful `master` push
when the Actions variable `PACT_REGISTRY_URL` is set. Use the existing Pact
HTTPS origin and a `PACT_PUBLISHER_TOKEN` secret with `web-ci` scoped to
`["web"]` in Terraform. The job records the exact Web commit and original
artifact hash in `web-products-publication`.

The Products verifier will take that published artifact, seed the priced phone
using the provider-state parameters, and confirm the other ID is absent. It
will replay both interactions against the real Products API and SQL Server.

# Upstream API baseline for Angular

The four OpenAPI documents and `manifest.json` are copied byte-for-byte from
[`ECommerceStoreBFF/contracts/upstream`](https://github.com/MichalBoczula/ECommerceStoreBFF/tree/369a93914dd3052ba5ae5a85b008c18536076fdf/contracts/upstream)
at merged commit `369a93914dd3052ba5ae5a85b008c18536076fdf` (BFF PR #13).
The STRIPE/4 baseline passed its upstream image verification and CI. The manifest records the
published upstream image digests and each OpenAPI SHA-256. The Invoice API is
named `orders` in the frontend client because it owns carts and orders too.

Run `npm run generate:clients` from the repository root. The script checks the
specification checksums, uses Kiota 1.34.1, and writes the four TypeScript
clients to `src/app/shared/infrastructure/api-clients/`. On Linux x64 it
downloads a checksum-pinned Kiota binary into ignored `.tools/`; on another
platform, set `KIOTA_BIN` to a Kiota 1.34.1 executable. Generated files and
`kiota-lock.json` are committed, while `.kiota.log` is ignored. Do not edit
generated files manually.

Payments' published FastAPI document contains OpenAPI 3.1 nullable `anyOf`
schemas that Kiota 1.34.1's TypeScript generator cannot resolve. The script
normalizes only those nullable unions in a temporary input after checking the
published document's checksum. The pinned document remains unchanged.

When an upstream contract changes, update its pinned BFF baseline first,
review the OpenAPI diff, then copy the four documents and manifest from the
new BFF commit and regenerate these clients. Business paths in these OpenAPI
documents are the public BFF paths. The request adapters set the BFF base URL
at runtime.

Compose pins the scanned BFF image published from that merged commit:
`mb0101/ecommerce-store-bff-api@sha256:3ac990abd5926390f2267b74394f05106aa776756f73aadbe36d8fe30a9ed59d`.
[BFF master CI](https://github.com/MichalBoczula/ECommerceStoreBFF/actions/runs/36816259182)
verified 64 integration tests, image health and security scanning before publishing
the commit and `latest` tags with this same digest. This image includes STRIPE/4
contract updates, query-string-free request logging and the OpenSSL security patch.
The browser acceptance stack uses this exact image for Checkout, signed webhook
forwarding and completed invoice lookup.

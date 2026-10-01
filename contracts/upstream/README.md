# Upstream API baseline for Angular

The four OpenAPI documents and `manifest.json` are copied byte-for-byte from
[`ECommerceStoreBFF/contracts/upstream`](https://github.com/MichalBoczula/ECommerceStoreBFF/tree/d6d323da178f24baaebd5bc9ec4051e7c219b912/contracts/upstream)
at commit `d6d323da178f24baaebd5bc9ec4051e7c219b912`. The STRIPE/4 baseline is reviewed in BFF PR #13 and passed its upstream image
verification and CI. The manifest records the
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

The currently published BFF/12 image remains pinned in Compose: its existing YARP
catch-all already forwards Checkout and invoice lookup without schema coupling.
BFF PR #13 updates generated clients, documentation, logging and the security
patch. Pin its scanned published image after that PR is merged and published.

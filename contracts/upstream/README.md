# Upstream API baseline for Angular

The four OpenAPI documents and `manifest.json` are copied byte-for-byte from
[`ECommerceStoreBFF/contracts/upstream`](https://github.com/MichalBoczula/ECommerceStoreBFF/tree/8a657f8028e1f2adcf7bf3f41bd1ef9d53564455/contracts/upstream)
at commit `8a657f8028e1f2adcf7bf3f41bd1ef9d53564455`
([BFF PR #14](https://github.com/MichalBoczula/ECommerceStoreBFF/pull/14)).
This Products photo baseline replaces only Products from the earlier STRIPE/4 baseline.
Its OpenAPI is the exact `generated-contract/openapi.json` artifact from successful
[Products master CI 38964842210](https://github.com/MichalBoczula/ProductsCatalog/actions/runs/38964842210),
commit `e81f779393780c95b878463beb710481e4d744c4`. That run also published the
Products image digest recorded in the manifest and local Compose stack.
The schema adds required `MobilePhoneDto.mainPhoto` for list, filter and ID lookups;
existing top-product and details photo fields remain available. No business path changes.
The Invoice API is named `orders` in the frontend client because it owns carts and orders too.

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

Compose retains the scanned BFF image published from the STRIPE/4 merged commit
`369a93914dd3052ba5ae5a85b008c18536076fdf`:
`mb0101/ecommerce-store-bff-api@sha256:3ac990abd5926390f2267b74394f05106aa776756f73aadbe36d8fe30a9ed59d`.
[BFF master CI](https://github.com/MichalBoczula/ECommerceStoreBFF/actions/runs/36816259182)
verified 64 integration tests, image health and security scanning before publishing
the commit and `latest` tags with this same digest. This image includes STRIPE/4
contract updates, query-string-free request logging and the OpenSSL security patch.
The browser acceptance stack retains this exact BFF image for transparent Products
forwarding, Checkout, signed webhook forwarding and completed invoice lookup. The
Products container uses the newer digest in the manifest; the additive photo field
does not require changing YARP routes.

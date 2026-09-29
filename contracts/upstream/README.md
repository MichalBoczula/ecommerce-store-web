# Upstream API baseline for Angular

The three OpenAPI documents and `manifest.json` are copied byte-for-byte from
[`ECommerceStoreBFF/contracts/upstream`](https://github.com/MichalBoczula/ECommerceStoreBFF/tree/5958e0a50200df48539a2d479208f3880c29a72d/contracts/upstream)
at commit `5958e0a50200df48539a2d479208f3880c29a72d`. The manifest records the
published upstream image digests and each OpenAPI SHA-256. The Invoice API is
named `orders` in the frontend client because it owns carts and orders too.

Run `npm run generate:clients` from the repository root. The script checks the
specification checksums, uses Kiota 1.34.1, and writes the three TypeScript
clients to `src/app/shared/infrastructure/api-clients/`. On Linux x64 it
downloads a checksum-pinned Kiota binary into ignored `.tools/`; on another
platform, set `KIOTA_BIN` to a Kiota 1.34.1 executable. Generated files and
`kiota-lock.json` are committed, while `.kiota.log` is ignored. Do not edit
generated files manually.

When an upstream contract changes, update its pinned BFF baseline first,
review the OpenAPI diff, then copy the three documents and manifest from the
new BFF commit and regenerate these clients. Business paths in these OpenAPI
documents are the public BFF paths. The request adapters set the BFF base URL
at runtime.

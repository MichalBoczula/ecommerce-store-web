# ADR-0001: Keep the BFF as the browser's API boundary

- Status: Accepted
- Date: 2026-09-30

## Context

The storefront reads ProductsCatalog, Users, and Orders/Invoices. The BFF exposes their ordinary paths through YARP and proxies each upstream OpenAPI document. Calling upstream containers from the browser would require separate origins, deployment addresses, and browser-facing contracts. The upstream DTOs change independently of the frontend's presentation models.

## Decision

Use one browser-visible `/backend` prefix on the frontend origin. The Angular development proxy and Nginx remove it before forwarding to the BFF. Keep the BFF's public business paths unchanged; `/api/products`, `/api/users`, and `/api/orders` are documentation prefixes, not business-route prefixes. Generate one TypeScript Kiota client each for Products, Users, and Invoice/Orders from the reviewed OpenAPI documents under `contracts/upstream/`. Pin the source manifests and Kiota version, commit generated output, and reject regeneration drift in CI. Handwritten feature repositories and mappers translate Kiota DTOs to domain-facing models. No separate generated BFF client is needed for the current transparent routes.

## Consequences

Development and container runtime need a working frontend proxy and reachable BFF. Updating an upstream contract requires a reviewed BFF baseline, a regenerated client, mapper review, and tests; generated files are not patched manually. The frontend's demo client ID does not establish identity or authorization. A future explicit BFF registration use case (BFF/11) is a new operation and must be documented and tested when implemented; the current YARP `/customers` proxy does not create a cart.

## Alternatives considered

- Let the browser call all three APIs directly: distributes upstream addresses and CORS requirements to the UI.
- Generate a fourth BFF client from the proxy's documentation routes: duplicates the upstream operation types without a distinct current business contract.
- Replace the YARP paths with frontend-specific service prefixes: changes the existing BFF route contract.

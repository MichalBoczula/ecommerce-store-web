# ECommerceStoreWeb

## Purpose

Angular storefront for the ECommerce Store portfolio. It presents catalog products, favorites, a shopping cart, checkout, order history, and a customer profile. The browser calls the BFF on the frontend origin; ProductsCatalog, Users, and Orders/Invoices remain separate APIs behind that boundary. This repository does not own customer registration, payment, or invoice creation.

## Engineering approach

Features keep handwritten domain models and rules separate from application facades, NgRx state, Kiota-backed infrastructure, and presentation components. Generated clients reflect reviewed upstream OpenAPI contracts and are never edited by hand. A request adapter sends all three clients through the BFF, while feature repositories map their DTOs to frontend models. See [ADR-0001](docs/adr/0001-bff-and-kiota-boundary.md).

The Invoice cart contract stores only `productId` and `quantity`. The cart view looks up current product information in ProductsCatalog and labels totals as estimates. Checkout creates an order through Invoice, shows the final total from its saved response, and refreshes cart and order data. Order history uses the `productVersion` snapshot and totals returned by Invoice, so a later catalog change does not rewrite a past order. The frontend does not create a missing cart during an add action; registration is expected to provide one, but that backend orchestration is outstanding.

## Architecture

| Component | Responsibility |
| --- | --- |
| `src/app/features/mobile-phones` | Catalog screens, filtering, product lookup, and mapping. |
| `src/app/features/users` | Favorites and customer profile state, repositories, and views. |
| `src/app/features/cart` | Cart mutations, checkout command state, catalog enrichment, and view. |
| `src/app/features/orders` | Order history and detail views using Invoice snapshots. |
| `src/app/shared/infrastructure` | Same-origin BFF adapter and generated Kiota clients. |
| `src/app/shared/application/customer-context.ts` | Shared browser-local demo customer selection for cart, favorites, and orders. |
| `src/proxy.conf.json` and `nginx.conf` | Remove `/backend` in development and container runtime respectively. |
| `tests/acceptance` | Browser scenarios through the real frontend, BFF, and upstream containers. |

The browser requests `/backend/...` from the frontend origin. Angular's development proxy or Nginx removes `/backend` before forwarding to the BFF. The BFF's public business routes retain upstream paths such as `/mobile-phones`, `/customers`, `/favorites`, `/shopping-carts`, and `/orders`; its `/api/products`, `/api/users`, and `/api/orders` prefixes are for proxied OpenAPI documents. There is no fourth generated BFF client. The BFF's `/health` checks the gateway process, not all upstream readiness.

## Technology stack and repository structure

| Area | Technology |
| --- | --- |
| UI and state | Angular 21, Angular Material, NgRx, RxJS, TypeScript |
| API clients | Kiota TypeScript 1.34.1 and pinned upstream OpenAPI |
| Unit tests | Angular TestBed on Vitest, V8 coverage, JUnit output |
| Acceptance | Playwright Chromium, Docker Compose, SQL Server, MongoDB replica set, BFF and three APIs |
| Delivery | Node 22 build, Nginx runtime, GitHub Actions, npm audit, Dependency Review, Gitleaks, Trivy, Docker Hub |

`src/app/features/` holds the application features; `src/app/shared/` holds cross-feature code. `contracts/upstream/` contains the reviewed API baseline and image manifest. `compose/` defines the local backend and full-stack options. `scripts/ci.sh` contains portable verification commands; `scripts/verify.sh` runs them locally. `.github/workflows/ci.yml` schedules independent jobs and controls image publication. Architecture decisions and review guidance live under `docs/`.

## Local startup

### Prerequisites

- Node.js 22 and npm, Git, Bash, and curl.
- Docker Engine or Docker Desktop with Compose for upstream services, container acceptance, or image builds. Allocate enough resources for SQL Server, MongoDB, and the APIs.
- For client regeneration: Linux x64 with `curl` and `unzip`, or a Kiota 1.34.1 executable supplied as `KIOTA_BIN` on another platform.

From the repository root, start the backend stack and run the Angular development server:

```bash
docker compose -f compose/ecommerce-compose.yml up -d sql mongodb mongo-init products users invoice bff
npm ci
npm start
```

Open `http://localhost:4200`. The development proxy sends `/backend/**` to the BFF exposed at `127.0.0.1:5137`. The Compose file uses pinned API images, a MongoDB replica set, and a local example SQL password. Its database volumes persist across `down` unless you add `--volumes`. For the BFF running on the host, follow the BFF repository's local startup instructions and keep its listener at port 5137 or update `src/proxy.conf.json`.

To build and run the Nginx frontend with the same stack:

```bash
docker compose -f compose/ecommerce-compose.yml up -d --build
curl -i http://localhost:4200/backend/health
docker compose -f compose/ecommerce-compose.yml down
```

Nginx forwards `/backend/` to `bff:8080` on the Compose network. The Compose frontend and `npm start` both use port 4200; stop one before starting the other. Set `WEB_PORT` and `BFF_PORT` to override the host ports for the container stack.

No customer is selected by default. Open Account → Profile, enter an existing customer external ID, and load the profile. Users returns the customer GUID; the demo context stores it for cart, favorites, and orders and reloads the app when the selection changes. The profile reads and updates individual details, billing address, and shipping address through Users. Existing company name, tax ID, billing address, and shipping address can also be edited through Users. Legacy `localStorage.demoClientId` sessions still work for cart/favorites/orders, but profile lookup requires the external ID. This browser-local selection is not authentication or authorization. The customer must already have a cart; an absent cart is reported as an incomplete registration.

## API contracts and Kiota

The [upstream contract README](contracts/upstream/README.md) records the BFF source commit, pinned image digests, OpenAPI checksums, and generation rules. Three clients live in `src/app/shared/infrastructure/api-clients/{products,users,orders}`; `orders` is generated from the Invoice API. After reviewing and updating the BFF baseline, copy its contracts and manifest, then regenerate locally:

```bash
npm ci
npm run generate:clients
bash scripts/ci.sh contract
```

The generator checks the SHA-256 baseline and uses Kiota 1.34.1. The `contract` check expects a clean generated tree: after an intentional contract update, review and commit the new generated sources before running it. CI regenerates the clients and rejects a diff. Keep `kiota-lock.json` committed, and map DTOs only in handwritten infrastructure code. Do not change generated files to accommodate a contract update.

## Tests and local verification

Run the portable stages after `npm ci`:

| Check | Command | Output or gate |
| --- | --- | --- |
| Source and shell syntax | `bash scripts/ci.sh source` | Whitespace and script syntax. |
| Contract drift | `bash scripts/ci.sh contract` | Pinned OpenAPI checksums and unchanged regenerated Kiota clients. |
| Dependency audit | `bash scripts/ci.sh audit` | High/critical advisories fail; moderate findings remain visible. |
| Lint and production build | `bash scripts/ci.sh build` | Angular lint and production bundle. |
| Unit tests | `bash scripts/ci.sh unit` | JUnit at `TestResults/unit.xml`, coverage at `coverage/ecommerce-store-web/`. |
| Browser acceptance | `bash scripts/ci.sh acceptance` | JUnit, HTML, traces, screenshots, and failure logs under `TestResults/`. |

Unit tests use Angular TestBed with Vitest. Coverage covers handwritten code and excludes generated Kiota clients. The configured minimums are 65% statements, 55% branches, 55% functions, and 65% lines. For a focused unit run use `npm test`; for coverage use `npm run test:coverage`.

Install the Playwright browser once with `npx playwright install --with-deps chromium`. Acceptance starts an isolated Compose project, waits for BFF and catalog, then removes its containers and volumes. It uses ports 14200 and 15137 by default (`WEB_PORT` and `BFF_PORT` override them). To run against an already running stack use `ACCEPTANCE_BASE_URL=http://127.0.0.1:4200 npm run test:acceptance`. Each scenario registers a unique customer. Cart-specific fixtures currently create their carts separately; the registration scenario deliberately does not. The checkout scenario checks one created order, an empty cart, and the returned final total. The profile scenario selects a customer by external ID and saves their individual billing data. See [ADR-0002](docs/adr/0002-testing-boundaries.md) and [local verification](docs/local-verification.md).

`bash scripts/verify.sh` performs a clean install, every portable stage, and a frontend image build. It requires a working Docker daemon. **Known gate:** the pinned BFF proxies `POST /customers` without creating an Invoice cart. The registration acceptance scenario gets a cart 404, so the required quality gate remains red until BFF/11 and WEB/8A provide and exercise the explicit registration flow. The checkout scenario passed in CI; the registration scenario still fails.

## CI and operations

[GitHub Actions CI](.github/workflows/ci.yml) runs source, Kiota drift, npm audit, lint/build, Vitest coverage, container-backed Playwright, and Gitleaks. Pull requests also run Dependency Review; on pushes to `master` that job is intentionally skipped. An explicit quality gate requires every mandatory result. JUnit, coverage, traces, screenshots, and Compose diagnostics are uploaded even after test failure.

After the quality gate, CI builds one local frontend image, smoke tests the SPA entry point, a client route and static assets, then scans it with Trivy for fixable HIGH/CRITICAL findings. Pull requests do not log in to Docker Hub or publish. A green `master` push tags and pushes the same scanned image to `mb0101/ecommerce-store-web` as `<full commit SHA>` and `latest`, checks local image IDs, and compares pushed digests. The workflow expects `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository secrets. Publication is not deployment; a runtime must separately supply the BFF and its upstream services. See [ADR-0003](docs/adr/0003-scanned-image-publication.md).

For reviews, use the [definition of done](docs/definition-of-done.md) and [PR template](.github/pull_request_template.md). Avoid claiming a green image scan or published image until the acceptance gate and Docker job actually run successfully.

## Architecture decisions

The [ADR index](docs/adr/README.md) records the frontend/BFF boundary, test strategy, scanned image publication, and demo customer context. New decisions use sequential repository-local numbers and keep superseded records in history.

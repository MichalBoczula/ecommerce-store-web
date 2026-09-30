# EcommerceStoreWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## API clients

The frontend uses three Kiota TypeScript clients generated from the OpenAPI
contracts pinned in [`contracts/upstream`](contracts/upstream/README.md):
Products Catalog, Users, and Invoice (the Orders client). Requests go through
the BFF. Generated code lives in `src/app/shared/infrastructure/api-clients/`;
feature repositories and mappers translate it to application models.

The browser calls `/backend` on the frontend origin. Angular's dev proxy and
the production Nginx configuration strip this prefix before forwarding to BFF.
The BFF receives its normal routes such as `/mobile-phones`, `/favorites` and
`/shopping-carts`; its `/api/products`, `/api/users` and `/api/orders` prefixes
are only for OpenAPI documents.

After updating the pinned contracts, regenerate and review the client changes:

```bash
npm run generate:clients
npm run build -- --configuration production
```

Generation uses Kiota 1.34.1 and checks the contract SHA-256 values against
the copied BFF manifest. The script downloads the pinned Linux x64 executable;
on another platform, set `KIOTA_BIN` to a Kiota 1.34.1 executable. Do not edit
generated files by hand.

## Development server

With Docker running, start the BFF and its three dependencies from the root of
this repository. The Compose file uses the same pinned upstream images as the
checked-in BFF contract manifest, a MongoDB replica set and the published BFF
image:

```bash
docker compose -f compose/ecommerce-compose.yml up -d sql mongodb mongo-init products users invoice bff
npm ci
npm start
```

The Angular dev server listens at `http://localhost:4200`; its proxy forwards
`/backend/**` to the BFF published at `127.0.0.1:5137`. For a BFF process run
on the host instead of Compose, use the BFF repository's local-start commands
and the same port. Restart `npm start` after editing `src/proxy.conf.json`.
The example database password and data in Compose are for local use.

The demo screens use a fallback client ID. For an existing customer, set
`localStorage.demoClientId` to its GUID before loading the app. That customer
needs a cart to show successful cart data; missing resources remain API errors.
The frontend does not create a cart implicitly.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

Run unit tests through Angular's [Vitest](https://vitest.dev/) runner (which sets up Angular TestBed):

```bash
npm test
```

Run the same suite with coverage for handwritten code:

```bash
npm run test:coverage
```

The JUnit report is written to `TestResults/unit.xml` and coverage reports to
`coverage/ecommerce-store-web/`. Generated Kiota clients are excluded from lint and coverage.

## Browser acceptance tests

Install the Playwright browser once, then run the isolated Compose stack and Chromium suite:

```bash
npm ci
npx playwright install --with-deps chromium
bash scripts/run-acceptance.sh
```

The script builds the frontend, starts the pinned BFF, Users, Products and
Invoice dependencies with SQL Server and a MongoDB replica set, waits for the
BFF and catalog, then removes its dedicated Compose project and volumes even
when tests fail. It uses ports 14200 and 15137 by default; set `WEB_PORT` and
`BFF_PORT` to override them. The browser reaches every API through `/backend/`
on the frontend origin. You can also run `npm run test:acceptance` against an
already running stack; set `ACCEPTANCE_BASE_URL` if it is not at port 4200.

Each test registers a unique customer. Cart interaction tests create a cart in
their isolated fixture because the currently pinned Users and Invoice APIs expose
separate creation routes. The registration contract test deliberately checks
that registration alone creates an empty cart and will fail until that backend
orchestration is implemented. Cart writes in the browser use only the UI; the
missing-product case creates a controlled orphan line through BFF to check the
unavailable-product state. The demo client selector uses browser-local
`demoClientId` until authenticated client context is implemented in WEB/11.

JUnit, screenshots, traces and HTML reports are written under `TestResults/`.
Order checkout is reserved for WEB/10.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Running with Docker

To build and run the entire local stack, including the Nginx frontend:

```bash
docker compose -f compose/ecommerce-compose.yml up -d --build
curl -i http://localhost:4200/backend/health
```

Open `http://localhost:4200`. Nginx forwards `/backend/` to `bff:8080` on the
Compose network. The BFF is also exposed on `127.0.0.1:5137` for local
diagnostics. The browser uses the frontend origin in both modes. Stop the
stack with:

```bash
docker compose -f compose/ecommerce-compose.yml down
```

## CI and image publication

`bash scripts/verify.sh` runs the same source, Kiota contract, high/critical
dependency audit, lint/build, Vitest and container-backed Playwright checks as
CI, then builds the frontend image. It requires Node 22, npm, Docker and the
Playwright Chromium browser (`npx playwright install --with-deps chromium`).
After `npm ci`, run individual stages with `bash scripts/ci.sh <stage>` where
`<stage>` is source, contract, audit, build, unit or acceptance.

Pull requests run each required check and build, smoke test and scan the image
without publishing it. On a successful push to `master`, CI publishes the
same scanned image to `mb0101/ecommerce-store-web` under the full commit SHA
and `latest`, using `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository
secrets. The current registration acceptance test requires BFF registration to
create a cart; until that backend flow exists, the required acceptance check
and image publication will remain blocked.

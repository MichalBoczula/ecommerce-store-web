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

The existing demo screens contain a fixed client ID. Until registration creates
a cart, that ID needs a matching client and cart to show successful favorites
and cart data; missing resources remain API errors. The frontend does not
create a cart implicitly.

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

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

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

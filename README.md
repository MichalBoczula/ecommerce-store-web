# EcommerceStoreWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## API clients

The frontend uses three Kiota TypeScript clients generated from the OpenAPI
contracts pinned in [`contracts/upstream`](contracts/upstream/README.md):
Products Catalog, Users, and Invoice (the Orders client). Requests go through
the BFF. Generated code lives in `src/app/shared/infrastructure/api-clients/`;
feature repositories and mappers translate it to application models.

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

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Running with Docker

Build the Docker image:

```bash
docker build -t ecommerce-store-web .
```

Run the container:

```bash
docker run --rm -p 8080:80 ecommerce-store-web
```

Then open `http://localhost:8080`.

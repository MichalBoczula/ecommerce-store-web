# ADR-0002: Test frontend logic and browser flows at their boundaries

- Status: Accepted
- Date: 2026-09-30

## Context

Cart mutation ordering, catalog enrichment, DTO mapping, and order snapshots need fast focused feedback. Browser behavior also depends on the BFF, three upstream APIs, SQL Server, MongoDB replica set, and their actual HTTP responses. A mock-only browser suite would miss route and registration contract failures.

## Decision

Use Angular's TestBed-backed Vitest runner for unit tests of handwritten mapping, rules, NgRx state/effects, facades, and component behavior. Gate V8 coverage at the configured statement, branch, function, and line thresholds; exclude generated Kiota sources from lint and coverage. Write JUnit and coverage reports. Use Playwright Chromium against the Nginx frontend and an isolated Compose project with the pinned BFF and upstream images. Browser traffic goes through `/backend`; test fixtures use unique customers, and the script removes its containers and volumes on exit. Keep traces, screenshots, JUnit, HTML, and Compose failure logs. The registration assertion must use a real backend registration flow and must not create the cart behind the test's back.

## Consequences

CI needs Docker and Playwright browser dependencies. Container startup costs more than unit tests, so the suites run as separate jobs. Cart-specific browser scenarios temporarily create carts in their isolated fixtures because the current `POST /customers` proxy does not do so. The registration test intentionally fails with a cart 404 until BFF/11 and WEB/8A introduce and exercise explicit registration. This failure blocks the quality gate; retries, mocks, and skipped assertions do not count as a solution. WEB/10 adds a checkout scenario that creates an order through the real backend and checks the cleared cart; checkout passes in container CI while the registration test still blocks the gate.

## Alternatives considered

- Use only unit tests with mocked HTTP: would not exercise proxy routing or real service contracts.
- Create an absent cart automatically from the cart UI or registration assertion: would hide incomplete registration.
- Share one persistent test customer and database: allows state leakage and order-dependent results.

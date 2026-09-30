# Architecture Decision Records

These records describe decisions implemented in the frontend. Use repository-local sequential numbers. Each record has Status, Date, Context, Decision, Consequences, and Alternatives considered. Keep an accepted record if a later decision supersedes it, and link the successor here.

| ADR | Status | Decision |
| --- | --- | --- |
| [0001](0001-bff-and-kiota-boundary.md) | Accepted | Use same-origin BFF traffic and three generated upstream Kiota clients. |
| [0002](0002-testing-boundaries.md) | Accepted | Use Angular TestBed/Vitest for unit behavior and Playwright against isolated real containers. |
| [0003](0003-scanned-image-publication.md) | Accepted | Publish only the scanned frontend image after a green mandatory quality gate. |
| [0004](0004-demo-customer-context.md) | Accepted | Resolve a demo customer by external ID and share the GUID across features. |

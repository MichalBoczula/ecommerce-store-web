# Definition of done for a frontend change

This is a review checklist for each change, not a claim that the existing registration flow already meets it. Mark a deferred or inapplicable item with its reason in the PR.

- The PR names its WEB task and describes the user-visible behavior, architecture boundary, changed contracts, and any new dependency.
- Domain rules remain independent of Kiota and Angular presentation. Features use their ports, facades, NgRx state where appropriate, handwritten adapters/mappers, and existing UI patterns. The browser uses the BFF origin.
- Upstream contract changes start with a reviewed BFF OpenAPI and image baseline. Regenerate clients with the pinned Kiota version; do not hand-edit generated files. Run the drift check.
- Unit tests cover relevant mapping, state/effects, rules, failure states, and component behavior. The configured handwritten-code coverage gate remains active. Browser-visible cross-service behavior gets a real-container Playwright scenario where relevant; fixture setup must not conceal missing backend operations.
- `bash scripts/ci.sh source`, `contract`, `audit`, `build`, and `unit` pass. Run `acceptance` when Docker is available. Report actual results and checks not run; do not bypass a failing mandatory gate. GitHub Actions security, artifact, image smoke, and Trivy checks must succeed where applicable.
- README and ADRs reflect operational or architectural changes. Links and commands work, and an accepted ADR stays in history if superseded. No secrets or real customer data are committed.
- The PR lists known risks and follow-ups. In particular, the BFF/11 registration gap and WEB/8A Playwright failure remain open until the real registration test and full quality gate pass.

Run [local verification](local-verification.md) for command details and artifact paths.

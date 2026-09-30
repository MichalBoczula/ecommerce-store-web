# Local verification

Run commands from the repository root with Node.js 22 and npm. Full verification also needs Bash, curl, Git, Docker Compose with a running daemon, and Playwright Chromium:

```bash
npx playwright install --with-deps chromium
bash scripts/verify.sh
```

`verify.sh` installs locked dependencies, then invokes the same `scripts/ci.sh` stages as GitHub Actions: `source`, `contract`, `audit`, `build`, `unit`, and `acceptance`. It finally builds `ecommerce-store-web:verify`. The script exits at the first failing stage and names it. It does not run Gitleaks, GitHub Dependency Review, the post-gate image smoke test, Trivy, or Docker Hub publication; those remain CI-specific checks.

For a focused run after `npm ci`:

| Stage | Command | Result |
| --- | --- | --- |
| Source | `bash scripts/ci.sh source` | `git diff --check`, shell syntax, Node script syntax. |
| Contract | `bash scripts/ci.sh contract` | OpenAPI SHA-256 verification, Kiota 1.34.1 regeneration, clean generated tree. |
| Audit | `bash scripts/ci.sh audit` | npm high/critical advisories fail; moderate findings are shown. |
| Build | `bash scripts/ci.sh build` | Handwritten lint and production build. |
| Unit | `bash scripts/ci.sh unit` | Vitest with JUnit and configured V8 coverage thresholds. |
| Acceptance | `bash scripts/ci.sh acceptance` | Playwright against the isolated Compose stack. |

Generated client drift is checked against tracked files and untracked additions. The `contract` stage expects intentional regenerated changes to have been reviewed and committed first. Review upstream OpenAPI changes before regeneration; [the contract baseline](../contracts/upstream/README.md) describes the pinned source and `KIOTA_BIN` override for non-Linux-x64 hosts.

## Reports and cleanup

| Output | Path |
| --- | --- |
| Unit JUnit | `TestResults/unit.xml` |
| V8 coverage | `coverage/ecommerce-store-web/` |
| Playwright JUnit | `TestResults/acceptance.xml` |
| Browser HTML, traces and screenshots | `TestResults/playwright-html/`, `TestResults/playwright-results/` |
| Compose diagnostics on failure | `TestResults/acceptance-compose.log` |
| Local summary | `artifacts/verification/summary.md` |

Set `VERIFY_RESULTS_DIR` for the summary's directory and `VERIFY_SUMMARY_FILE` for a different Markdown summary file. CI sets the latter to `$GITHUB_STEP_SUMMARY` and uploads test outputs with `if: always()`. Each test stage clears its previous report before running; a missing or failing JUnit result does not pass silently.

`scripts/run-acceptance.sh` uses a unique Compose project, ports 14200 (web) and 15137 (BFF) by default, and removes containers and volumes on exit. Override `WEB_PORT` and `BFF_PORT` if those host ports are occupied. To use an existing stack without Compose setup, run `ACCEPTANCE_BASE_URL=http://127.0.0.1:4200 npm run test:acceptance`. The browser talks only to the frontend origin and `/backend` BFF path. A failing run preserves Playwright artifacts and Compose logs before cleanup.

## Registration coverage

The stack pins BFF/11's published image by digest. Browser scenarios call `/backend/registrations/customers` to create each unique profile and confirm its Invoice cart. No cart fixture hides a missing registration operation. The registration test also checks the cart is empty and that a duplicate cart creation returns 409 without changing its ID. Backend container integration tests cover partial failure and retry. A failed browser run blocks the required quality gate and frontend image job; record CI results rather than treating retries or skipped scenarios as a pass.

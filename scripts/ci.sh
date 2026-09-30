#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

command="${1:?Usage: scripts/ci.sh source|contract|audit|build|unit|acceptance}"
results_dir="${VERIFY_RESULTS_DIR:-$PWD/artifacts/verification}"
summary_file="${VERIFY_SUMMARY_FILE:-$results_dir/summary.md}"

summarize() {
  local report="$1" label="$2" status="$3"
  node scripts/summarize-junit.mjs "$report" "$label" "$summary_file" || {
    if (( status == 0 )); then return 1; fi
  }
  return "$status"
}

case "$command" in
  source)
    git diff --check
    for script in scripts/*.sh; do bash -n "$script"; done
    node --check scripts/check-upstream-contracts.mjs
    node --check scripts/summarize-junit.mjs
    ;;
  contract)
    node scripts/check-upstream-contracts.mjs
    bash scripts/generate-clients.sh
    if [[ -n "$(git status --porcelain --untracked-files=all -- src/app/shared/infrastructure/api-clients)" ]]; then
      echo 'Generated Kiota clients differ from the pinned contracts.' >&2
      git status --short -- src/app/shared/infrastructure/api-clients >&2
      exit 1
    fi
    ;;
  audit)
    # npm exits nonzero for high/critical advisories across runtime and build dependencies.
    npm audit --audit-level=high
    ;;
  build)
    npm run lint
    npm run build -- --configuration production
    ;;
  unit)
    mkdir -p "$results_dir"
    rm -rf TestResults/unit.xml coverage/ecommerce-store-web
    status=0
    npm run test:coverage || status=$?
    summarize TestResults/unit.xml 'Vitest unit tests' "$status"
    ;;
  acceptance)
    mkdir -p "$results_dir"
    rm -rf TestResults/acceptance.xml TestResults/acceptance-compose.log TestResults/playwright-html TestResults/playwright-results
    status=0
    bash scripts/run-acceptance.sh || status=$?
    summarize TestResults/acceptance.xml 'Playwright acceptance tests' "$status"
    ;;
  *)
    echo "Unknown verification command: $command" >&2
    exit 2
    ;;
esac

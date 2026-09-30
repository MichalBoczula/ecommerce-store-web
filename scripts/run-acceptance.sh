#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

export WEB_PORT="${WEB_PORT:-14200}"
export BFF_PORT="${BFF_PORT:-15137}"
export ACCEPTANCE_BASE_URL="http://127.0.0.1:${WEB_PORT}"

project="ecommerce-web-acceptance-$$"
compose=(docker compose -p "$project" -f compose/ecommerce-compose.yml)
cleanup() {
  local status=$?
  if (( status != 0 )); then
    mkdir -p TestResults
    "${compose[@]}" ps > TestResults/acceptance-compose.log 2>&1 || true
    "${compose[@]}" logs --no-color --tail=200 >> TestResults/acceptance-compose.log 2>&1 || true
  fi
  "${compose[@]}" down -v --remove-orphans || true
  return "$status"
}
trap cleanup EXIT

"${compose[@]}" up -d --build --wait

# BFF and the product migration can need more time after containers become running.
for attempt in {1..60}; do
  if curl --fail --silent "$ACCEPTANCE_BASE_URL/backend/health" >/dev/null &&
     curl --fail --silent "$ACCEPTANCE_BASE_URL/backend/mobile-phones?amount=1" >/dev/null; then
    npm run test:acceptance
    exit $?
  fi
  sleep 2
done

"${compose[@]}" ps
"${compose[@]}" logs --tail=100 bff products users invoice
echo 'The acceptance stack did not become ready.' >&2
exit 1

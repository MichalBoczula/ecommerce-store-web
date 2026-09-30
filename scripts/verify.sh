#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."

stage=Setup
trap 'code=$?; echo "Verification stage $stage failed (exit $code)." >&2' ERR
run() {
  stage="$1"
  echo "==> $stage"
  shift
  "$@"
}

run 'Install locked dependencies' npm ci
run 'Source checks' bash scripts/ci.sh source
run 'Kiota contract and generation drift' bash scripts/ci.sh contract
run 'Dependency audit' bash scripts/ci.sh audit
run 'Lint and production build' bash scripts/ci.sh build
run 'Vitest unit tests and coverage' bash scripts/ci.sh unit
run 'Playwright on isolated containers' bash scripts/ci.sh acceptance
run 'Frontend image build' docker build -t ecommerce-store-web:verify .
echo 'Local verification passed.'

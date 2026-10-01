#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

version=1.34.1
archive_sha256=682416ab85c07bb3152e4c2c54293ae51f582aebde381699d8999f7b076755dd
node scripts/check-upstream-contracts.mjs

if [[ -n "${KIOTA_BIN:-}" ]]; then
  kiota_bin="$KIOTA_BIN"
elif [[ "$(uname -s)" == Linux && "$(uname -m)" == x86_64 ]]; then
  tool_dir="$PWD/.tools/kiota-$version"
  kiota_bin="$tool_dir/kiota"
  if [[ ! -x "$kiota_bin" ]]; then
    mkdir -p "$PWD/.tools"
    temp_dir="$(mktemp -d "$PWD/.tools/kiota-download.XXXXXX")"
    trap 'rm -rf "$temp_dir"' EXIT
    curl --fail --location --silent --show-error --retry 3 \
      "https://github.com/microsoft/kiota/releases/download/v$version/linux-x64.zip" \
      --output "$temp_dir/kiota.zip"
    echo "$archive_sha256  $temp_dir/kiota.zip" | sha256sum --check --status
    unzip -q "$temp_dir/kiota.zip" kiota appsettings.json -d "$temp_dir"
    chmod +x "$temp_dir/kiota"
    mv "$temp_dir" "$tool_dir"
    trap - EXIT
  fi
else
  echo 'Set KIOTA_BIN to a Kiota 1.34.1 executable on this platform.' >&2
  exit 1
fi

actual_version="$("$kiota_bin" --version)"
if [[ "$actual_version" != "$version" && "$actual_version" != "$version"+* ]]; then
  echo "Expected Kiota $version; found $actual_version" >&2
  exit 1
fi

generate() {
  local contract="$1" directory="$2" class_name="$3"
  local output="src/app/shared/infrastructure/api-clients/$directory"
  "$kiota_bin" generate \
    --openapi "contracts/upstream/$contract.openapi.json" \
    --language TypeScript \
    --class-name "$class_name" \
    --namespace-name ApiSdk \
    --output "$output" \
    --additional-data \
    --clean-output \
    --log-level Warning
  rm -f "$output/.kiota.log"
}

generate products products ProductsApiClient
generate users users UsersApiClient
generate invoice orders OrdersApiClient

# Preserve the exact upstream artifact and normalize nullable unions only for
# Kiota's TypeScript generator. The checksum above always checks the original.
payments_spec="$PWD/.tools/payments-kiota.openapi.json"
mkdir -p "$PWD/.tools"
trap 'rm -f "$payments_spec"' EXIT
node scripts/normalize-payments-openapi.mjs contracts/upstream/payments.openapi.json "$payments_spec"
"$kiota_bin" generate \
  --openapi "$payments_spec" \
  --language TypeScript \
  --class-name PaymentsApiClient \
  --namespace-name ApiSdk \
  --output src/app/shared/infrastructure/api-clients/payments \
  --additional-data \
  --clean-output \
  --log-level Warning
rm -f src/app/shared/infrastructure/api-clients/payments/.kiota.log
# Kiota emits whitespace-only lines in this client's root file. Keep newly
# committed sources compatible with the repository's git diff --check gate.
node - <<'JS'
const fs = require('node:fs');
const path = 'src/app/shared/infrastructure/api-clients/payments/paymentsApiClient.ts';
fs.writeFileSync(path, fs.readFileSync(path, 'utf8').replace(/[ \t]+$/gm, ''));
JS

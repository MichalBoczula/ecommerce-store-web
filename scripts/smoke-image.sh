#!/usr/bin/env bash
set -euo pipefail

image="${1:?Usage: scripts/smoke-image.sh IMAGE}"
name="web-image-smoke-$$"
# Nginx resolves its configured BFF host at startup; static smoke does not call it.
docker run -d --name "$name" --add-host bff:127.0.0.1 -p 127.0.0.1::80 "$image" >/dev/null
trap 'docker rm -f "$name" >/dev/null' EXIT

address="$(docker port "$name" 80/tcp)"
base="http://$address"
for attempt in {1..30}; do
  if curl --fail --silent "$base/" -o /dev/null; then break; fi
  sleep 1
done

index="$(curl --fail --silent --show-error "$base/")"
[[ "$index" == *'<app-root'* ]]
[[ "$(curl --fail --silent --show-error "$base/cart")" == *'<app-root'* ]]
curl --fail --silent --show-error "$base/favicon.ico" -o /dev/null
asset="$(printf '%s' "$index" | grep -oE 'src="[^"]+\.js"' | head -n 1 | cut -d '"' -f 2)"
test -n "$asset"
curl --fail --silent --show-error "$base/${asset#/}" -o /dev/null
echo "SPA, client route, favicon and $asset are served by $image"

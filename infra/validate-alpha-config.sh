#!/usr/bin/env bash
set -euo pipefail

: "${FOOD_FIGHT_IMAGE_TAG:?Set an immutable image tag}"
[[ "$FOOD_FIGHT_IMAGE_TAG" =~ ^sha-[0-9a-f]{40}$ ]] || {
  echo "Use FOOD_FIGHT_IMAGE_TAG=sha-<full-40-character-commit-sha>" >&2
  exit 1
}

for key in WEB_HOST PLAY_HOST MATCH_HOST API_HOST; do
  value="${!key:-}"
  if [[ ! "$value" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$ || "$value" == *".."* || "$value" == *localhost* ]]; then
    echo "$key must be a fully qualified public DNS hostname: $value" >&2
    exit 1
  fi
done

hosts=("$WEB_HOST" "$PLAY_HOST" "$MATCH_HOST" "$API_HOST")
for ((a=0;a<${#hosts[@]};a++));do
  for ((b=a+1;b<${#hosts[@]};b++));do
    if [[ "${hosts[a]}" == "${hosts[b]}" ]];then echo "Alpha hostnames must be distinct." >&2; exit 1;fi
  done
done

docker compose -f infra/compose.alpha.yml config --quiet
echo "Alpha edge config: PASS (syntax only; deployment/DNS/TLS are not validated)"

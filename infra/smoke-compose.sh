#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
project="foodfight-fullstack-${GITHUB_RUN_ID:-local}"
compose=(docker compose --project-name "$project" -f infra/compose.staging.yml)

cleanup() {
  "${compose[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

"${compose[@]}" config --quiet
test -f infra/postgres/001_init.sql
"${compose[@]}" up -d --build --wait

wait_http() {
  local url="$1"
  for ((n=0; n<40; n+=1)); do
    if curl --silent --fail "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  "${compose[@]}" ps
  "${compose[@]}" logs --tail 100
  echo "Missing service response: $url" >&2
  exit 1
}
wait_http http://127.0.0.1:8080/healthz
wait_http http://127.0.0.1:8081/healthz
wait_http http://127.0.0.1:3000/health

tables=$("${compose[@]}" exec -T postgres psql -U foodfight -d foodfight -Atc \
  "select count(*) from information_schema.tables where table_schema='public' and table_name in ('player_profile', 'match', 'match_participant', 'cosmetic_inventory');")
if [[ "$tables" != "4" ]]; then
  echo "Expected four initialized database tables; found: $tables" >&2
  exit 1
fi

web_config="$(curl --silent --fail http://127.0.0.1:8080/runtime-config.js)"
game_config="$(curl --silent --fail http://127.0.0.1:8081/runtime-config.js)"
[[ "$web_config" == *'gameUrl: "http://localhost:8081"'* ]]
[[ "$game_config" == *'gameServerUrl: "http://localhost:2567"'* ]]

GAME_SERVER_URL=http://127.0.0.1:2567 BOT_COUNT=2 BOT_DURATION_SECONDS=3 corepack pnpm bots
echo "Full staging Compose smoke: PASS"

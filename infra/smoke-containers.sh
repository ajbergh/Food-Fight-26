#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

prefix="foodfight-ci-${RANDOM}"
game_server_image="${prefix}-game-server"
platform_api_image="${prefix}-platform-api"
game_client_image="${prefix}-game-client"
web_image="${prefix}-web"

game_server_container="${prefix}-game-server"
platform_api_container="${prefix}-platform-api"
game_client_container="${prefix}-game-client"
web_container="${prefix}-web"

cleanup() {
  docker rm -f \
    "$game_server_container" \
    "$platform_api_container" \
    "$game_client_container" \
    "$web_container" >/dev/null 2>&1 || true
}
trap cleanup EXIT

build_target() {
  local target="$1"
  local image="$2"
  shift 2
  docker build \
    --file infra/Dockerfile \
    --target "$target" \
    --tag "$image" \
    "$@" \
    .
}

wait_http() {
  local url="$1"
  local container="$2"
  local attempts="${3:-30}"
  for ((attempt = 1; attempt <= attempts; attempt += 1)); do
    if curl --fail --silent --show-error "$url" >/dev/null 2>&1; then
      return 0
    fi
    if ! docker inspect "$container" >/dev/null 2>&1; then
      echo "Container $container exited before $url became healthy." >&2
      docker logs "$container" 2>&1 || true
      return 1
    fi
    sleep 1
  done
  echo "Timed out waiting for $url" >&2
  echo "Recent logs from $container:" >&2
  docker logs --tail 100 "$container" 2>&1 || true
  return 1
}

assert_contains() {
  local value="$1"
  local expected="$2"
  if [[ "$value" != *"$expected"* ]]; then
    echo "Expected response to contain: $expected" >&2
    echo "Actual response:" >&2
    echo "$value" >&2
    return 1
  fi
}

build_target game-server "$game_server_image"
build_target platform-api "$platform_api_image"
build_target game-client-static "$game_client_image"
build_target web-static "$web_image"

docker run --detach \
  --name "$game_server_container" \
  --publish 32567:2567 \
  "$game_server_image" >/dev/null

docker run --detach \
  --name "$platform_api_container" \
  --publish 33000:3000 \
  "$platform_api_image" >/dev/null

docker run --detach \
  --name "$game_client_container" \
  --env GAME_SERVER_PUBLIC_URL=https://match.smoke.example \
  --env PLATFORM_API_PUBLIC_URL=https://api.smoke.example \
  --env FOOD_FIGHT_RELEASE=sha-smoke-test \
  --publish 38081:8080 \
  "$game_client_image" >/dev/null

docker run --detach \
  --name "$web_container" \
  --publish 38080:8080 \
  "$web_image" >/dev/null

wait_http http://127.0.0.1:33000/health "$platform_api_container"
wait_http http://127.0.0.1:38081/healthz "$game_client_container"
wait_http http://127.0.0.1:38080/healthz "$web_container"

runtime_config="$(curl --fail --silent --show-error http://127.0.0.1:38081/runtime-config.js)"
assert_contains "$runtime_config" 'gameServerUrl: "https://match.smoke.example"'
assert_contains "$runtime_config" 'platformApiUrl: "https://api.smoke.example"'
assert_contains "$runtime_config" 'release: "sha-smoke-test"'

for production_prop in pizza pizza-box can carton; do
  prop_url="http://127.0.0.1:38081/assets/third-party/kenney-food-kit/${production_prop}.glb"
  if ! curl --fail --silent --show-error --output /dev/null "$prop_url"; then
    echo "Game-client image is missing generated production prop: ${production_prop}.glb" >&2
    exit 1
  fi
done

GAME_SERVER_URL=http://127.0.0.1:32567 \
BOT_COUNT=2 \
BOT_DURATION_SECONDS=3 \
corepack pnpm bots

echo "Staging container smoke: PASS"

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

build_target game-server "$game_server_image"
build_target platform-api "$platform_api_image"
build_target game-client-static "$game_client_image" \
  --build-arg "VITE_GAME_SERVER_URL=http://localhost:2567"
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
  --publish 38081:8080 \
  "$game_client_image" >/dev/null

docker run --detach \
  --name "$web_container" \
  --publish 38080:8080 \
  "$web_image" >/dev/null

wait_http http://127.0.0.1:33000/health "$platform_api_container"
wait_http http://127.0.0.1:38081/healthz "$game_client_container"
wait_http http://127.0.0.1:38080/healthz "$web_container"

GAME_SERVER_URL=http://127.0.0.1:32567 \
BOT_COUNT=2 \
BOT_DURATION_SECONDS=3 \
pnpm bots

echo "Staging container smoke: PASS"

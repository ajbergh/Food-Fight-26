#!/bin/sh
set -eu

output=/usr/share/nginx/html/runtime-config.js

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

game_server_url=$(json_escape "${GAME_SERVER_PUBLIC_URL:-http://localhost:2567}")
platform_api_url=$(json_escape "${PLATFORM_API_PUBLIC_URL:-http://localhost:3000}")
release=$(json_escape "${FOOD_FIGHT_RELEASE:-dev}")
web_game_url=$(json_escape "${WEB_GAME_PUBLIC_URL:-http://localhost:8081}")

cat > "$output" <<EOF
window.__FOOD_FIGHT_CONFIG__ = {
  gameServerUrl: "$game_server_url",
  platformApiUrl: "$platform_api_url",
  release: "$release",
  gameUrl: "$web_game_url"
};
EOF

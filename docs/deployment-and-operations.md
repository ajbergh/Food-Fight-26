# Deployment and operations

## Environments

- local: developer machine, Docker Postgres/Redis;
- preview: per-PR static build/API where economical;
- staging: production-like regional server and persistent services;
- production: CDN + platform services + regional match fleets.

## Container build targets

`infra/Dockerfile` provides four independently deployable targets from the same monorepo source revision:

- `game-server` — authoritative Colyseus match process on port 2567;
- `platform-api` — Fastify platform API on port 3000;
- `game-client-static` — production Vite game build served by nginx on port 8080;
- `web-static` — production React/Vite web shell served by nginx on port 8080.

The static nginx image serves hashed `/assets/` with immutable caching, serves the HTML shell with `no-cache`, falls back to `index.html` for client routes, and exposes `/healthz` for load-balancer probes.

### Runtime browser configuration

The production game-client bundle is environment-neutral. `index.html` loads `/runtime-config.js` before the game modules, and the nginx image generates that file at container startup from:

- `GAME_SERVER_PUBLIC_URL`;
- `PLATFORM_API_PUBLIC_URL`;
- `FOOD_FIGHT_RELEASE`.

Development builds still support `VITE_GAME_SERVER_URL`, `VITE_PLATFORM_API_URL`, and `VITE_FOOD_FIGHT_RELEASE` as fallbacks. Runtime values take precedence. This separation is deliberate: a tested game-client image can now be promoted from staging to production without rebuilding its JavaScript merely to change service URLs.

The release value is attached to bounded browser telemetry so a staged rollout can compare client health by immutable build identity.

CI runs `bash infra/smoke-containers.sh`. The smoke harness builds all four targets, boots them on isolated host ports, verifies the API/static health endpoints, then points two real Colyseus bot clients at the **containerized** game server. A PR therefore cannot merge merely because source builds work; the production-shaped images must also boot and accept traffic.

For a local image smoke:

```bash
bash infra/smoke-containers.sh
```

For a production-shaped local stack including Postgres and Redis:

```bash
PUBLIC_GAME_SERVER_URL=http://localhost:2567 \
PUBLIC_PLATFORM_API_URL=http://localhost:3000 \
FOOD_FIGHT_RELEASE=local \
  docker compose -f infra/compose.staging.yml up --build
```

The compose file is a staging/developer convenience, not the production scheduler. Production should use managed persistence and independently scalable match/API/static services.

## Published images

`.github/workflows/publish-images.yml` publishes the four runtime images to GitHub Container Registry after changes land on `main`. Each image receives:

- an immutable `sha-<full git sha>` tag;
- the moving `main` convenience tag;
- OCI source/revision labels;
- BuildKit provenance and SBOM attestations.

Published package names are:

- `ghcr.io/ajbergh/food-fight-26-game-server`;
- `ghcr.io/ajbergh/food-fight-26-platform-api`;
- `ghcr.io/ajbergh/food-fight-26-game-client`;
- `ghcr.io/ajbergh/food-fight-26-web`.

`infra/compose.published.yml` is the pull-only counterpart to the source-build staging compose. For example:

```bash
FOOD_FIGHT_IMAGE_TAG=sha-<git-sha> \
FOOD_FIGHT_RELEASE=sha-<git-sha> \
PUBLIC_GAME_SERVER_URL=https://match.staging.example \
PUBLIC_PLATFORM_API_URL=https://api.staging.example \
  docker compose -f infra/compose.published.yml up -d
```

For controlled environments, deploy the immutable SHA tag or an image digest rather than relying on `main`.

## Static delivery

`apps/web` and `apps/game-client` build to static assets suitable for CDN/object storage. Use hashed immutable assets and short-lived HTML entry documents. Brotli/gzip text assets at the edge.

The nginx targets are useful for preview/staging and as a portable fallback. At larger scale, static output should normally be uploaded directly to object storage/CDN rather than keeping nginx pods alive solely to serve immutable files. When moving the game client from nginx to pure object storage, preserve an equivalent runtime-config mechanism or serve browser endpoints behind stable same-origin routes.

## Match servers

Package `apps/game-server` as a small container. Region selection should prioritize measured latency. A scheduler/load balancer maps matchmaking tickets to processes with available room capacity.

Start with a few broad regions (for example US East, US West, Europe) rather than a complex global fleet before player distribution is known.

The current staging image favors build reliability and reproducibility over minimum image size: it carries the workspace-installed runtime dependency tree. Before broad production rollout, profile image pull/startup costs and consider a dedicated pnpm deploy/prune stage once workspace dependency packaging is stable.

## Platform API

Deploy independently from match servers. It can scale based on request throughput and background work, not room count.

## Database

Use managed Postgres and Redis for production unless operational requirements strongly justify self-hosting. Apply migrations through an explicit release step. Back up Postgres and test restore procedures.

`infra/compose.staging.yml` runs disposable/local Postgres and Redis to give the containerized services production-shaped endpoints. Those services are not a recommendation to self-host persistence in production.

## Observability

Minimum production signals:

- build/version in every log/event;
- request rate/error/latency for platform API;
- rooms/process and players/process;
- match tick p50/p95/p99;
- disconnect/reconnect rate;
- matchmaking wait time/failure rate;
- client JS errors;
- client frame-time and network-quality samples;
- match completion rate.

The game server already emits `room_tick_perf` as one-line structured JSON after approximately 60 seconds of authoritative simulation samples per active room. Ingest the event as structured fields rather than parsing presentation text; retain `roomId`, `samples`, `tickBudgetMs`, `p50Ms`, `p95Ms`, `p99Ms`, and `maxMs`. Production aggregation should primarily group by build, region, process, and time window rather than room ID.

The platform telemetry summary also groups accepted browser events by the runtime `FOOD_FIGHT_RELEASE` identifier, providing a minimal canary/regression comparison until a durable metrics backend is connected.

## Release strategy

- Build all deployable artifacts from one immutable Git SHA.
- Deploy static client and servers with compatible protocol windows.
- Prefer staged/canary rollout for authoritative server changes.
- Keep a rapid rollback path.
- Promote already-tested image digests between environments rather than rebuilding source differently in each environment.
- Configure browser service endpoints at deployment/runtime, not by recompiling the game bundle.
- Keep `FOOD_FIGHT_RELEASE` aligned with the deployed immutable tag/digest identifier.
- Do not make a database migration irreversible in the same release that first depends on it without a recovery plan.

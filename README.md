# Food Fight 26

Food Fight 26 is a working-title browser-native multiplayer arcade game: eight players sprint, dodge, collect ridiculous food weapons, and fight for objectives in compact, highly readable arenas.

The repository starts with an intentionally small vertical slice: one food-court arena, eight players, tomatoes, banana hazards, a central sundae objective, a three-minute round, and server-authoritative movement/state.

## Stack

- TypeScript across client, server, protocol, and tools
- PlayCanvas for browser-first 3D rendering
- React + Vite for the web shell and lobby UI
- Colyseus for authoritative multiplayer rooms and state synchronization
- Fastify for the platform API
- PostgreSQL for persistent player/match data
- Redis for presence, matchmaking, and distributed coordination
- Blender -> glTF/GLB -> KTX2/Basis for production art

## Repository layout

```text
apps/
  web/            React web shell, lobby, account/settings surfaces
  game-client/    PlayCanvas game client
  game-server/    Colyseus authoritative match server
  platform-api/   Persistent platform HTTP API
packages/
  game-core/      Shared rules, constants, item definitions, simulation helpers
  protocol/       Network message contracts
  maps/           Data-driven arena definitions
infra/            Local/staging containers and database bootstrap
tools/            Bot/load/performance automation
docs/             Product, game, art, UX, networking, operations, and ADR documents
```

## Quick start

Requirements: Node.js 22+, Corepack, Docker.

```bash
corepack enable
cp .env.example .env
pnpm install
docker compose -f infra/docker-compose.yml up -d
pnpm dev
```

Local services:

- Web shell: http://localhost:5173
- Game client: http://localhost:5174
- Platform API: http://localhost:3000
- Game server: ws/http on localhost:2567

## Production-shaped container smoke

The repository also builds four deployable container targets: authoritative game server, platform API, game-client static site, and web static site. To build and boot all four targets and verify them with health probes plus real Colyseus bot clients:

```bash
bash infra/smoke-containers.sh
```

To run the fuller staging-shaped stack with local Postgres and Redis:

```bash
PUBLIC_GAME_SERVER_URL=http://localhost:2567 \
  docker compose -f infra/compose.staging.yml up --build
```

That exposes the web shell on `:8080`, game client on `:8081`, platform API on `:3000`, and game server on `:2567`. See `docs/deployment-and-operations.md` before adapting this stack for a hosted environment.

## First vertical-slice acceptance criteria

1. Eight browser clients can join the same room.
2. Local movement feels immediate; the server remains authoritative.
3. Players can aim, throw a tomato, hit another player, and receive clear feedback.
4. Banana hazards can stun/slip players.
5. Holding the center objective earns team score.
6. A round ends cleanly and returns a result.
7. The game maintains the performance budgets in `docs/performance-budgets.md` on target hardware.

## Design documentation

Start at [`docs/README.md`](docs/README.md). Architectural choices are recorded under [`docs/adr/`](docs/adr/).

## IP note

This repository uses **Food Fight 26** as a working title and explores a gameplay lineage associated with classic food-fight arcade games. Do not ship third-party logos, characters, source art, audio, level layouts, trademarks, or other protected material without documented rights. See `docs/legal-and-ip.md`.

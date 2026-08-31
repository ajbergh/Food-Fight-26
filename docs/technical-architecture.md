# Technical architecture

## Decision summary

Food Fight 26 is browser-native. TypeScript is used across the application. PlayCanvas renders the game client; Colyseus owns multiplayer rooms; React/Vite owns website/lobby surfaces; Fastify provides persistent HTTP APIs; PostgreSQL and Redis support durable and ephemeral platform data.

## High-level topology

```text
Browser
  |-- React web shell
  |-- PlayCanvas game client
  |       |
  |       +---- WebSocket ---- regional Colyseus match server
  |
  +------------ HTTPS -------- platform API
                                  |-- PostgreSQL
                                  +-- Redis
```

Static web/game bundles are CDN-hosted. Match servers are regional and authoritative. Persistent systems are deliberately separate from hot per-tick simulation.

## Repository boundaries

### `apps/web`
Landing, lobby, social/settings/account, matchmaking UI. HTML/CSS/React should handle conventional application UI for accessibility.

### `apps/game-client`
Rendering, input capture, local prediction, interpolation, camera, audio, VFX, HUD integration, asset streaming.

### `apps/game-server`
Authoritative match simulation, validation, scoring, room lifecycle, snapshots/events.

### `apps/platform-api`
Profiles, inventory, match history, matchmaking tickets/region discovery, future social systems.

### `packages/game-core`
Pure/shared rules and constants. Code here should not depend on PlayCanvas, React, or Colyseus.

### `packages/protocol`
Client/server message contracts. Keep small and version-conscious.

### `packages/maps`
Data-driven collision, spawn, objective, and item-point definitions. Rendering meshes are separate assets.

## Simulation model

- Client renders at display cadence, target 60+ fps.
- Authoritative server ticks at 30 Hz initially.
- Network snapshots/events target 15–30 Hz depending on state.
- Clients locally predict their own movement, reconcile against server acknowledgements, and interpolate remote players.
- Hits, pickups, scores, cooldowns, and match outcome are server-owned.

## Physics

Use custom planar arcade movement/collision for players and most projectiles. Adopt Rapier selectively only when gameplay requires convincing rolling/bouncing/dynamic bodies. A heavyweight universal rigid-body simulation would complicate prediction and tuning without improving the core game.

## Rendering

PlayCanvas uses WebGPU when feasible with WebGL2 compatibility. Build scalable quality tiers. Use glTF/GLB meshes, KTX2/Basis textures, instancing for repeated props, and aggressive control of transparent overdraw.

## Data ownership

Persistent data never decides an active simulation tick. The match server can receive validated player/session metadata at room join, then runs independently. At match completion it emits a signed/authorized result to platform services asynchronously.

## Failure domains

- CDN/site outage: existing loaded matches may continue.
- Platform API degradation: active matches continue; matchmaking/account features may degrade.
- Match-server failure: only rooms on that process are lost; client receives reconnect/result policy.
- Redis degradation: matchmaking/presence may degrade, not authoritative active room state.
- Postgres degradation: durable writes queue/retry; do not block match tick.

# Roadmap

This roadmap is milestone-based. Dates should be assigned only after the prototype velocity is measured.

## M0 — Repository and architecture

- Monorepo scaffold.
- PlayCanvas visual graybox.
- Colyseus room.
- Shared rules/protocol/map packages.
- Local Postgres/Redis.
- Design documents and CI scaffold.

**Exit:** repository installs/builds and basic clients can connect to a room.

## M1 — Networked movement

- Keyboard/gamepad input abstraction.
- Local prediction/reconciliation.
- Remote interpolation.
- Simplified collision against arena geometry.
- Player name/number markers.
- network diagnostics overlay.

**Exit:** eight colored capsules move smoothly under representative latency.

## M2 — Combat vertical slice

- Pickup authority.
- Tomato projectile prediction/reconciliation.
- Server hit detection.
- Banana hazard.
- Dodge.
- hit/slip states.
- local VFX/audio hooks.

**Exit:** eight-player graybox is genuinely fun with no final character art.

## M3 — Sundae Control

- Objective ownership/scoring.
- round lifecycle/overtime/results/rematch.
- respawn/recovery.
- telemetry events.

**Exit:** complete repeatable three-minute match loop.

## M4 — Art prototype

- One production-quality hero rig/style.
- food-court environment kit.
- tomato/banana/pie production assets.
- first final VFX/audio language.
- performance-quality settings.

**Exit:** visual direction validated without blowing performance/download budgets.

## M5 — First polished playtest

- Eight-character readable set or modular variants.
- responsive HUD/lobby.
- accessibility controls.
- deployment to staging regions.
- crash/performance/network observability.
- structured external playtest.

**Exit:** retention/rematch/readability data supports continued content investment.

## Later, only after validation

- matchmaking/party/social depth;
- additional arenas/modes/items;
- accounts/progression/cosmetics;
- tablet/touch UX;
- ranked/competitive systems if audience demands them;
- live-ops/seasonal content.

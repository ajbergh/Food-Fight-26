# Roadmap

This roadmap is milestone-based. Dates should be assigned only after prototype velocity is measured.

## M0 — Repository and architecture — complete

- Monorepo scaffold.
- PlayCanvas visual graybox.
- Colyseus room.
- Shared rules/protocol/map packages.
- Local Postgres/Redis.
- Design documents and CI scaffold.

**Exit:** repository installs/builds and basic clients can connect to a room.

## M1 — Networked movement — complete

- Keyboard/gamepad input abstraction.
- Local prediction/reconciliation.
- Remote interpolation.
- Simplified collision against arena geometry.
- Player name markers.
- Network diagnostics overlay.

**Exit:** eight colored capsules move smoothly under representative latency.

## M2 — Combat vertical slice — complete at graybox level

- Authoritative food pickup economy.
- Tomato projectile authority and hit detection.
- Banana hazards.
- Dodge with temporary hazard immunity.
- Hit/slip states.
- Local procedural VFX hooks.

**Exit:** the core eight-player graybox rules are implemented; external playtesting is still required to establish whether the loop is genuinely fun.

## M3 — Sundae Control — in progress

- Objective ownership/scoring.
- Round countdown, timer, overtime, results, and automatic rematch loop.
- Round recovery/reset.
- Match-event telemetry hooks.
- Future: knockout-specific respawn if a health/KO system is introduced.

**Exit:** complete repeatable three-minute match loop.

## M4 — Art prototype

- One production-quality hero rig/style.
- Food-court environment kit.
- Tomato/banana/pie production assets.
- First final VFX/audio language.
- Performance-quality settings.

**Exit:** visual direction validated without blowing performance/download budgets.

## M5 — First polished playtest

- Eight-character readable set or modular variants.
- Responsive HUD/lobby.
- Accessibility controls.
- Deployment to staging regions.
- Crash/performance/network observability.
- Structured external playtest.

**Exit:** retention/rematch/readability data supports continued content investment.

## Later, only after validation

- matchmaking/party/social depth;
- additional arenas/modes/items;
- accounts/progression/cosmetics;
- tablet/touch UX;
- ranked/competitive systems if audience demands them;
- live-ops/seasonal content.

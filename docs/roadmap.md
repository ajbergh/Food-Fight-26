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

## M3 — Sundae Control — complete at prototype level

- Objective ownership/scoring.
- Round countdown, timer, overtime, results, and automatic rematch loop.
- Round recovery/reset.
- Match-event telemetry hooks.
- Client objective ownership, overtime, countdown, and result feedback.
- Future: knockout-specific respawn if a health/KO system is introduced.

**Exit:** complete repeatable three-minute match loop.

## M4 — Art prototype — in progress

- Procedural food-court perimeter and clearer environment hierarchy.
- Articulated stylized chef characters replace the visible player capsule treatment while retaining the existing gameplay collision model.
- Deterministic eight-player character variation across skin tone, proportions, hair, and chef headwear.
- Procedural idle/walk/run locomotion with articulated hips, knees, shoulders, elbows, body lean, and directional facing.
- Layered overhand tomato throw animation with wind-up, release, and recovery while locomotion continues.
- More readable sundae objective and team-control ring.
- Low/medium/high visual-quality toggles.
- Prototype action/match audio language using browser-synthesized cues.
- Reduced-motion-compatible peripheral action feedback.
- Live FPS/frame-time instrumentation for art iteration.
- Open-asset source shortlist and intake policy.
- Repository-level third-party provenance manifest with source approval/hold states.
- Automated CI asset audit for provenance, SHA-256 integrity, runtime formats, per-file byte ceilings, and first-play asset buckets.
- Automated glTF/GLB structural inspection with triangle/primitive/material/texture/animation ceilings and local-resource safety checks.
- Kenney Food Kit approved as the first controlled food-pack candidate; Quaternius Ultimate Food Pack remains on hold pending explicit license/provenance resolution.
- Quaternius Universal Base Characters/Animation Library and KayKit Adventurers/Character Animations documented as CC0 production-rig candidates.
- Next: replace projectile-nearest throw inference with explicit authoritative owner presentation events before competitive validation.
- Next: evaluate/import one production skinned GLB hero rig and retarget the established locomotion/throw motion language.
- Next: import a small selected Kenney Food Kit derivative set through Blender -> GLB/KTX2 and replace representative procedural food props without changing gameplay authority.
- Next: benchmark production-asset download size, draw-call pressure, skinning cost, and frame pacing on target laptops/tablets.

**Exit:** visual direction validated without blowing performance/download budgets.

## M5 — First polished playtest — in progress

- Repeatable multiplayer bot harness for local eight-player smoke/load tests.
- Automated Chromium smoke tests for real client/server connection, multiplayer room population, HUD/settings, and authoritative combat input.
- Automated game-client bundle-size regression budgets enforced in CI with build-summary reporting.
- Structured authoritative room tick-duration p50/p95/p99/max telemetry.
- Automated eight-client authoritative-room benchmark that validates room population and tick telemetry in CI.
- Production-shaped container targets for game server, platform API, game client, and web shell.
- CI container smoke that boots deployable images and exercises the containerized match server with real bot clients.
- Local staging compose stack with Postgres/Redis and explicit static health probes.
- Responsive gameplay HUD across desktop, phone/tablet widths, short landscape viewports, and display safe areas.
- Persistent HUD scale and reduced-motion accessibility controls with keyboard shortcuts and operating-system motion preference defaulting.
- Semantic live status treatment, minimum touch targets, keyboard focus styling, higher-contrast handling, and mobile E2E coverage for presentation settings.
- Persistent color-safe blue/orange team palette with matching HUD/3D objective/player materials and hue-independent diamond/circle team markers.
- Bounded browser session/performance/error telemetry with an aggregate staging summary endpoint and browser E2E ingestion coverage.
- Client observability explicitly excludes account identity, display names, user-agent strings, raw input, and stack traces; the current aggregate is process-local and non-durable.
- Environment-neutral game-client image with startup-generated runtime service URLs and release identity, validated in container smoke tests.
- Main-branch GHCR publication workflow for immutable SHA-tagged server/API/game/web images with OCI provenance/SBOM metadata, plus a pull-only compose definition for promotion testing.
- Browser telemetry grouped by runtime release identity for basic canary/regression comparison.
- Next: deploy the published immutable images to a hosted staging region and validate public HTTPS/WebSocket routing, health probes, and rollback.
- Next: responsive lobby/party flow once lobby interaction is promoted beyond the current direct-match prototype.
- Next: input remapping/accessibility control depth and formal color-vision validation on production art.
- Eight-character readable set or modular variants.
- Next observability step: durable structured logs/metrics plus hosted dashboards for room tick health, browser frame pacing, client error rate, and match completion/rematch behavior.
- Structured external playtest.

**Exit:** retention/rematch/readability data supports continued content investment.

## Later, only after validation

- matchmaking/party/social depth;
- additional arenas/modes/items;
- accounts/progression/cosmetics;
- tablet/touch UX;
- ranked/competitive systems if audience demands them;
- live-ops/seasonal content.

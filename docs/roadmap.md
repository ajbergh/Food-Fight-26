# Roadmap

This roadmap is milestone-based. Dates should be assigned only after prototype velocity is measured. A milestone marked complete means its scoped implementation is merged; any remaining production, hosting, or external-playtest validation is called out separately.

**Status snapshot (2026-09-01):** 30 implementation pull requests are merged. [PR #31](https://github.com/ajbergh/Food-Fight-26/pull/31) is the open documentation-only reconciliation pass.

## M0 — Repository and architecture — complete

- Monorepo scaffold.
- PlayCanvas visual graybox.
- Colyseus room.
- Shared rules/protocol/map packages.
- Local Postgres/Redis.
- Design documents and CI.
- CI validates checks, unit tests, asset audits, builds, bundle budgets, the eight-client room benchmark, container smoke, and browser E2E.

**Exit status:** complete. The repository installs/builds and browser clients can connect to an authoritative room.

## M1 — Networked movement — complete at prototype level

- Keyboard/gamepad input abstraction.
- Client-side local prediction with smoothing/snap correction to authoritative state.
- Remote-player interpolation.
- Shared simplified collision against arena geometry.
- Player name markers and a local-player marker.
- Network diagnostics overlay.

**Validation still required:** the implementation has automated multiplayer and load coverage, but the original exit wording—eight visually smooth clients under representative network latency—does not yet have a dedicated latency/packet-loss test. The current reconciliation is correction-based rather than input-history replay.

## M2 — Combat vertical slice — complete at graybox level

- Authoritative food-pickup economy and limited inventory.
- Tomato projectile authority, collision, and hit detection.
- Banana hazards.
- Dodge with temporary tomato/banana immunity.
- Hit/slip states.
- Procedural combat presentation and browser smoke coverage for authoritative combat input.

**Validation still required:** external eight-player playtesting and broader room-level combat-loop coverage are still needed to establish balance, readability, and fun.

## M3 — Sundae Control — complete at prototype level

- Objective ownership, contesting, and continuous scoring.
- Round countdown, timer, overtime, results, and automatic rematch loop.
- Round recovery/reset.
- Match-event telemetry hooks.
- Client objective ownership, overtime, countdown, and result feedback.
- Knockout-specific respawn remains conditional on introducing a health/KO system.

**Exit status:** complete for the current ruleset. The game supports a repeatable three-minute match loop.

## M4 — Art prototype and asset pipeline — complete at procedural prototype level

- Procedural food-court perimeter, detailed arena dressing, and a clear environment hierarchy.
- Articulated stylized chef characters over the existing authoritative capsule/collision model.
- Deterministic eight-player variation across skin tone, proportions, hair, and chef headwear.
- Procedural idle/walk/run locomotion and layered overhand throw animation.
- Readable sundae objective and team-control ring.
- Low/medium/high quality tiers, synthesized action/match audio, reduced-motion feedback, and live FPS/frame-time instrumentation.
- Third-party provenance manifest and automated CI audits for source approval, hashes, runtime formats, byte ceilings, first-play buckets, and glTF/GLB structure.
- Kenney Food Kit is approved as a controlled food-prop source. Quaternius Ultimate Food Pack remains on hold pending explicit license/provenance resolution.

**Corrections to the previous roadmap:** authoritative projectile ownership now drives throw presentation through the PR #25 character pass, so nearest-projectile inference is no longer a pending item. KayKit Adventurers is the approved CC0 production-character source; the repository does not currently establish a separate approved Quaternius character/animation source.

**Remaining production work:** import selected audited production food props, turn the M11 technical pilot into a final chef silhouette, and benchmark production-asset download size, draw calls, skinning cost, memory, and frame pacing on target laptops/tablets.

## M5 — First polished playtest foundation — in progress

### Delivered

- Repeatable multiplayer bot harness and an automated eight-client authoritative-room benchmark.
- Chromium E2E for client/server connection, multiplayer population, HUD/settings, mobile layouts, and authoritative combat input.
- Game-client bundle-size regression budgets and CI build summaries.
- Authoritative room tick p50/p95/p99/max telemetry.
- Production-shaped server/API/game/web containers, CI container smoke, and a local staging compose stack with Postgres/Redis health probes.
- Responsive gameplay HUD across desktop, phone/tablet widths, short landscape viewports, and display safe areas.
- Persistent HUD scale, reduced-motion, color-safe team palette, hue-independent team shapes, keyboard focus, contrast, and minimum-touch-target treatments.
- Bounded browser session/performance/error telemetry with release grouping and a process-local staging summary endpoint. It excludes identity, display names, user-agent strings, raw input, and stack traces.
- Runtime-configured client images and main-branch GHCR publication of immutable SHA-tagged images with OCI provenance/SBOM metadata.
- Commercial-grade arena/HUD presentation and adaptive fallback from sustained low-FPS high quality to the performance tier.

### Remaining before the milestone exit

- Deploy immutable images to a hosted staging region and validate public HTTPS/WebSocket routing, health probes, promotion, and rollback.
- Add durable structured logs/metrics and hosted dashboards for room tick health, browser frame pacing, client error rate, and match completion/rematch behavior.
- Run a structured external playtest and collect retention, rematch, readability, performance, and balance evidence.
- Deepen input remapping/accessibility controls and formally validate color vision/readability against production art.
- Build a responsive lobby/party flow if the product moves beyond the current direct-match prototype.

**Exit status:** not yet met. The automated and deployment foundations exist, but hosted staging and external-playtest evidence do not.

## M6 — Environment art pass — complete at scoped presentation level

- Added a food-hall proscenium, vendor storefront/menu-board hierarchy, hanging wayfinding, posters, broad floor composition bands, and a stronger sundae focal point.
- Added quality-gated condiment islands, counter displays, ceiling rhythm, and secondary planter clusters.
- Kept the combat floor readable and all new dressing presentation-only, without changing collision, spawns, pickups, the objective, or simulation.
- Kept new decorative renderers non-shadow-casting and added no dynamic lights in this pass.

**Exit status:** the scoped commercial environment finish merged in PR #24. Audited production-prop replacement remains part of later asset production.

## M7 — Character art and animation pass — complete at procedural production-pass level

- Strengthened chef silhouette, proportions, clothing layers, face/headwear detail, and team/readability cues.
- Improved run articulation, throw anticipation/release squash-and-stretch, and held tomato/banana presentation.
- Replaced the earlier nearest-player throw heuristic with authoritative `ownerSessionId` presentation, including banana actions.
- Approved KayKit Adventurers as the CC0 source for the first production-character pilot.

**Exit status:** the procedural production pass merged in PR #25, and the opt-in skinned technical pilot merged in PR #30. Default replacement remains gated by M11's remaining performance, readability, and final-art requirements.

## M8 — VFX and juice pass — complete at bounded prototype level

- Added an emissive tomato trail, impact bursts, dodge dust, pulsing banana-hazard warnings, pickup auras, and objective celebration bursts.
- Built on the commercial HUD pass for score pops, contested-objective feedback, empty-ammo state, and last-30/last-10-second urgency.
- Capped transient effects, reused shared materials, disabled effect shadows, and reduced effect density/motion in reduced-motion mode.
- Added no replicated state, gameplay authority, or dynamic-light cost.

**Exit status:** the scoped bounded VFX pass merged in PR #26. Additional footstep/contact effects or banana-deploy treatment should be playtest-driven rather than assumed complete.

## M9 — Materials and lighting pass — complete at bounded production-grade level

- Rebalanced the key, fill, objective, and ambient lighting hierarchy by quality tier.
- Added only two static, non-shadow-casting vendor fills on high quality; the directional key remains the only conditional shadow caster.
- Improved floor/wall/counter response, sundae focus, and diffuse/emissive objective ownership treatment.
- Added no post-processing, render targets, dynamic probes, textures, networking, collision, or match-rule changes.

**Exit status:** the scoped lighting/material grade merged in PR #27, with the low/medium performance contract preserved.

## M10 — Camera and match presentation pass — complete at presentation-layer level

- Added bounded round-start settle, objective-capture framing impulse, overtime intensity, and winner framing/celebration.
- Drives the presentation from existing authoritative HUD/event surfaces without mutating PlayCanvas gameplay-camera or network state.
- Caps and cleans up transient celebration elements; reduced-motion disables cinematic canvas/title motion and celebration pieces.

**Exit status:** the scoped cinematic presentation merged in PR #28. It intentionally uses shell-level presentation transforms rather than changing the authoritative gameplay camera; hit micro-shake or deeper camera work remains optional and playtest-driven.

## M11 — Skeletal character pilot — complete at opt-in pilot level

[PR #29](https://github.com/ajbergh/Food-Fight-26/pull/29) merged with a green CI validation check on 2026-09-01.

[PR #30](https://github.com/ajbergh/Food-Fight-26/pull/30) merged after its green CI validation run on 2026-09-01.

### Delivered in PR #29

- Expose named animation clips during glTF/GLB inspection.
- Add an optional skeletal asset contract requiring a skin and the canonical `idle`, `walk`, `run`, and `throw_food` clips.
- Run the skeletal contract through the existing asset audit with dedicated tests.
- Add an opt-in `?skeletalPilot=1` PlayCanvas loader with shared loading, a four-state animation graph, and procedural-chef fallback.

### Delivered in PR #30

- Added a deterministic, pinned KayKit Mage derivative with only the canonical `idle`, `walk`, `run`, and `throw_food` clips; source and generated SHA-256 digests are recorded in the third-party manifest.
- Removed the source mage hat, cape, staff, wand, and spellbook nodes while preserving the skinned character, embedded texture, and animation data.
- Enforced the generated GLB's size, geometry, material, texture, skin, and clip contracts in the asset audit.
- Wired the shared model into the live player presentation behind `?skeletalPilot=1`, preserving team rings and procedural fallback if loading or validation fails.
- Drives locomotion from player speed and throw playback from the authoritative throw event, with browser coverage for model loading, animation playback, and a real ammo-consuming throw.
- Added Windows-safe container entrypoint normalization and a Corepack-backed bot-smoke invocation after the full container smoke exposed those portability gaps.

### Still gated before default enablement

- The derivative is an engineering pilot, not the final authored chef silhouette or cosmetic system.
- The adapter remains opt-in and the procedural chef remains the default presentation.
- Representative eight-player client performance and gameplay readability still require playtest evidence before default enablement.
- No gameplay, collision, networking, reconciliation, projectile, objective, or match state changes are proposed.

**Exit status:** complete for the opt-in technical pilot. The procedural chef remains the default until the remaining gates below are met.

**Next:** validate eight-player client performance and readability on representative hardware, then schedule a final chef-authoring pass or retain the procedural presentation as the default.

## Pull-request coverage

| Milestone | Pull requests reflected here                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1        | [#1](https://github.com/ajbergh/Food-Fight-26/pull/1), [#2](https://github.com/ajbergh/Food-Fight-26/pull/2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| M2        | [#3](https://github.com/ajbergh/Food-Fight-26/pull/3), [#4](https://github.com/ajbergh/Food-Fight-26/pull/4), [#5](https://github.com/ajbergh/Food-Fight-26/pull/5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| M3        | [#6](https://github.com/ajbergh/Food-Fight-26/pull/6)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| M4        | [#7](https://github.com/ajbergh/Food-Fight-26/pull/7), [#8](https://github.com/ajbergh/Food-Fight-26/pull/8), [#15](https://github.com/ajbergh/Food-Fight-26/pull/15), [#16](https://github.com/ajbergh/Food-Fight-26/pull/16), [#21](https://github.com/ajbergh/Food-Fight-26/pull/21), [#22](https://github.com/ajbergh/Food-Fight-26/pull/22)                                                                                                                                                                                                                                                                                                |
| M5        | [#9](https://github.com/ajbergh/Food-Fight-26/pull/9), [#10](https://github.com/ajbergh/Food-Fight-26/pull/10), [#11](https://github.com/ajbergh/Food-Fight-26/pull/11), [#12](https://github.com/ajbergh/Food-Fight-26/pull/12), [#13](https://github.com/ajbergh/Food-Fight-26/pull/13), [#14](https://github.com/ajbergh/Food-Fight-26/pull/14), [#17](https://github.com/ajbergh/Food-Fight-26/pull/17), [#18](https://github.com/ajbergh/Food-Fight-26/pull/18), [#19](https://github.com/ajbergh/Food-Fight-26/pull/19), [#20](https://github.com/ajbergh/Food-Fight-26/pull/20), [#23](https://github.com/ajbergh/Food-Fight-26/pull/23) |
| M6        | [#24](https://github.com/ajbergh/Food-Fight-26/pull/24)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| M7        | [#25](https://github.com/ajbergh/Food-Fight-26/pull/25)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| M8        | [#26](https://github.com/ajbergh/Food-Fight-26/pull/26)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| M9        | [#27](https://github.com/ajbergh/Food-Fight-26/pull/27)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| M10       | [#28](https://github.com/ajbergh/Food-Fight-26/pull/28)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| M11       | [#29](https://github.com/ajbergh/Food-Fight-26/pull/29), [#30](https://github.com/ajbergh/Food-Fight-26/pull/30)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

M0 is the repository baseline and predates this PR ledger. The table accounts for all 30 merged implementation pull requests at the status snapshot; the open documentation-only PR is linked above.

## Later, only after validation

- Matchmaking, party, and social depth.
- Additional arenas, modes, and items.
- Accounts, progression, and cosmetics.
- Full touch gameplay-input UX; the current milestone covers responsive HUD/layout behavior, not touch movement/combat controls.
- Ranked/competitive systems if audience demand and validation justify them.
- Live-ops and seasonal content.

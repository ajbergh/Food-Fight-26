# Roadmap

This roadmap is milestone-based. Dates should be assigned only after prototype velocity is measured. A milestone marked complete means its scoped implementation is merged; any remaining production, hosting, hardware, or external-playtest validation is called out separately.

**Status snapshot (2026-09-04):** M15 audited production-prop replacement implementation is complete through [PR #43](https://github.com/ajbergh/Food-Fight-26/pull/43). The five merged M15 implementation tranches ([#36](https://github.com/ajbergh/Food-Fight-26/pull/36), [#38](https://github.com/ajbergh/Food-Fight-26/pull/38), [#41](https://github.com/ajbergh/Food-Fight-26/pull/41), [#42](https://github.com/ajbergh/Food-Fight-26/pull/42), and [#43](https://github.com/ajbergh/Food-Fight-26/pull/43)) now cover food displays, perimeter furniture/waste, storefront/service and cold-display fixtures, checkout/recycling, core food-service equipment, and authored commercial-lighting fixtures. M17 ambient arena-life work in [PR #37](https://github.com/ajbergh/Food-Fight-26/pull/37), [PR #39](https://github.com/ajbergh/Food-Fight-26/pull/39), and [PR #40](https://github.com/ajbergh/Food-Fight-26/pull/40) is merged but the milestone remains open for optional bounded follow-on work. [PR #31](https://github.com/ajbergh/Food-Fight-26/pull/31) and [PR #35](https://github.com/ajbergh/Food-Fight-26/pull/35) are documentation-only reconciliation passes. The automated eight-player multiplayer/authoritative-room gate is treated as passing for this roadmap iteration, per project direction. That assumption does not replace the separate M18 graphics requirement to measure eight simultaneously rendered animated players on representative client hardware.

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

**Roadmap assumption:** the automated eight-player multiplayer gate is considered passing for current visual-production planning. A dedicated latency/packet-loss profile remains useful hardening work because current reconciliation is correction-based rather than input-history replay, but it is not a blocker for M12+ art work.

## M2 — Combat vertical slice — complete at graybox level

- Authoritative food-pickup economy and limited inventory.
- Tomato projectile authority, collision, and hit detection.
- Banana hazards.
- Dodge with temporary tomato/banana immunity.
- Hit/slip states.
- Procedural combat presentation and browser smoke coverage for authoritative combat input.

**Roadmap assumption:** automated eight-player multiplayer validation is considered passing. External playtesting is still required to establish balance, readability, rematch behavior, and fun under real human combat density.

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
- Kenney Food Kit, Kenney Furniture Kit, and Kenney Mini Market are approved as controlled CC0 production-prop sources. Quaternius Ultimate Food Pack remains on hold pending explicit license/provenance resolution.

**Production status after M12–M17:** the procedural art stack is no longer only a graybox. M13 established stronger hero architecture and food-service equipment footprints, M14 moved the opt-in skeletal pilot toward a chef identity, M15 completed a deterministic audited production-GLB replacement pass, and M17 added bounded environmental life without changing gameplay. Remaining production work is concentrated in the final authored-chef decision, ambient-life/readability validation, and representative rendered-client performance evidence.

## M5 — First polished playtest foundation — in progress

### Delivered

- Repeatable multiplayer bot harness and automated eight-client authoritative-room benchmark.
- Chromium E2E for client/server connection, multiplayer population, HUD/settings, mobile layouts, skeletal-pilot loading, authoritative combat input, High-quality production-prop loading, and reduced-motion presentation state.
- Game-client bundle-size regression budgets and CI build summaries.
- Authoritative room tick p50/p95/p99/max telemetry.
- Production-shaped server/API/game/web containers, CI container smoke, and a local staging compose stack with Postgres/Redis health probes.
- Responsive gameplay HUD across desktop, phone/tablet widths, short landscape viewports, and display safe areas.
- Persistent HUD scale, reduced-motion, color-safe team palette, hue-independent team shapes, keyboard focus, contrast, and minimum-touch-target treatments.
- Bounded browser session/performance/error telemetry with release grouping and a process-local staging summary endpoint.
- Runtime-configured client images and main-branch GHCR publication of immutable SHA-tagged images with OCI provenance/SBOM metadata.
- Commercial-grade arena/HUD presentation and adaptive fallback from sustained low-FPS High quality to the performance tier.

### Remaining before milestone exit

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
- Kept decorative renderers non-shadow-casting and added no dynamic lights in this pass.

**Exit status:** the scoped commercial environment finish merged in PR #24. M13 later added a hero-architecture layer and M15 completed audited production-prop replacement.

## M7 — Character art and animation pass — complete at procedural production-pass level

- Strengthened chef silhouette, proportions, clothing layers, face/headwear detail, and team/readability cues.
- Improved run articulation, throw anticipation/release squash-and-stretch, and held tomato/banana presentation.
- Replaced the earlier nearest-player throw heuristic with authoritative `ownerSessionId` presentation, including banana actions.
- Approved KayKit Adventurers as the CC0 source for the first production-character pilot.

**Exit status:** the procedural production pass merged in PR #25, the skinned technical pilot merged in PR #30, M12 added combat-reaction posing, and M14 added a chef identity finish. The procedural chef remains the default until the final-character and rendered-client performance gates are met.

## M8 — VFX and juice pass — complete at bounded prototype level

- Added emissive tomato trail, impact bursts, dodge dust, pulsing banana-hazard warnings, pickup auras, and objective celebration bursts.
- Built on the commercial HUD pass for score pops, contested-objective feedback, empty-ammo state, and late-round urgency.
- Capped transient effects, reused shared materials, disabled effect shadows, and reduced effect density/motion in reduced-motion mode.
- Added no replicated state, gameplay authority, or dynamic-light cost.

**Exit status:** the scoped bounded VFX pass merged in PR #26. Additional effects should be playtest-driven.

## M9 — Materials and lighting pass — complete at bounded production-grade level

- Rebalanced key, fill, objective, and ambient lighting hierarchy by quality tier.
- Added only two static, non-shadow-casting vendor fills on High quality; the directional key remains the only conditional shadow caster.
- Improved floor/wall/counter response, sundae focus, and diffuse/emissive objective ownership treatment.
- Added no post-processing, render targets, dynamic probes, textures, networking, collision, or match-rule changes.

**Exit status:** the scoped lighting/material grade merged in PR #27, with the Low/Medium performance contract preserved.

## M10 — Camera and match presentation pass — complete at presentation-layer level

- Added bounded round-start settle, objective-capture framing impulse, overtime intensity, and winner framing/celebration.
- Drives presentation from existing authoritative HUD/event surfaces without mutating gameplay-camera or network state.
- Caps and cleans up transient celebration elements; reduced-motion disables cinematic canvas/title motion and celebration pieces.

**Exit status:** the scoped cinematic presentation merged in PR #28.

## M11 — Skeletal character pilot — complete at opt-in pilot level

[PR #29](https://github.com/ajbergh/Food-Fight-26/pull/29) established the audited skeletal contract and opt-in loader. [PR #30](https://github.com/ajbergh/Food-Fight-26/pull/30) added the deterministic pinned KayKit-derived runtime pilot.

### Delivered

- Named animation-clip inspection and skeletal asset audit requiring a skin plus `idle`, `walk`, `run`, and `throw_food`.
- Shared opt-in `?skeletalPilot=1` loading with a PlayCanvas animation graph and procedural-chef fallback.
- Deterministic pinned derivative with fantasy accessories removed and source/generated SHA-256 digests recorded.
- Asset size/geometry/material/texture/skin/clip budgets.
- Locomotion from player speed and throw playback from authoritative throw events.
- Browser E2E for real pilot loading and ammo-consuming combat input.

**Exit status:** complete as an engineering pilot. M12 and M14 build on this adapter, but the procedural chef remains the default.

## M12 — Reactive character animation — complete

[PR #32](https://github.com/ajbergh/Food-Fight-26/pull/32) merged with a green full CI run on 2026-09-04.

- Added bounded presentation-only `dodge` and `slip` action poses alongside idle/walk/run/throw.
- Improved procedural chef torso/head/scarf/limb/facial/squash-stretch reactions.
- Added the same action layer to the skeletal pilot without requiring additional GLB clips.
- Derived the visual reactions from existing authoritative root presentation instead of adding protocol state.
- Added unit coverage for state inference and pose bounds.

**Exit status:** complete. The immediate dodge/slip animation gap is closed for both presentation paths; authored skeletal clips can replace the fallback later only if they improve timing/readability.

## M13 — Arena hero model pass — complete

[PR #33](https://github.com/ajbergh/Food-Fight-26/pull/33) merged with a green full CI run on 2026-09-04.

- Added north/south mezzanine architecture, rails/glass-panel masses, and east/west escalator banks on Medium quality.
- Added recognizable pizza-oven, burger-grill/hood, and shake-machine equipment on High quality.
- Kept all additions outside authoritative combat topology and central readability lanes.
- Added no downloads, textures, dynamic lights, shadow casters, collision, or networking state.
- Established controlled visual footprints for later audited production GLB replacements.

**Exit status:** complete for the procedural hero-model layer. Production asset replacement is M15.

## M14 — Skeletal chef model finish — complete at opt-in model-finish level

[PR #34](https://github.com/ajbergh/Food-Fight-26/pull/34) merged after its final green full CI run on 2026-09-04.

- Added deterministic classic/tall/compact toque proportions.
- Added hierarchy-node discovery with exact-name preference and partial skeletal-name fallback.
- Attached lightweight chef toque and apron identity geometry to animated head/torso hierarchy nodes when available.
- Kept cosmetic finish team-neutral; existing external team rings and hue-independent shapes remain authoritative for team readability.
- Added no new binary assets, downloads, textures, lights, collision, protocol, or gameplay state.
- Preserved graceful degradation and the procedural-chef fallback.

**Exit status:** complete for the current pilot model finish. This improves chef identity but does not declare the KayKit derivative the final shipping character.

### Remaining before skeletal default enablement

- Decide whether to author a purpose-built Food Fight chef mesh or retain the procedural chef as the shipping default.
- If a final skeletal chef is authored, complete Food Fight-specific `throw_food`, `hit`, `celebrate`, and `defeat` motion plus authored dodge/slip only when superior to the M12 fallback.
- Measure eight simultaneously rendered animated characters on representative laptops/tablets: frame pacing, draw calls, skinning cost, texture/GPU memory, and first-play download behavior.
- Perform formal combat-readability, color-vision, and reduced-motion review.

## M15–M19 — Visual production sequence — in progress

The detailed sequence and acceptance gates live in [Visual production roadmap](visual-production-roadmap.md).

### M15 — Audited production prop replacement — complete at scoped replacement level

[PR #36](https://github.com/ajbergh/Food-Fight-26/pull/36) merged the first production-safe food-display tranche; [PR #38](https://github.com/ajbergh/Food-Fight-26/pull/38) added audited furniture/waste; [PR #41](https://github.com/ajbergh/Food-Fight-26/pull/41) added Mini Market perimeter/service fixtures; [PR #42](https://github.com/ajbergh/Food-Fight-26/pull/42) replaced core food-service equipment; and [PR #43](https://github.com/ajbergh/Food-Fight-26/pull/43) added authored commercial-lighting fixtures while hardening the manifest audit.

- Deterministically derives and audits production Food Kit `pizza`, `pizza-box`, `can`, and `carton` models.
- Derives Furniture Kit `bench`, `chair`, `table-round`, `trashcan`, `stove-electric`, `hood-large`, `blender`, `coffee-machine`, `microwave`, `lamp-square-ceiling`, and `lamp-wall` models with pinned official license/provenance verification and immutable mirrored source-byte checks.
- Derives Mini Market `service-window`, `freezers-standing`, `cash-register`, and `bottle-return` models from exact pinned source blobs.
- Applies exact source/output integrity, byte, triangle, primitive, material, texture, and animation ceilings in the asset manifest.
- Fails CI if a supported runtime asset exists below `manifest.runtimeRoot` without an explicit manifest entry.
- Lazy-loads the production set only on High graphics quality and preserves procedural fallback on missing/failed assets.
- Replaces only presentation geometry after successful loading; authoritative collision and map topology remain unchanged.
- Reproduces derivation in CI and the production game-client image, with asset audit, container smoke, bundle budgets, the eight-client authoritative-room benchmark, and browser E2E gates.
- Preserves the M9 lighting contract: authored ceiling/wall fixtures are geometry only and do not add dynamic lights or shadow casters.

#### Intentional procedural retentions

The final approved-source inventory was reviewed rather than forcing one-for-one replacements that would reduce semantic clarity:

- **Wayfinding/signage:** retained. The approved pinned Mini Market catalog has no signage model, and the approved Furniture Kit GLB tree has no semantically correct sign/board candidate. The existing M6 wayfinding is more appropriate than importing an unrelated pack for a weak substitution.
- **Pizza oven:** retained. The approved Furniture Kit source has no true pizza-oven model; substituting a domestic stove would reduce the M13 station silhouette.
- **`display-burger`, `display-lettuce`, `display-shake`:** retained as small stylized counter cues. The pinned Food Kit runtime subset at revision `d00f54f4acd328bc2162656a09f4b78a9a1e6364` contains only `can-open`, `can-small`, `can`, `carton`, `pizza-box`, `pizza` and the shared colormap, with no semantically adequate burger/lettuce/shake equivalents.

**Exit status:** complete for the scoped production-replacement implementation. The visually important replacement categories now have representative audited production coverage, and remaining procedural elements are explicit art-direction decisions rather than unreviewed placeholders. M18 owns representative-hardware frame pacing, eight-simultaneously-rendered-character measurement, gameplay-camera readability/accessibility review, and the final production-readiness decision; those validation gates do not require M15 to continue importing assets.

### M16 — Final authored Food Fight chef — conditional/planned

Conditional on visual/performance value: produce a purpose-built reusable chef rig and production action/results clips, then benchmark eight instances before considering default enablement.

### M17 — Ambient arena life and environmental animation — in progress

[PR #37](https://github.com/ajbergh/Food-Fight-26/pull/37), [PR #39](https://github.com/ajbergh/Food-Fight-26/pull/39), and [PR #40](https://github.com/ajbergh/Food-Fight-26/pull/40) are merged ambient-life tranches.

- Reuses the existing M13 west/east escalator step entities for slow opposing peripheral motion.
- Adds restrained sway to the three M6 hanging-wayfinding elements.
- Adds subtle pizza-oven, grill, and shake-machine equipment movement on High quality.
- Adds slow, out-of-phase horizontal breathing to the four existing vendor menu-board accent/line primitives with a maximum ±1.8 percent scale change.
- Adds eight High-quality-only, dark/desaturated two-primitive mezzanine patrons behind the rails, with ±0.025-unit bob and ±2.2-degree yaw sway.
- Keeps the crowd free of team colors/shapes, chef hats, player rings, held items, labels, collision, skeletal animation, and shadows so it cannot masquerade as gameplay actors.
- Runs all ambient updates through the existing presentation update path with a fixed 30 Hz budget instead of another render-frame subscription; the crowd brings the High-detail ceiling to 56 small transform updates per sample.
- Uses the existing reduced-motion contract to return all nonessential movement to stable authored poses/scales/positions.
- Adds unit coverage for bounded motion math and E2E-visible `data-arena-ambient-life`, `data-arena-ambient-menu`, and `data-arena-ambient-crowd` diagnostics.
- Changes no collision, gameplay authority, networking, projectiles, pickups, objective behavior, dynamic lights, textures, or runtime downloads.

**Exit status:** M17 remains in progress after the merged mezzanine-patron tranche. Occasional peripheral service/cart motion and restrained environmental audio remain optional follow-on work and require explicit readability/performance budgets. Do not increase crowd density until M18 representative-client evidence validates the current High-quality cost.

### M18 — Visual validation and regression gates — planned

Record representative hardware metrics for eight animated players and the arena, formalize readability/accessibility review, and decide default character, default graphics tier, first-play asset inventory, and whether Food Court is production-ready.

### M19 — Second arena/theme kit — conditional

Only begin a second arena after M18 proves that the first arena's production art/performance pipeline is reusable.

## Pull-request coverage

| Milestone | Pull requests reflected here |
| --- | --- |
| M1 | [#1](https://github.com/ajbergh/Food-Fight-26/pull/1), [#2](https://github.com/ajbergh/Food-Fight-26/pull/2) |
| M2 | [#3](https://github.com/ajbergh/Food-Fight-26/pull/3), [#4](https://github.com/ajbergh/Food-Fight-26/pull/4), [#5](https://github.com/ajbergh/Food-Fight-26/pull/5) |
| M3 | [#6](https://github.com/ajbergh/Food-Fight-26/pull/6) |
| M4 | [#7](https://github.com/ajbergh/Food-Fight-26/pull/7), [#8](https://github.com/ajbergh/Food-Fight-26/pull/8), [#15](https://github.com/ajbergh/Food-Fight-26/pull/15), [#16](https://github.com/ajbergh/Food-Fight-26/pull/16), [#21](https://github.com/ajbergh/Food-Fight-26/pull/21), [#22](https://github.com/ajbergh/Food-Fight-26/pull/22) |
| M5 | [#9](https://github.com/ajbergh/Food-Fight-26/pull/9), [#10](https://github.com/ajbergh/Food-Fight-26/pull/10), [#11](https://github.com/ajbergh/Food-Fight-26/pull/11), [#12](https://github.com/ajbergh/Food-Fight-26/pull/12), [#13](https://github.com/ajbergh/Food-Fight-26/pull/13), [#14](https://github.com/ajbergh/Food-Fight-26/pull/14), [#17](https://github.com/ajbergh/Food-Fight-26/pull/17), [#18](https://github.com/ajbergh/Food-Fight-26/pull/18), [#19](https://github.com/ajbergh/Food-Fight-26/pull/19), [#20](https://github.com/ajbergh/Food-Fight-26/pull/20), [#23](https://github.com/ajbergh/Food-Fight-26/pull/23) |
| M6 | [#24](https://github.com/ajbergh/Food-Fight-26/pull/24) |
| M7 | [#25](https://github.com/ajbergh/Food-Fight-26/pull/25) |
| M8 | [#26](https://github.com/ajbergh/Food-Fight-26/pull/26) |
| M9 | [#27](https://github.com/ajbergh/Food-Fight-26/pull/27) |
| M10 | [#28](https://github.com/ajbergh/Food-Fight-26/pull/28) |
| M11 | [#29](https://github.com/ajbergh/Food-Fight-26/pull/29), [#30](https://github.com/ajbergh/Food-Fight-26/pull/30) |
| M12 | [#32](https://github.com/ajbergh/Food-Fight-26/pull/32) |
| M13 | [#33](https://github.com/ajbergh/Food-Fight-26/pull/33) |
| M14 | [#34](https://github.com/ajbergh/Food-Fight-26/pull/34) |
| M15 | [#36](https://github.com/ajbergh/Food-Fight-26/pull/36), [#38](https://github.com/ajbergh/Food-Fight-26/pull/38), [#41](https://github.com/ajbergh/Food-Fight-26/pull/41), [#42](https://github.com/ajbergh/Food-Fight-26/pull/42), [#43](https://github.com/ajbergh/Food-Fight-26/pull/43) |
| M17 | [#37](https://github.com/ajbergh/Food-Fight-26/pull/37), [#39](https://github.com/ajbergh/Food-Fight-26/pull/39), [#40](https://github.com/ajbergh/Food-Fight-26/pull/40) |

M0 is the repository baseline and predates this PR ledger. PR #31 and PR #35 are documentation-only reconciliation passes and are intentionally not counted as implementation pull requests.

## Later product work, only after validation

- Matchmaking, party, and social depth.
- Additional modes and items.
- Accounts, progression, and cosmetics.
- Full touch gameplay-input UX; current work covers responsive HUD/layout behavior, not touch movement/combat controls.
- Ranked/competitive systems if audience demand and validation justify them.
- Live-ops and seasonal content.

# Visual Production Roadmap

This document extends the master roadmap with the next art-production gates after M12–M14. It is deliberately ordered so visual ambition does not outrun multiplayer readability, asset provenance, or client performance.

## Current baseline — complete through M14, M15 and M17 in progress

The repository now has a coherent presentation stack rather than a single graybox art pass:

- **M12 — reactive character animation:** procedural and skeletal character paths react to dodge and slip/stun states without changing authoritative gameplay.
- **M13 — arena hero models:** quality-gated mezzanine/escalator architecture and recognizable food-service equipment add food-court depth outside combat lanes.
- **M14 — skeletal chef model finish:** the opt-in skinned pilot receives lightweight bone-attached chef identity geometry while retaining deterministic derivation and procedural fallback.
- **M15 — audited production prop replacement:** PR #36 established the deterministic Kenney Food Kit path; PR #38 added audited perimeter furniture/waste; PR #41 added Mini Market service, refrigeration, checkout, and recycling fixtures; PR #42 added production food-service equipment; PR #43 is the authored commercial-fixture and audit-hardening tranche.
- **M17 — ambient arena life:** PR #37 established bounded escalator/sign/equipment animation; PR #39 merged bounded vendor-menu activity; PR #40 merged the High-quality-only mezzanine spectator tranche.

The automated eight-player multiplayer/room gate is treated as passing for this roadmap pass. That does **not** replace the separate requirement to measure eight simultaneously rendered animated clients on representative hardware.

## M15 — Audited production prop replacement — in progress

### Goal

Replace the highest-value procedural arena placeholders with a deliberately small set of audited production GLBs while preserving the footprints and quality-tier ownership established by M13.

### Tranche 1 — merged in PR #36

The first implementation tranche intentionally proved the production-asset path before larger environment imports:

- selected Kenney Food Kit `pizza`, `pizza-box`, `can`, and `carton` models;
- immutable mirror revision and Git-blob verification for downloaded source bytes;
- deterministic derivation that embeds the shared external colormap into self-contained runtime GLBs;
- existing structural inspection applied before generated files are accepted;
- exact output integrity/geometry ceilings recorded in the third-party manifest;
- High-quality-only lazy loading so the default Medium tier does not pay the model download/parse cost;
- procedural arena dressing retained as fallback when any production container fails;
- Docker-image smoke checks proving all four derived GLBs ship in release-shaped images;
- browser E2E coverage for successful High-quality production-prop readiness.

### Tranche 2 — merged in PR #38

The second tranche expanded representative coverage beyond food-display props:

- approved Kenney Furniture Kit as a controlled CC0 source;
- verified a pinned official Kenney archive and internal CC0 marker;
- retrieved only selected runtime source models from an immutable mirrored revision with exact Git blob verification;
- added audited `bench`, `chair`, `table-round`, and `trashcan` GLBs;
- placed furniture/waste models only around the safe perimeter;
- replaced selected procedural perimeter-table presentation entities only after successful production-model loading;
- exposed furniture-specific runtime readiness while retaining the same High-quality lazy-load/fallback contract;
- reproduced furniture derivation in CI and the production game-client image and verified generated files in container smoke.

### Tranche 3 — merged in PR #41

The third tranche moved from small dressing to recognizable food-court service/store fixtures using a tightly scoped Kenney Mini Market subset:

- approved Kenney Mini Market as a controlled CC0 source while using an immutable public mirror only for deterministic source bytes;
- pinned exact Git blob SHA-1 identities for `wall-window`, `freezers-standing`, `cash-register`, `bottle-return`, and the shared colormap;
- derived only four self-contained runtime GLBs: `service-window`, `freezers-standing`, `cash-register`, and `bottle-return`;
- recorded exact output SHA-256 plus per-model byte, triangle, primitive, material, texture, and animation ceilings;
- replaced the west/east procedural vending blocks with standing freezer banks after successful High-quality loading;
- replaced the west/east procedural recycling blocks with bottle-return stations after successful loading;
- added a service-window module and registers to the north vendor perimeter without changing collision or map topology;
- exposed `data-production-mini-market="loading|ready|partial|fallback"` and required successful High-quality loading in browser E2E;
- reproduced the derivation in CI and the production game-client Docker image and directly verified all four runtime files in container smoke.

The four models total 117,188 generated bytes and 829 triangles, keeping the tranche far below the arena asset and geometry budgets while materially improving perimeter recognizability.

### Tranche 4 — merged in PR #42

The fourth tranche reused the already approved Furniture Kit for recognizable food-service equipment instead of introducing another dependency:

- `stove-electric` replaces the procedural burger-grill presentation block;
- `hood-large` provides a production extraction silhouette above the grill station;
- three `blender` instances replace the procedural shake-machine cabinet;
- `microwave` and `coffee-machine` add recognizable counter equipment;
- the stylized pizza oven remains procedural because the approved source does not contain a semantically correct pizza-oven replacement;
- all equipment remains High-only, lazy-loaded, non-colliding, non-shadow-casting presentation geometry with procedural fallback;
- the five source models total 66,564 generated bytes and 938 triangles.

### Tranche 5 — active in PR #43

The fifth tranche replaces generic High-quality luminous cards with authored commercial-lighting silhouettes while preserving the M9 light budget:

- pins Kenney Furniture Kit `lampSquareCeiling.glb` and `lampWall.glb` to exact Git blob identities at the already approved mirror revision;
- derives texture-free runtime outputs totaling 10,456 bytes and 102 triangles;
- replaces the three High-detail procedural ceiling cards with authored ceiling-lamp instances after successful load;
- adds three wall-lamp instances along the vendor wall;
- treats fixtures as geometry only: no additional PlayCanvas lights, shadow casters, probes, post-process passes, collision, or replicated state;
- adds `data-production-fixtures="loading|ready|partial|fallback"` and explicit High-quality E2E coverage;
- corrects the PR #42 manifest omission by adding all five already-generated kitchen models to the fail-closed asset manifest;
- hardens the audit CLI so supported runtime assets present below `manifest.runtimeRoot` but absent from `manifest.assets` fail CI, preventing the same omission from recurring.

See [M15 Audited Production Prop Intake](production-prop-intake.md) for exact source pins, derivation hashes, structural ceilings, and the runtime fallback contract.

### Remaining priority order

1. overhead signage only if an already approved or newly reviewed/pinnable source contains a semantically correct model that materially improves current wayfinding at the gameplay camera;
2. a true pizza oven or other specialist food-service model only if it clearly outperforms the existing stylized M13 silhouette;
3. additional kiosk/storefront modules only where gameplay-camera review shows a clear silhouette/readability benefit;
4. final gameplay-camera and representative-client performance review, then explicitly retain any remaining procedural elements that are already stronger than available production replacements.

Representative audited coverage is now established for food displays, furniture/waste, storefront/service, cold-display/vending, checkout/recycling, core food-service equipment, and commercial-lighting fixtures. These categories should grow only when gameplay-camera review demonstrates a clear benefit.

### Asset rules

- Prefer already approved Kenney sources where they satisfy the art direction.
- Add another source only after license/provenance review and manifest approval.
- Vendor or reproducibly derive only selected production assets, never a whole pack by default.
- Keep first-play download buckets and per-model structural ceilings enforced in CI.
- Every supported runtime asset below `manifest.runtimeRoot` must have an explicit manifest entry; generated-but-unmanifested assets are a CI failure.
- Prefer self-contained/shared-material assets, KTX2/Basis texture compression when larger texture sets justify it, and instancing where practical.
- Do not change collision or map topology merely to match an imported prop.
- A distribution mirror may supply pinned bytes, but the original publisher remains the provenance/license authority.

### Exit gate

M15 remains open until the remaining procedural elements are either intentionally retained or replaced, gameplay-camera review confirms a material improvement over the original targets, and the resulting High-quality arena stays within client performance/download budgets. Low and Medium must retain clean fallback behavior. Representative-hardware evidence remains part of M18 and must be considered before declaring the overall visual production pass complete.

## M16 — Final authored Food Fight chef

### Goal

Move from the KayKit-derived technical pilot to a purpose-built Food Fight character if the authored result is materially better than the procedural chef and still meets the performance contract.

### Character requirements

- unmistakable chef/food-fight silhouette at the gameplay camera;
- clean low-poly or stylized production topology suitable for eight simultaneous players;
- one reusable skeleton and a tightly grouped material/texture set;
- stable attachment points for held food and future cosmetics;
- deterministic cosmetic variation without eight unique hero downloads;
- external team ring/shape markers preserved so hue is never the only team cue.

### Required production clips

- `idle`
- `walk`
- `run`
- `throw_food`
- `dodge`
- `slip`
- `hit`
- `celebrate`
- `defeat`

The current M12 transform-layer dodge/slip reactions remain valid fallbacks; authored clips should replace them only when they improve readability and timing.

### Exit gate

The final chef passes provenance/structural audits, first-play budgets, eight-character render testing, animation/readability review, and color-vision/accessibility review. Only then should the project decide whether to make the skeletal path the default.

## M17 — Ambient arena life and environmental animation — in progress

### Goal

Make the arena feel occupied and alive without putting high-frequency motion into the combat lanes.

### Tranche 1 — merged in PR #37

The first implementation tranche deliberately animates only scene nodes that already exist:

- slowly circulating M13 west/east escalator steps, moving in opposite directions;
- restrained independent sway on the three M6 hanging wayfinding signs;
- subtle pizza-oven fire-bed and burger-grill heat-line scale cues;
- slow, out-of-phase shake-machine handle motion;
- one 30 Hz ambient update budget rather than another render-frame subscription;
- `data-arena-ambient-life="active|reduced"` diagnostics for stable browser validation;
- complete static-pose fallback when product or OS reduced motion is active.

### Tranche 2 — merged in PR #39

The second bounded tranche gives the existing vendor wall subtle operational life without introducing new assets or screen-rendering cost:

- reuses the four M6 vendor menu-board roots;
- adds slow out-of-phase horizontal scale motion to each existing accent bar and three menu-line primitives;
- caps accent motion to ±1.8 percent and menu-line motion to ±1.2 percent;
- keeps all menu work on the same 30 Hz ambient update path;
- performs no color/emissive flashing, texture swaps, material cloning, particles, lights, or render-to-texture work;
- restores exact authored scales under reduced motion;
- adds `data-arena-ambient-menu="active|reduced|unavailable"` plus unit/E2E coverage.

### Tranche 3 — merged in PR #40

The third bounded tranche adds distant visual occupancy without creating gameplay-like actors:

- adds eight High-quality-only patron silhouettes, four behind each mezzanine rail;
- uses two non-shadow-casting primitives per patron and dark/desaturated environment materials;
- introduces no team colors, team shapes, chef hats, player rings, item silhouettes, labels, textures, downloads, lights, particles, or skeletal animation;
- varies silhouette height slightly to avoid obvious duplication;
- caps root bob to ±0.025 world units and yaw sway to ±2.2 degrees;
- adds 16 root-transform updates to the 30 Hz High-quality ambient ceiling and 16 simple renderers total;
- restores exact authored positions/yaw under reduced motion;
- exposes `data-arena-ambient-crowd="active|reduced|disabled|unavailable"`, with `disabled` used when High detail is off;
- preserves the existing adaptive High-to-Low quality fallback, with deterministic E2E coverage that snapshots the High-quality crowd state before a slow headless runner can auto-demote.

See [M17 Ambient Arena Life](ambient-arena-life.md) for the complete motion/readability budget.

### Remaining candidates

- occasional peripheral service/cart motion;
- restrained environmental audio loops tied to quality/audio settings.

Do not increase crowd density before M18 representative-client evidence confirms that the current High-quality crowd/render budget is comfortably affordable.

### Rules

- Environmental animation must be slow, peripheral, and non-gameplay-signaling.
- Reduced-motion mode must suppress or simplify nonessential movement.
- No animated decoration may resemble a projectile, banana hazard, pickup, player, or objective state.
- Crowd/ambient systems need hard instance/update budgets and must disable cleanly outside their owning quality tier.
- New ambient systems should reuse the existing presentation update path unless a measured need justifies another scheduler.
- Screen/menu treatments must not flash, strobe, rapidly change hue, or use high-contrast timing that could compete with gameplay cues.
- Crowd silhouettes must remain spatially separated from combatants and may not borrow player/team identification language.

### Exit gate

M17 remains open until the arena feels materially more alive in motion while player/hazard tracking is unchanged in structured eight-player readability tests. Service motion or environmental audio, if added, must remain inside explicit update and quality-tier budgets. M18 performance evidence is required before any increase in crowd density.

## M18 — Visual validation and regression gates

### Goal

Convert visual quality from subjective approval into a repeatable shipping gate.

### Required evidence

- eight simultaneously rendered animated players on representative laptop hardware;
- frame-time p50/p95/p99 and sustained FPS by Low/Medium/High quality tier;
- draw-call, triangle, skinning, texture-memory, GPU-memory, and first-play download measurements;
- objective/player/projectile readability review with eight-player combat density;
- color-safe palette review with hue-independent team markers;
- reduced-motion review for character, VFX, camera, and environmental animation;
- screenshot/reference captures at standard desktop and representative tablet/phone viewports;
- regression checks for major art-direction landmarks and HUD overlap where automated image testing is stable enough to be useful.

### Decision gate

M18 ends with an explicit decision on:

1. procedural chef vs final skeletal chef as the default;
2. default graphics tier and adaptive-fallback thresholds;
3. which imported arena assets ship in first play vs deferred/background buckets;
4. whether the current Food Court is visually production-ready enough to justify a second arena.

## M19 — Second arena/theme kit — conditional

Only start a second arena after M18 validates the first arena's art/performance pipeline. The purpose is to prove the pipeline is reusable, not to multiply unfinished content.

A second arena should reuse the same authoritative gameplay interfaces, quality-tier model, asset audit, character system, VFX contracts, accessibility rules, and performance instrumentation. New mechanics or topology should be introduced only when they create a clearly different play pattern rather than cosmetic novelty.

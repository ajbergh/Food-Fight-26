# Visual Production Roadmap

This document extends the master roadmap with the next art-production gates after M12–M14. It is deliberately ordered so visual ambition does not outrun multiplayer readability, asset provenance, or client performance.

## Current baseline — complete through M14, M15 and M17 in progress

The repository now has a coherent presentation stack rather than a single graybox art pass:

- **M12 — reactive character animation:** procedural and skeletal character paths react to dodge and slip/stun states without changing authoritative gameplay.
- **M13 — arena hero models:** quality-gated mezzanine/escalator architecture and recognizable food-service equipment add food-court depth outside combat lanes.
- **M14 — skeletal chef model finish:** the opt-in skinned pilot receives lightweight bone-attached chef identity geometry while retaining deterministic derivation and procedural fallback.
- **M15 — audited production prop replacement:** PR #36 established the deterministic Kenney Food Kit intake/derivation path; PR #38 broadened the production set with audited furniture/waste models from Kenney Furniture Kit.
- **M17 — ambient arena life:** PR #37 established bounded escalator/sign/equipment animation; PR #39 merged bounded vendor-menu activity; PR #40 is the active High-quality-only mezzanine spectator tranche.

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

The second tranche expands representative coverage beyond food-display props:

- approves Kenney Furniture Kit as a controlled CC0 source;
- verifies a pinned official Kenney archive and internal CC0 marker;
- retrieves only selected runtime source models from an immutable mirrored revision with exact Git blob verification;
- adds audited `bench`, `chair`, `table-round`, and `trashcan` GLBs;
- places furniture/waste models only around the safe perimeter;
- replaces selected procedural perimeter-table presentation entities only after successful production-model loading;
- exposes furniture-specific runtime readiness while retaining the same High-quality lazy-load/fallback contract;
- reproduces furniture derivation in CI and the production game-client image and verifies generated files in container smoke.

See [M15 Audited Production Prop Intake](production-prop-intake.md) for the derivation and runtime contract.

### Remaining priority order

1. restaurant kiosk/storefront modules;
2. food-service equipment such as ovens, grills, dispensers, and display cases;
3. vending/recycling stations where they add recognizable perimeter detail;
4. overhead signage and lighting fixtures;
5. additional food display props only when they improve gameplay-camera recognition.

Food-display and furniture/waste representative coverage is now established; those categories should grow only when gameplay-camera review demonstrates a clear benefit.

### Asset rules

- Prefer already approved Kenney sources where they satisfy the art direction.
- Add another source only after license/provenance review and manifest approval.
- Vendor or reproducibly derive only selected production assets, never a whole pack by default.
- Keep first-play download buckets and per-model structural ceilings enforced in CI.
- Prefer self-contained/shared-material assets, KTX2/Basis texture compression when larger texture sets justify it, and instancing where practical.
- Do not change collision or map topology merely to match an imported prop.
- A distribution mirror may supply pinned bytes, but the original publisher remains the provenance/license authority.

### Exit gate

M15 remains open until the visually important Food Court replacement categories have representative audited assets, gameplay-camera review confirms a material improvement over their procedural targets, and the resulting High-quality arena stays within client performance/download budgets. Low and Medium must retain clean fallback behavior.

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

### Tranche 3 — active in PR #40

The third bounded tranche adds distant visual occupancy without creating gameplay-like actors:

- adds eight High-quality-only patron silhouettes, four behind each mezzanine rail;
- uses two non-shadow-casting primitives per patron and dark/desaturated environment materials;
- introduces no team colors, team shapes, chef hats, player rings, item silhouettes, labels, textures, downloads, lights, particles, or skeletal animation;
- varies silhouette height slightly to avoid obvious duplication;
- caps root bob to ±0.025 world units and yaw sway to ±2.2 degrees;
- adds 16 root-transform updates to the 30 Hz High-quality ambient ceiling and 16 simple renderers total;
- restores exact authored positions/yaw under reduced motion;
- exposes `data-arena-ambient-crowd="active|reduced|disabled|unavailable"`, with `disabled` used when High detail is off.

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

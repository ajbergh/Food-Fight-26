# Arena art direction

## Goal

The arena should read as a lively, premium 2026 mall food court while preserving competitive clarity. Gameplay space stays visually quieter than the perimeter so eight players, projectiles, banana hazards, pickups, and the sundae objective remain readable at the pulled-back camera.

## Visual hierarchy

1. **Players and hazards** — highest saturation and motion.
2. **Sundae objective and ownership ring** — strong central landmark.
3. **Gameplay obstacles** — readable silhouettes with simple materials.
4. **Food-court architecture** — detailed enough to establish place, but pushed toward the perimeter.
5. **Micro-props** — High-quality-only dressing that should never compete with action.

## Procedural environment foundation

The M4/M6 environment passes established:

- two-tone perimeter concourses and floor composition;
- architectural wall bays and metal columns;
- north/south restaurant fronts with service windows, menu panels, and counter displays;
- side-wall booth seating and cafe furniture;
- condiment, trash/recycling, and vending stations;
- chunky food silhouettes on counters;
- overhead Food Fight landmark signage and emissive accent strips;
- ceiling/light-card rhythm that implies a larger indoor space without adding many dynamic lights;
- proscenium, wayfinding, posters, secondary planter clusters, and a stronger objective focal hierarchy.

All environment dressing is presentation-only unless a map/collision change is explicitly reviewed separately.

## M13 hero-model layer

[PR #33](https://github.com/ajbergh/Food-Fight-26/pull/33) added a stronger architectural/modeling pass intended to define the masses that later production assets should replace.

### Medium quality

- north and south mezzanine decks;
- fascia, handrails, rail posts, and glass-panel masses;
- east and west escalator banks outside the authoritative playfield.

These pieces give the arena a clearer multi-level mall identity and stronger depth beyond the combat board.

### High quality

The south-side vendors now include recognizable food-service equipment rather than generic blocks:

- pizza oven with opening, fire bed, and chimney;
- burger griddle with extraction hood;
- shake/soft-serve machine with nozzles, handles, drip tray, and beacon.

These hero fixtures remain outside the primary combat lanes and introduce no collision or gameplay state.

## Quality tiers

- **Low:** gameplay geometry and base environment only; decorative roots remain disabled.
- **Medium:** structural restaurant fronts, primary landmark signage, mezzanine architecture, and escalator silhouettes.
- **High:** seating, floor detail, vending/condiment/waste props, food displays, lighting cards, and detailed vendor equipment.

This division is intentionally aligned with the existing `G` graphics-quality cycle and adaptive quality fallback.

## M15 production asset replacement

The current procedural pieces—including M13's hero models—are now **target footprints**, not an instruction to keep adding primitive detail indefinitely. M15 should gradually replace the most valuable placeholders with selected, audited production GLBs while keeping approximately the same visual masses and quality-tier ownership.

Priority order:

1. restaurant kiosk/storefront modules;
2. food-service equipment such as ovens, grills, dispensers, and display cases;
3. table/chair/booth set;
4. vending and waste stations;
5. food display props;
6. overhead signage and light fixtures.

Prefer shared materials, atlases, mesh instancing, and KTX2/Basis textures. Avoid importing whole asset packs merely because they are available. Kenney Food Kit is already an approved controlled source where it fits the art direction; any additional source requires explicit provenance/license review before use.

Every imported asset must pass the repository asset/provenance audit, structural budgets, first-play byte budgets, normal build/performance gates, and a visual review at the actual gameplay camera.

See [Arena hero model pass](arena-hero-model-pass.md) and [Visual production roadmap](visual-production-roadmap.md).

## Ambient animation direction — M17 candidate

Once static production assets are stable, peripheral environmental life can be introduced through slow escalator/vendor/equipment/crowd motion. This work must remain:

- peripheral rather than centered on combat lanes;
- clearly distinct from players, projectiles, pickups, hazards, and objective feedback;
- bounded by quality tier and update/instance budgets;
- suppressed or simplified by reduced-motion mode;
- easy to disable on Low quality.

## Readability rules

- Keep the central objective circle free of decorative clutter.
- Do not add floor decals that can be mistaken for banana hazards or food splats.
- Do not use team blue/red/orange as large static environmental fields near the objective.
- Decorative animation should be slow and peripheral.
- High-frequency texture detail belongs outside the main combat lanes.
- New props must be checked at actual gameplay camera distance, not only close-up.
- New upper-level or hero silhouettes must be checked for player/projectile/objective occlusion at the normal camera.
- Imported production assets must preserve authoritative map readability even when their source meshes contain more detail than the procedural targets.

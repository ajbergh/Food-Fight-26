# Arena art direction

## Goal

The arena should read as a lively, premium 2026 mall food court while preserving competitive clarity. Gameplay space stays visually quieter than the perimeter so eight players, projectiles, banana hazards, pickups, and the sundae objective remain readable at the pulled-back camera.

## Visual hierarchy

1. **Players and hazards** — highest saturation and motion.
2. **Sundae objective and ownership ring** — strong central landmark.
3. **Gameplay obstacles** — readable silhouettes with simple materials.
4. **Food-court architecture** — detailed enough to establish place, but pushed toward the perimeter.
5. **Micro-props** — high-quality-only dressing that should never compete with action.

## Current procedural detail pass

The M4 detailed-arena pass adds:

- two-tone tiled perimeter concourses and grout lines;
- architectural wall bays and metal columns;
- three south-side restaurant kiosks to balance the existing north counters;
- awnings, service windows, menu panels, and counter displays;
- side-wall booth seating;
- cafe tables with chairs;
- condiment stations, trash/recycling stations, and vending machines;
- chunky food silhouettes on counters;
- an overhead Food Fight landmark sign with emissive accent strips;
- ceiling-light cards that imply a larger indoor space without adding many dynamic lights.

All of these elements are presentation-only. They do not alter authoritative collision or map topology.

## Quality tiers

- **Low:** gameplay geometry and base environment only. Decorative M4 roots are disabled.
- **Medium:** structural restaurant fronts, wall architecture, and primary landmark signage.
- **High:** seating, floor tile detail, vending/condiment/trash props, food displays, and lighting cards.

This division is intentionally aligned with the existing `G` graphics-quality cycle.

## Production asset pass

The procedural pieces are placeholders for production GLB assets. Replace them gradually, preserving roughly the same visual masses and quality-tier ownership. Prefer shared materials, atlases, mesh instancing, and KTX2 textures. Avoid importing hundreds of unique props merely because a source pack contains them.

The first production pass should focus on five hero categories:

1. restaurant kiosk modules;
2. table/chair/booth set;
3. vending and waste stations;
4. food display props;
5. overhead signage and light fixtures.

Any imported asset must pass the repository provenance and structural-budget audit before landing.

## Readability rules

- Keep the central objective circle free of decorative clutter.
- Do not add floor decals that can be mistaken for banana hazards or food splats.
- Do not use team blue/red/orange as large static environmental fields near the objective.
- Decorative animation should be slow and peripheral.
- High-frequency texture detail belongs outside the main combat lanes.
- New props must be checked at actual gameplay camera distance, not only close-up.

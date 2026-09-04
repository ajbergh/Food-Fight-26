# M13 Arena Hero Model Pass

## Goal

Move the Food Court arena from a well-dressed graybox toward a deliberately modeled commercial space without adding combat-lane clutter or changing authoritative topology.

This pass focuses on **large, readable architectural and vendor silhouettes** rather than more small props.

## Delivered models

### Medium quality

- north and south mezzanine decks;
- rail posts, handrails, glass-panel masses, fascia, and accent strips;
- east and west escalator banks that visually connect the lower food court with the upper level.

These elements sit outside the authoritative arena and provide depth, scale, and a stronger mall-food-court identity.

### High quality

Three south-side vendors receive recognizable back-of-counter equipment:

- pizza oven with mouth, fire bed, and chimney;
- burger griddle and extraction hood;
- shake/soft-serve machine with nozzles, handles, drip tray, and beacon.

These hero fixtures replace generic visual mass with semantically readable food-service equipment while remaining outside active combat lanes.

## Quality and performance contract

- Low quality remains unchanged.
- Medium enables the architectural depth layer.
- High adds vendor equipment.
- No new dynamic lights.
- No new textures or downloadable assets.
- Decorative meshes do not cast or receive shadows.
- No authoritative collision, navigation, spawn, objective, projectile, or networking changes.
- The center objective and primary combat lanes remain visually quiet.

## Production asset migration

The new modules establish the target masses for eventual audited production GLB replacements. Future imported assets should preserve approximately the same footprints and quality-tier ownership so an asset swap does not invalidate gameplay readability.

Priority replacements remain:

1. storefront/kiosk modules;
2. escalator/mezzanine architecture;
3. food-service equipment;
4. seating and waste/vending props;
5. signage and lighting fixtures.

Every imported asset must continue to pass provenance, structural, bundle, and runtime performance gates.

## Validation

CI should verify type checking, build, performance budgets, asset audits, room benchmark, container smoke, and E2E behavior. Browser playtesting should additionally check that the added upper-level geometry does not occlude players, projectiles, or the sundae objective at the normal gameplay camera.

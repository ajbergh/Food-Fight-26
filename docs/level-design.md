# Level design

## Vertical-slice arena: Yum Yum Food Court

The first arena is a compact cafeteria/food-court space with a central sundae objective and four primary bench/platform obstacles. Decorative restaurants, tables, plants, signs, condiment stations, and service counters live mostly outside the gameplay boundary.

Current prototype data lives in `packages/maps/src/foodCourt.ts`.

## Layout principles

### Sightlines
Players should usually be able to understand where a projectile originated. Full-length unobstructed shots should exist but not dominate every approach.

### Multiple routes
Each spawn quadrant needs at least two reasonable paths toward center. Avoid a single corridor where banana traps can permanently lock access.

### Objective pressure
Cover around center should create tactical movement without letting one team hold the zone from total safety.

### Symmetry with personality
Competitive geometry should be close to rotational/mirrored fairness while art dressing can be asymmetric. If asymmetric collision matters, test win rate by spawn/team side.

### Edge safety
Players need visible boundaries and enough recovery space that accidental edge contact is not constant. Avoid tiny decorative collision shapes.

## Geometry rules

- Gameplay collision uses simplified primitives independent of detailed visual meshes.
- Small props are either non-colliding or grouped into clear blockers.
- Keep walkable ramps/steps visually obvious.
- Every hazard/pickup spawn must have a stable authored ID for telemetry.

## Spawn rules

- Eight start points, four per side/team.
- Initial spawn should not permit an immediate unavoidable projectile hit.
- Respawn points may be selected from team-safe candidates with enemy-proximity checks.

## Art dressing

Gameplay floor is medium/low contrast. Critical objects receive higher saturation, outline/rim-light treatment, animation, and predictable iconography. Sauce/crumb clutter is capped per screen region and fades aggressively.

## Future arena families

- Supermarket produce section.
- Restaurant kitchen/service line.
- Mall food court.
- School cafeteria.
- Outdoor food festival.

Each family should introduce one clear geometry mechanic rather than merely reskinning the same map.

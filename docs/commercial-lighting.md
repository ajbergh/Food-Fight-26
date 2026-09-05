# Commercial lighting and material grade

M9 adds a bounded client-side lighting and material-response layer to the food hall without changing collision, replication, room state, or match rules. M15 later adds authored fixture geometry on High quality while preserving the same dynamic-light ceiling.

## Lighting hierarchy

- The directional key remains the primary gameplay light.
- Medium quality keeps the pre-M9 dynamic-light count and creates separation through material response plus key/fill/objective grading.
- High quality adds only two static vendor omni fills, one warm and one cool, to separate the north food stalls.
- The existing objective and fill lights are quality-graded but remain static between quality changes.
- The two new accents never cast shadows. The directional key is the only shadow-casting light outside low quality.

## Quality contract

- `low`: new accent lights disabled, key shadows disabled, brighter ambient fill.
- `medium`: new accent lights disabled, key shadows enabled, moderate ambient contrast and the commercial material grade.
- `high`: two static vendor fills enabled, slightly stronger key/fill/objective balance and darker ambient fill. Audited M15 ceiling/wall fixture meshes may lazy-load as presentation geometry, but they do not create additional PlayCanvas light components.

The objective ring already supplies restrained motion, so M9 does not animate light intensities per frame. This keeps gameplay silhouettes and team markers stable and avoids continuously invalidating renderer light state on slower GPUs or software/headless renderers.

## Authored fixture geometry

M15 uses the approved Kenney Furniture Kit to replace the three High-quality procedural ceiling cards with `lampSquareCeiling.glb` instances and to add three matching `lampWall.glb` sconces at the vendor wall.

These models are deliberately treated as **fixtures, not lights**:

- they share the High-only lazy production-prop loader;
- they remain presentation-only and non-colliding;
- their renderers do not cast or receive shadows in this tranche;
- they add no dynamic lights, probes, post-process passes, or replicated state;
- if either model fails to load, the procedural High-detail dressing remains available as fallback and the production readiness diagnostic reports partial/fallback state.

The runtime exposes `data-production-fixtures="loading|ready|partial|fallback"` for fixture-specific diagnostics. The global `data-production-props` readiness state still covers the complete audited production set.

## Material grade

The arena shell now uses a more deliberate response split:

- floor and walls are broad/low-gloss;
- counters remain matte with restrained specular response;
- counter tops and food presentation surfaces are glossier;
- foliage is very low gloss;
- objective team/control rings are emissive as well as color coded.

The color-safe palette updates both diffuse and emissive objective-ring color.

## Performance constraints

The pass adds at most two non-shadow-casting omni lights, and both are high-only. Medium and low add no new dynamic lights. New accent-light intensities are static after quality changes. The later authored fixture meshes do not increase this light count. No textures, render targets, post-process passes, dynamic probes, per-frame light mutations, or replicated state are added by the lighting pass.

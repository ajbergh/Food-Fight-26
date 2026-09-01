# Commercial lighting and material grade

M9 adds a bounded client-side lighting and material-response layer to the food hall without changing collision, replication, room state, or match rules.

## Lighting hierarchy

- The directional key remains the primary gameplay light.
- Medium quality keeps the pre-M9 dynamic-light count and creates separation through material response plus key/fill/objective grading.
- High quality adds only two static vendor omni fills, one warm and one cool, to separate the north food stalls.
- The existing objective and fill lights are quality-graded but remain static between quality changes.
- The two new accents never cast shadows. The directional key is the only shadow-casting light outside low quality.

## Quality contract

- `low`: new accent lights disabled, key shadows disabled, brighter ambient fill.
- `medium`: new accent lights disabled, key shadows enabled, moderate ambient contrast and the commercial material grade.
- `high`: two static vendor fills enabled, slightly stronger key/fill/objective balance and darker ambient fill.

The objective ring already supplies restrained motion, so M9 does not animate light intensities per frame. This keeps gameplay silhouettes and team markers stable and avoids continuously invalidating renderer light state on slower GPUs or software/headless renderers.

## Material grade

The arena shell now uses a more deliberate response split:

- floor and walls are broad/low-gloss;
- counters remain matte with restrained specular response;
- counter tops and food presentation surfaces are glossier;
- foliage is very low gloss;
- objective team/control rings are emissive as well as color coded.

The color-safe palette updates both diffuse and emissive objective-ring color.

## Performance constraints

The pass adds at most two non-shadow-casting omni lights, and both are high-only. Medium and low add no new dynamic lights. New accent-light intensities are static after quality changes. No textures, render targets, post-process passes, dynamic probes, per-frame light mutations, or replicated state are added.

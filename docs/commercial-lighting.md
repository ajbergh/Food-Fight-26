# Commercial lighting and material grade

M9 adds a bounded client-side lighting layer to the food hall without changing collision, replication, room state, or match rules.

## Lighting hierarchy

- The directional key remains the primary gameplay light.
- Medium/high quality adds four static vendor omni lights to create warm/cool separation across the north food stalls.
- High quality adds two side rim lights plus four low-intensity perimeter accents for additional depth.
- The existing objective light is incorporated into the quality profile and receives a restrained pulse.
- Accent lights are static and never cast shadows. The directional key is the only shadow-casting light outside low quality.

## Quality contract

- `low`: accent lights disabled, key shadows disabled, brighter ambient fill.
- `medium`: four static vendor accents enabled, key shadows enabled, moderate ambient contrast.
- `high`: medium lights plus two rim and four corner accents, stronger key/fill/objective balance and darker ambient fill.

Only the single existing objective light animates. This keeps gameplay silhouettes and team markers stable and avoids continuously invalidating the renderer's light state.

## Material grade

The arena shell now uses a more deliberate response split:

- floor and walls are broad/low-gloss;
- counters remain matte with restrained specular response;
- counter tops and food presentation surfaces are glossier;
- foliage is very low gloss;
- objective team/control rings are emissive as well as color coded.

The color-safe palette updates both diffuse and emissive objective-ring color.

## Performance constraints

The pass adds at most ten non-shadow-casting omni lights. Four are enabled on medium and all ten on high. Low disables all of them. New accent-light intensities are static after quality changes; only the pre-existing objective light receives a shallow pulse. No textures, render targets, post-process passes, dynamic probes, or replicated state are added.

# Commercial lighting and material grade

M9 adds a bounded client-side lighting layer to the food hall without changing collision, replication, room state, or match rules.

## Lighting hierarchy

- The directional key remains the primary gameplay light.
- Medium/high quality adds four vendor omni lights plus two side rim lights to create warm/cool separation across the arena.
- High quality adds four low-intensity perimeter accents for depth at the corners.
- The existing objective light is incorporated into the quality profile and receives a restrained pulse.
- No accent light casts shadows. The directional key is the only shadow-casting light outside low quality.

## Quality contract

- `low`: accent lights disabled, key shadows disabled, brighter ambient fill.
- `medium`: vendor and rim accents enabled, key shadows enabled, moderate ambient contrast.
- `high`: medium lights plus four corner accents, stronger key/fill/objective balance and darker ambient fill.

All pulsing is deliberately shallow so gameplay silhouettes and team markers remain stable.

## Material grade

The arena shell now uses a more deliberate response split:

- floor and walls are broad/low-gloss;
- counters remain matte with restrained specular response;
- counter tops and food presentation surfaces are glossier;
- foliage is very low gloss;
- objective team/control rings are emissive as well as color coded.

The color-safe palette updates both diffuse and emissive objective-ring color.

## Performance constraints

The pass adds at most ten non-shadow-casting omni lights. Six are enabled on medium and ten on high. Low disables all of them. No textures, render targets, post-process passes, dynamic probes, or replicated state are added.

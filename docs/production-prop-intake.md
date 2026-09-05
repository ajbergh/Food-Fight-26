# M15 Audited Production Prop Intake

## Goal

M15 replaces recognizable procedural food-court dressing with controlled production assets without weakening provenance, performance, or fallback behavior.

Five production-safe implementation tranches are merged. The scoped replacement phase is complete; representative rendered-client and gameplay-camera validation is tracked separately in M18.

## Tranche 1 — Kenney Food Kit, PR #36

The first tranche proved the deterministic runtime-asset path with four counter-display props:

- `pizza`
- `pizza-box`
- `can`
- `carton`

These are presentation props, not gameplay objects. They do not change collision, pickups, projectiles, item identity, objective state, or networking.

### Source and license boundary

Kenney Food Kit remains the approved source in `assets/third-party/manifest.json`. Kenney's official Food Kit page is the license/provenance authority and identifies the pack as CC0.

The upstream download is not committed wholesale. For deterministic automation, this tranche uses a public GitHub mirror only as a byte-distribution mirror. Every mirrored source file is pinned to immutable commit `d00f54f4acd328bc2162656a09f4b78a9a1e6364` and an exact Git blob object ID before it is accepted.

The mirror does **not** replace Kenney as the asset provider or license source.

### Deterministic derivation

Run:

```bash
pnpm assets:derive:kenney-props
```

The derivation script downloads only the selected GLBs plus their shared colormap, verifies pinned Git object identities, embeds the shared PNG into self-contained runtime GLBs, structurally inspects the results, and prints deterministic SHA-256 and geometry metrics for manifest reconciliation.

## Tranche 2 — Kenney Furniture Kit perimeter furniture, PR #38

The second tranche broadened M15 beyond food-display props with a small furniture/waste set:

- `bench`
- `chair`
- `table-round`
- `trashcan`

These models are placed only around the safe perimeter. Selected imported tables replace procedural perimeter-table presentation entities after successful loading; the remaining furniture augments existing dressing without changing authoritative collision or map topology.

### Source and license boundary

Kenney Furniture Kit is approved in `assets/third-party/manifest.json` with Kenney's official Furniture Kit page as the provenance and CC0 license authority.

The derivation path verifies a pinned official Kenney archive and its internal CC0 marker. Selected runtime source GLBs are then retrieved from immutable `RetroDECK/RetroQUEST` revision `dfa19a5602a31f64bd890d15279a61f43b127328` with exact Git blob SHA-1 verification. The mirror is used only as a reproducible byte host; Kenney remains the asset and license authority, and the complete pack is never vendored into the repository.

Run:

```bash
pnpm assets:derive:kenney-furniture
```

CI performs Furniture Kit derivation before the asset audit, and the production game-client Docker build reproduces the same generated files.

## Tranche 3 — Kenney Mini Market, PR #41

The third tranche targeted larger recognizable perimeter fixtures rather than adding more small clutter:

- `service-window`
- `freezers-standing`
- `cash-register`
- `bottle-return`

The standing-freezer instances replace the existing west/east procedural vending blocks after successful loading. Bottle-return stations replace the procedural recycling blocks. The service-window module and two registers add production geometry to the vendor perimeter. All placements remain presentation-only and outside authoritative collision/topology.

For reproducible CI, only the four selected GLBs and their shared colormap are retrieved from immutable revision `2821b7fc7ba39960bc1f555bb4ebef7bc32efabc` of a public GitHub mirror. Every source file and the shared texture are pinned by exact Git blob SHA-1. Kenney remains the asset and license authority.

Measured generated outputs:

| Model | Bytes | Triangles | Primitives | Materials | Textures |
| --- | ---: | ---: | ---: | ---: | ---: |
| `service-window` | 24,316 | 146 | 2 | 2 | 1 |
| `freezers-standing` | 24,068 | 156 | 1 | 1 | 1 |
| `cash-register` | 29,060 | 203 | 1 | 1 | 1 |
| `bottle-return` | 39,744 | 324 | 1 | 1 | 1 |
| **Total** | **117,188** | **829** | **5** | **5** | **4 embedded references** |

## Tranche 4 — Kenney Furniture Kit food-service equipment, PR #42

The fourth tranche reused the already approved/pinned Furniture Kit instead of adding another dependency:

- `stove-electric`
- `hood-large`
- `blender`
- `coffee-machine`
- `microwave`

The electric stove replaces the procedural burger-grill presentation block. A production hood restores the extraction silhouette above it. Three blender instances replace the procedural shake-machine cabinet while the microwave and coffee machine add recognizable counter equipment. The stylized pizza oven remains procedural because the approved source does not contain a semantically correct pizza-oven replacement; substituting a domestic stove would reduce visual clarity.

Measured generated outputs remain texture-free and compact:

| Model | Bytes | Triangles | Primitives | Materials |
| --- | ---: | ---: | ---: | ---: |
| `stove-electric` | 18,604 | 338 | 6 | 6 |
| `hood-large` | 4,652 | 36 | 2 | 2 |
| `blender` | 18,728 | 246 | 4 | 3 |
| `coffee-machine` | 13,332 | 166 | 3 | 3 |
| `microwave` | 11,248 | 152 | 6 | 4 |
| **Total** | **66,564** | **938** | **21** | **18** |

## Tranche 5 — Kenney Furniture Kit authored commercial fixtures, PR #43

The fifth tranche replaces generic High-quality luminous cards with authored commercial-lighting silhouettes while deliberately keeping the M9 lighting budget unchanged:

- `lamp-square-ceiling`, sourced from `lampSquareCeiling.glb` pinned to Git blob `8aaf95cd620ab2b96b326012137af3e8534a2e4d`;
- `lamp-wall`, sourced from `lampWall.glb` pinned to Git blob `cc2d160260a0b7ef08e611a22013043378209898`.

Three ceiling-lamp instances replace the High-detail `ceiling-card-west`, `ceiling-card-center`, and `ceiling-card-east` procedural entities after successful loading. Three wall-lamp instances add a repeated authored fixture rhythm at the vendor wall.

The source GLBs are exceptionally small and texture-free:

| Model | Bytes | Triangles | Primitives | Materials | Textures | Animations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `lamp-square-ceiling` | 5,628 | 60 | 2 | 2 | 0 | 0 |
| `lamp-wall` | 4,828 | 42 | 2 | 2 | 0 | 0 |
| **Total** | **10,456** | **102** | **4** | **4** | **0** | **0** |

These are geometry-only fixtures. They do **not** add PlayCanvas light components, shadow casters, probes, post-processing, or per-frame lighting work. High quality therefore retains the existing M9 maximum of two additional static non-shadow-casting vendor omni fills; Medium and Low add none.

PR #43 also closed an audit gap discovered after PR #42: the five kitchen GLBs were deterministically generated and runtime-used but had not been explicitly listed in the third-party manifest. The manifest now covers the complete runtime model set, and the audit CLI fails closed when a supported runtime asset exists below `manifest.runtimeRoot` without a corresponding `manifest.assets` entry.

## Runtime policy

All M15 production models are High-quality presentation assets. They load lazily when High graphics quality is selected rather than increasing the default Medium first-play payload.

The procedural arena remains the fallback. A production model may replace its matching presentation primitive only after the container has loaded successfully. A missing or failed production asset must not remove readable arena dressing.

The runtime exposes:

- `data-production-props="loading|ready|partial|fallback"` for the complete production-prop set;
- `data-production-furniture="loading|ready|partial|fallback"` for perimeter Furniture Kit dressing;
- `data-production-mini-market="loading|ready|partial|fallback"` for Mini Market fixtures;
- `data-production-kitchen="loading|ready|partial|fallback"` for food-service equipment;
- `data-production-fixtures="loading|ready|partial|fallback"` for authored commercial-lighting fixture geometry.

All production prop renderers remain presentation-only, non-colliding, non-shadow-casting in the current tranches, outside authoritative gameplay state, and subordinate to player/hazard/projectile/objective readability.

## Asset-growth rule

M15 is not permission to import complete asset packs. Future props require an explicit visual role, an individual manifest budget, a pinned source/derivation record, and gameplay-camera review. Prefer a few recognizable silhouettes over catalog-scale dressing.

## M15 closure decisions

Representative audited coverage now exists for food displays, perimeter furniture/waste, storefront/service fixtures, cold-display/vending, checkout/recycling, core food-service equipment, and authored commercial-lighting fixtures. The final approved-source inventory was checked before closure so retained procedural elements are explicit decisions rather than forgotten placeholders.

### Intentionally retained procedural/art-directed elements

1. **Overhead wayfinding and signage.** The pinned Kenney Mini Market catalog contains no signage model, and the approved Furniture Kit GLB tree contains no semantically correct sign/board candidate. The existing M6 wayfinding remains stronger and more readable than adding an unrelated asset dependency for a weak replacement.
2. **Stylized pizza oven.** The approved Furniture Kit source contains no true pizza-oven silhouette. A domestic stove is not an acceptable semantic replacement, so the M13 oven is retained.
3. **`display-burger`, `display-lettuce`, and `display-shake`.** The pinned Food Kit runtime subset at revision `d00f54f4acd328bc2162656a09f4b78a9a1e6364` contains only `can-open`, `can-small`, `can`, `carton`, `pizza-box`, `pizza`, and the shared colormap. There is no adequate burger, lettuce, shake, sandwich, salad, or drink model in that controlled subset. These tiny counter cues therefore remain stylized procedural presentation geometry.
4. **Additional kiosk/grocery clutter.** Mini Market includes other grocery-specific models, but importing them would add catalog breadth rather than materially improve combat-camera readability. They are intentionally out of scope for M15.

**M15 implementation status:** complete. The replacement phase should not remain open merely to maximize the percentage of imported meshes. Future asset additions are playtest/readability-driven follow-ons, not M15 blockers.

## Validation gates

Every M15 implementation tranche kept these automated gates green before merge:

- exact derived SHA-256 values and structural ceilings recorded in the manifest;
- deterministic derivation in CI;
- `pnpm assets:audit` on generated outputs;
- inverse runtime-root coverage so generated-but-unmanifested supported assets fail CI;
- High-quality browser loading with procedural fallback retained;
- bundle and eight-player authoritative-room budgets;
- release-image/container smoke for generated runtime assets;
- E2E coverage for the High-quality production-prop path;
- roadmap reconciliation with delivered and retained replacement categories.

M18 owns the remaining **rendered-client** validation: representative laptop/tablet frame pacing, draw calls/geometry/skinning/texture/GPU-memory measurements, structured gameplay-camera readability/accessibility review, and the final decision that the Food Court visual stack is production-ready. Those gates may generate targeted follow-up fixes, but they do not require M15 to keep importing assets.

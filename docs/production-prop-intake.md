# M15 Audited Production Prop Intake

## Goal

M15 replaces recognizable procedural food-court dressing with controlled production assets without weakening provenance, performance, or fallback behavior.

Two production-safe tranches are merged and a third is active in PR #41.

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

The derivation script:

1. downloads only the four selected GLBs plus their shared `Textures/colormap.png`;
2. verifies every downloaded byte stream against its pinned Git blob identity;
3. embeds the shared PNG into each GLB as an internal image buffer view;
4. removes the external texture URI from the runtime model;
5. writes self-contained runtime GLBs under `apps/game-client/public/assets/third-party/kenney-food-kit/`;
6. runs the same structural glTF inspection used by the repository asset audit;
7. prints deterministic SHA-256 and geometry metrics for manifest reconciliation.

## Tranche 2 — Kenney Furniture Kit, PR #38

The second tranche broadens M15 beyond food-display props with a small furniture/waste set:

- `bench`
- `chair`
- `table-round`
- `trashcan`

These models are placed only around the safe perimeter. The imported table models replace selected procedural perimeter-table presentation entities after successful loading; the remaining furniture augments existing dressing without changing authoritative collision or map topology.

### Source and license boundary

Kenney Furniture Kit is approved in `assets/third-party/manifest.json` with Kenney's official Furniture Kit page as the provenance and CC0 license authority.

The derivation path verifies a pinned official Kenney archive and its internal CC0 marker. Selected runtime source GLBs are then retrieved from an immutable `RetroDECK/RetroQUEST` revision with exact Git blob SHA-1 verification. The mirror is used only as a reproducible byte host; Kenney remains the asset and license authority, and the complete pack is never vendored into the repository.

### Deterministic derivation

Run:

```bash
pnpm assets:derive:kenney-furniture
```

The derivation script accepts only the selected furniture GLBs, structurally inspects them, and writes generated runtime files under `apps/game-client/public/assets/third-party/kenney-furniture-kit/`. Exact source/output identities and per-model byte/geometry ceilings are recorded in the third-party manifest.

CI performs furniture derivation before the asset audit, and the production game-client Docker build reproduces the same generated files. Container smoke verifies that the generated furniture GLBs are present in the release-shaped image.

## Tranche 3 — Kenney Mini Market, PR #41

The third tranche targets larger recognizable perimeter fixtures rather than adding more small clutter:

- `service-window`
- `freezers-standing`
- `cash-register`
- `bottle-return`

The standing-freezer instances replace the existing west/east procedural vending blocks after successful loading. Bottle-return stations replace the procedural recycling blocks. The service-window module and two registers add production geometry to the north vendor perimeter. All placements remain presentation-only and outside authoritative collision/topology.

### Source and license boundary

Kenney Mini Market is approved in `assets/third-party/manifest.json`. Kenney's official Mini Market publisher page is the provenance and CC0 license authority.

For reproducible CI, only the four selected GLBs and their shared colormap are retrieved from immutable revision `2821b7fc7ba39960bc1f555bb4ebef7bc32efabc` of a public GitHub mirror. Every source file and the shared texture are pinned by exact Git blob SHA-1. Kenney remains the asset and license authority; the mirror is only a deterministic byte host and the complete pack is not vendored.

### Deterministic derivation and measured budget

Run:

```bash
pnpm assets:derive:kenney-mini-market
```

The derivation script verifies source identities, embeds the shared colormap into self-contained runtime GLBs, structurally inspects each result, and writes only the four selected files under `apps/game-client/public/assets/third-party/kenney-mini-market/`.

Measured generated outputs are deliberately small:

| Model | Bytes | Triangles | Primitives | Materials | Textures |
| --- | ---: | ---: | ---: | ---: | ---: |
| `service-window` | 24,316 | 146 | 2 | 2 | 1 |
| `freezers-standing` | 24,068 | 156 | 1 | 1 | 1 |
| `cash-register` | 29,060 | 203 | 1 | 1 | 1 |
| `bottle-return` | 39,744 | 324 | 1 | 1 | 1 |
| **Total** | **117,188** | **829** | **5** | **5** | **4 embedded references** |

Exact SHA-256 outputs and hard per-model structural ceilings are recorded in the third-party manifest. CI, the production game-client Docker build, and container smoke all reproduce/verify the same four runtime files.

## Runtime policy

All M15 production models are High-quality presentation assets. They load lazily when High graphics quality is selected rather than increasing the default Medium first-play payload.

The procedural arena remains the fallback. A production model may replace its matching presentation primitive only after the container has loaded successfully. A missing or failed production asset must not remove readable arena dressing.

The runtime exposes:

- `data-production-props="loading|ready|partial|fallback"` for the complete production-prop set;
- `data-production-furniture="loading|ready|partial|fallback"` for the Furniture Kit tranche;
- `data-production-mini-market="loading|ready|partial|fallback"` for the Mini Market fixture tranche.

All production prop renderers remain:

- presentation-only;
- non-colliding;
- non-shadow-casting in the current tranches;
- outside authoritative gameplay state;
- subordinate to player, hazard, projectile, and objective readability.

## Asset-growth rule

M15 is not permission to import complete asset packs. Future props require an explicit visual role, an individual manifest budget, a pinned source/derivation record, and gameplay-camera review. Prefer a few recognizable silhouettes over catalog-scale dressing.

## Remaining M15 coverage

Food-display, furniture/waste, storefront/service, cold-display/vending, and recycling now have representative audited production coverage. The highest-priority remaining replacement categories are:

1. actual food-service equipment such as ovens, grills, fryers, dispensers, and display cases where a suitably licensed production source materially improves the M13 procedural equipment;
2. overhead signage and lighting fixtures;
3. additional kiosk/storefront modules only where gameplay-camera review shows a meaningful silhouette/readability improvement;
4. additional food or furniture props only when a specific visual gap justifies them.

M15 remains open until those visually important categories have enough representative production coverage, gameplay-camera review demonstrates a material improvement over their procedural targets, and High quality remains within client performance/download budgets while Low and Medium retain clean fallbacks.

## Validation gates

Every M15 tranche must keep these gates green:

- exact derived SHA-256 values and structural ceilings recorded in the manifest;
- deterministic derivation in CI;
- `pnpm assets:audit` on generated outputs;
- High-quality browser loading with procedural fallback retained;
- bundle and eight-player room budgets;
- release-image/container smoke for generated runtime assets;
- E2E coverage for the High-quality production-prop path;
- roadmap reconciliation with delivered and remaining replacement categories.

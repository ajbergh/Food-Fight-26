# M15 Audited Production Prop Intake

## Goal

M15 begins replacing recognizable procedural food-court dressing with controlled production assets without weakening provenance, performance, or fallback behavior.

The first tranche deliberately stays small. It uses four Kenney Food Kit props:

- `pizza`
- `pizza-box`
- `can`
- `carton`

These are counter-display props, not gameplay objects. They do not change collision, pickups, projectiles, item identity, objective state, or networking.

## Source and license boundary

Kenney Food Kit remains the approved source in `assets/third-party/manifest.json`. Kenney's official Food Kit page is the license/provenance authority and identifies the pack as CC0.

The upstream download is not committed wholesale. For deterministic automation, this tranche uses a public GitHub mirror only as a byte-distribution mirror. Every mirrored source file is pinned to immutable commit `d00f54f4acd328bc2162656a09f4b78a9a1e6364` and an exact Git blob object ID before it is accepted.

The mirror does **not** replace Kenney as the asset provider or license source.

## Deterministic derivation

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

The output directory is generated content. CI recreates it before `pnpm assets:audit`; release/staging builds therefore do not depend on a developer's local asset cache.

## Runtime policy

The production models are High-quality presentation assets. They should load lazily when High graphics quality is selected rather than increasing the default Medium first-play payload.

The procedural arena remains the fallback. A production model may replace its matching presentation primitive only after the container has loaded successfully. A missing or failed production asset must not remove readable arena dressing.

All production prop renderers remain:

- presentation-only;
- non-colliding;
- non-shadow-casting in this tranche;
- outside authoritative gameplay state;
- subordinate to player, hazard, projectile, and objective readability.

## Asset-growth rule

M15 is not permission to import the full Kenney pack. Future props require an explicit visual role, an individual manifest budget, a pinned source/derivation record, and gameplay-camera review. Prefer a few recognizable silhouettes over catalog-scale dressing.

## Validation gates

Before this tranche can be marked complete:

- exact derived SHA-256 values and structural ceilings are recorded in the manifest;
- `pnpm assets:derive:kenney-props` is reproducible in CI;
- `pnpm assets:audit` passes on the generated outputs;
- High-quality browser loading succeeds with procedural fallback retained;
- bundle and eight-player room budgets remain green;
- E2E covers the High-quality production-prop path;
- the roadmap is updated with the actual M15 delivered scope and remaining replacement categories.

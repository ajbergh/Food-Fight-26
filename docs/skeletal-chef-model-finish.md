# M14 Skeletal Chef Model Finish

## Goal

Push the opt-in skeletal character pilot toward an unmistakable **Food Fight chef** silhouette without replacing the audited KayKit-derived runtime GLB or weakening the procedural fallback.

The M11 pilot deliberately proved asset provenance, deterministic derivation, runtime loading, animation mapping, and fallback behavior first. M14 adds a small runtime model-finish layer on top of that foundation.

## Delivered character-model finish

The skeletal adapter now searches the instantiated hierarchy for common head and torso attachment nodes and, when available, attaches lightweight chef identity geometry directly to the animated hierarchy.

### Headwear

A chef toque is assembled from a low-cost band and puffed crown. Three deterministic proportions are selected from the session id:

- classic;
- tall toque;
- compact toque.

The variation changes silhouette without creating additional downloadable character assets.

### Apron

When an upper-spine/chest attachment is available, the pilot receives:

- a warm-white apron bib;
- a neutral warm waist band;
- a dark apron pocket.

The finish is intentionally team-neutral. Team identity continues to come from the existing ring and geometric team marker so color-safe behavior remains independent from cosmetic materials.

## Attachment behavior

Attachment lookup prefers exact hierarchy names and then falls back to partial matches for common skeletal naming conventions such as `head`, `DEF-head`, `upperchest`, and `spine.006`.

If an expected attachment is not present, the finish degrades gracefully instead of rejecting the pilot. The base skeletal model remains functional and the procedural chef remains the load-failure fallback.

## Performance contract

- No new downloads or binary assets.
- No textures.
- No dynamic lights.
- No shadow casting/receiving on added pieces.
- At most a handful of simple primitives per skeletal character.
- No authoritative movement, collision, combat, protocol, prediction, or reconciliation changes.

## Validation

Automated tests cover deterministic finish selection and exact/partial hierarchy-node lookup. CI should continue to run type checking, tests, asset audits, build, bundle budgets, room benchmark, container smoke, and E2E coverage.

A browser validation pass remains required before default-enabling the skeletal model. It should specifically verify:

1. toque placement through idle, walk, run, throw, dodge, and slip;
2. apron orientation through torso motion;
3. eight-character silhouette readability;
4. no clipping severe enough to distract at the gameplay camera;
5. acceptable client frame pacing on representative hardware.

## Remaining production gate

M14 makes the pilot read more clearly as a chef, but it does **not** declare the KayKit derivative the final shipping character. A final authored Food Fight chef mesh and authored `throw_food`/results reactions may still replace this pilot after the production art direction is locked.

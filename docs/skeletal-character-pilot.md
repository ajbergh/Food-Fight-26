# M11 Skeletal character pilot

M11 establishes the production-rig gate before any binary character replaces the authored procedural chef. The runtime remains safe by default: the procedural chef is still the shipped character, and the skeletal loader is opt-in until a reviewed, optimized KayKit-derived pilot is committed and passes every budget.

## Approved source and scope

The approved source is `kaykit-adventurers` from `assets/third-party/manifest.json` (CC0-1.0). Import **one** optimized character derivative first. Do not vendor the complete upstream pack.

Target runtime path:

`apps/game-client/public/assets/third-party/kaykit-adventurers/chef-pilot.glb`

The client loader uses the matching public URL:

`/assets/third-party/kaykit-adventurers/chef-pilot.glb`

The pilot remains explicitly opt-in with `?skeletalPilot=1`; normal sessions must not request this asset until the binary import is approved and the fallback/instancing integration is complete.

## Canonical clip contract

The optimized derivative must expose at least one skin and these named clips:

- `idle`
- `walk`
- `run`
- `throw_food`

Hyphens and whitespace normalize to underscores for audit/runtime matching, but the exported derivative should use the canonical names above. Later production expansion should add `dodge`, `slip`, `hit`, `celebrate`, and `defeat` without weakening the first four required clips.

The third-party asset audit now supports an optional model-level contract:

```json
{
  "skeletal": {
    "minSkins": 1,
    "requiredAnimations": ["idle", "walk", "run", "throw_food"]
  }
}
```

When the real pilot is added to the manifest, this contract must be present on its model entry. The audit reads glTF/GLB animation names directly and fails closed when a required clip or skin is missing.

## Runtime adapter

`apps/game-client/src/skeletalPilot.ts` provides the bounded loader/adapter for the eventual binary:

- one shared container load promise prevents per-player downloads;
- the GLB render hierarchy is instantiated per player from the shared container resource;
- a PlayCanvas `anim` state graph is created for the four canonical clips;
- `throw_food` is non-looping while locomotion clips loop;
- failed load, missing render hierarchy, missing clips, or missing animation tracks reject the pilot instead of removing the procedural fallback.

The adapter is intentionally not enabled in the player presentation path yet because the binary asset is not committed. Enabling a model that has not passed provenance, structure, budget, and eight-player validation would turn a development experiment into an uncontrolled first-play dependency.

## Binary import checklist

1. Import one KayKit Adventurers character into Blender.
2. Remove weapons, fantasy accessories, unused meshes, and duplicate materials.
3. Adjust the silhouette toward the existing Food Fight chef target while retaining a shared humanoid skeleton.
4. Retain/retarget only the first-play clips needed for the pilot and rename them to the canonical contract.
5. Author or retarget `throw_food` so the release frame aligns with authoritative projectile creation.
6. Keep the primary character around 15k–30k rendered triangles and a small material count.
7. Prefer one compact atlas; downsample aggressively at the gameplay camera before adding texture detail.
8. Export a self-contained GLB, then add its exact SHA-256, byte ceiling, structural ceilings, character budget bucket, and skeletal contract to the third-party manifest.
9. Run `pnpm assets:audit`, `pnpm check`, `pnpm test`, `pnpm build`, the eight-player room benchmark, staging container smoke, and browser E2E.
10. Only after those gates pass, wire the opt-in instance into `createCharacterVisual`, verify eight simultaneous animated players, then consider making the skeletal path the default.

## Non-negotiable gameplay boundary

The skeletal hierarchy is presentation only. Authoritative movement, collision, dodge/stun rules, projectile creation, reconciliation, team ownership, and room state stay exactly where they are today. Team rings and team-shape markers remain outside the replaceable character render hierarchy so color-safe and non-color cues survive both the procedural and skeletal paths.

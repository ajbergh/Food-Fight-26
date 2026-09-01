# M11 Skeletal character pilot

M11 establishes the production-rig gate and an opt-in binary pilot before any skeletal character replaces the authored procedural chef by default. The runtime remains safe by default: normal sessions still ship the procedural chef, while `?skeletalPilot=1` exercises the audited KayKit-derived pilot with automatic procedural fallback.

## Approved source and scope

The approved source is `kaykit-adventurers` from `assets/third-party/manifest.json` (CC0-1.0). The pilot derives only the upstream `Mage.glb` at pinned revision `672074b73ba276876a19e8816ecdc5241817ab47`; the complete pack is not vendored.

`pnpm assets:derive:kaykit-pilot` downloads that exact source, verifies its SHA-256, removes the detachable spellbook, wand, staff, fantasy hat, and cape render nodes, selects four animations, and writes a deterministic runtime GLB. The remaining skinned tunic character is an integration/performance pilot, not a claim that the final chef silhouette is authored.

Target runtime path:

`apps/game-client/public/assets/third-party/kaykit-adventurers/chef-pilot.glb`

The client loader uses the matching public URL:

`/assets/third-party/kaykit-adventurers/chef-pilot.glb`

The pilot remains explicitly opt-in with `?skeletalPilot=1`; normal sessions do not request this asset.

## Canonical clip contract

The optimized derivative must expose at least one skin and these named clips:

- `idle`
- `walk`
- `run`
- `throw_food`

The deterministic derivative maps upstream `Idle`, `Walking_A`, `Running_A`, and `Throw` to the canonical names above. Hyphens and whitespace normalize to underscores for audit/runtime matching. Later production expansion should add `dodge`, `slip`, `hit`, `celebrate`, and `defeat` without weakening the first four required clips.

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

`apps/game-client/src/skeletalPilot.ts` and `apps/game-client/src/skeletalCharacterVisual.ts` provide the bounded loader/adapter for the pilot:

- one shared container load promise prevents per-player downloads;
- the GLB render hierarchy is instantiated per player from the shared container resource;
- a PlayCanvas `anim` state graph is created for the four canonical clips;
- `throw_food` is non-looping while locomotion clips loop;
- failed load, missing render hierarchy, missing clips, missing animation tracks, or an incomplete animation graph reject the pilot instead of removing the procedural fallback;
- locomotion drives `idle`, `walk`, and `run`, while authoritative projectile ownership triggers `throw_food`;
- player scale changes are compensated so floor contact remains stable through normal, dodge, and stun presentation;
- the procedural chef is created first and hidden only after the skeletal hierarchy and animation graph are ready.

The adapter is wired only behind `?skeletalPilot=1`. The HTML `data-skeletal-pilot` diagnostic reports `loading`, `ready`, or `fallback`, and browser E2E verifies a ready pilot can still perform authoritative combat input without console errors.

## Completed pilot intake

- Self-contained 2.70 MB GLB generated from a source-pinned, SHA-verified upstream file.
- 5,683 triangles, 12 primitives, one material, one texture, one skin, and four canonical animation clips.
- Exact runtime SHA-256, byte/structure ceilings, character bucket, and skeletal contract recorded in the third-party manifest.
- Asset/provenance audit and a real-browser opt-in load/animation/combat path.
- Procedural fallback, external team rings, and hue-independent team markers preserved.

## Remaining before default enablement

1. Author the final Food Fight chef silhouette and remove the remaining fantasy costume language; the current tunic mesh is only a technical pilot.
2. Author or retarget a Food Fight-specific `throw_food` clip whose release frame matches the presentation event.
3. Validate eight simultaneously rendered animated pilots and record frame pacing, draw calls, skinning cost, GPU memory, and download behavior on target laptops/tablets.
4. Add any required production clips (`dodge`, `slip`, `hit`, results) and formal readability/color-vision review.
5. Only after those gates pass should the skeletal path be considered for default enablement.

## Non-negotiable gameplay boundary

The skeletal hierarchy is presentation only. Authoritative movement, collision, dodge/stun rules, projectile creation, reconciliation, team ownership, and room state stay exactly where they are today. Team rings and team-shape markers remain outside the replaceable character render hierarchy so color-safe and non-color cues survive both the procedural and skeletal paths.

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

The deterministic derivative maps upstream `Idle`, `Walking_A`, `Running_A`, and `Throw` to the canonical names above. Hyphens and whitespace normalize to underscores for audit/runtime matching.

The third-party asset audit supports the model-level contract:

```json
{
  "skeletal": {
    "minSkins": 1,
    "requiredAnimations": ["idle", "walk", "run", "throw_food"]
  }
}
```

The committed pilot entry carries this contract. The audit reads glTF/GLB animation names directly and fails closed when a required clip or skin is missing.

A future authored production rig may add `dodge`, `slip`, `hit`, `celebrate`, and `defeat`; those additions must not weaken the four canonical first-play clips.

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

## M12 reactive animation extension

[PR #32](https://github.com/ajbergh/Food-Fight-26/pull/32) added presentation-only dodge and slip/stun reactions to the skeletal adapter without changing the GLB contract.

The adapter derives a bounded secondary transform pose from the same authoritative root presentation already used by the live client. This means the pilot now reacts through:

- crouch and silhouette compression during dodge;
- controlled torso pitch/roll;
- slip/stun wobble and recovery posture;
- floor-contact compensation while action poses are active.

These transforms are intentionally fallback-capable. A final authored rig may supply dedicated `dodge` and `slip` clips later, but only if those clips improve readability and timing at the gameplay camera.

## M14 chef identity extension

[PR #34](https://github.com/ajbergh/Food-Fight-26/pull/34) moved the pilot closer to the Food Fight art direction without replacing the audited binary asset.

The runtime now searches the instantiated skeletal hierarchy for common head and torso attachment nodes. When available it attaches lightweight, non-shadow-casting chef identity pieces:

- deterministic classic, tall, or compact toque proportions;
- apron bib;
- waist band;
- apron pocket.

Attachment lookup prefers exact hierarchy names and then falls back to common partial skeletal names. Missing attachments degrade gracefully rather than making the pilot fail. Cosmetic finish colors remain team-neutral; external team rings and hue-independent team shapes continue to own team readability and color-safe behavior.

This is a model-finish layer, not a declaration that the underlying KayKit-derived tunic mesh is the final shipping character.

## Reproducing and checking the pilot

Run `pnpm assets:derive:kaykit-pilot` to download the pinned upstream source, verify its source digest, and regenerate the committed GLB. It must reproduce SHA-256 `1aefbeb86218be4dacf89775894a2db3faf2bf6ec11ddfa7ad90591de770cdcf`.

Then run `pnpm assets:audit` to verify provenance, byte/structure budgets, and the skeletal contract. Use `?skeletalPilot=1` in a local game-client session to exercise the opt-in path; a session without that query parameter must keep the procedural chef and avoid requesting the binary asset.

## Completed pilot intake

- Self-contained 2.70 MB GLB generated from a source-pinned, SHA-verified upstream file.
- 5,683 triangles, 12 primitives, one material, one texture, one skin, and four canonical animation clips.
- Exact runtime SHA-256, byte/structure ceilings, character bucket, and skeletal contract recorded in the third-party manifest.
- Asset/provenance audit and a real-browser opt-in load/animation/combat path.
- Presentation fallback for dodge/slip through M12.
- Lightweight hierarchy-attached chef identity finish through M14.
- Procedural fallback, external team rings, and hue-independent team markers preserved.

## Remaining before default enablement

1. Decide whether the project should author a purpose-built Food Fight chef mesh or retain the procedural chef as the shipping default. M14 improves identity but does not fully remove the underlying pilot costume language.
2. If the skeletal path advances, author or retarget a Food Fight-specific `throw_food` clip whose release frame matches the authoritative presentation event, plus `hit`, `celebrate`, and `defeat` as required.
3. Treat M12's transform-layer `dodge` and `slip` reactions as valid production fallbacks; replace them with authored clips only when the result is measurably clearer.
4. Validate eight simultaneously rendered animated characters and record client frame pacing, draw calls, skinning cost, texture/GPU memory, and first-play download behavior on representative laptops/tablets.
5. Complete formal combat-readability, color-vision, reduced-motion, and clipping review before considering default enablement.

The automated eight-player authoritative-room benchmark is already part of CI and is treated as passing for current roadmap planning. It is not a substitute for the rendered-client graphics/performance measurements above.

## Non-negotiable gameplay boundary

The skeletal hierarchy is presentation only. Authoritative movement, collision, dodge/stun rules, projectile creation, reconciliation, team ownership, and room state stay exactly where they are today. Team rings and team-shape markers remain outside the replaceable character render hierarchy so color-safe and non-color cues survive both the procedural and skeletal paths.

# M7 Character Production Pass

## Goal

Raise player readability and personality at the default multiplayer camera while keeping the authoritative capsule, prediction, reconciliation, and server simulation unchanged.

## Procedural chef baseline

The procedural chef remains the guaranteed local fallback and still carries a large share of the shipping art language:

- layered chef coat, shirt front, lapels, apron and belt;
- cuffs, ears, brows, mouth, facial expression and headwear detail;
- stronger shoes and running foot articulation;
- animated scarf response during locomotion;
- throw anticipation/release squash-and-stretch;
- visible held tomato/banana presentation props with release timing;
- deterministic body, hair and headwear variation per session.

M12 extended this path with bounded dodge and slip/stun posing through torso/head/scarf/limb/facial reaction and controlled squash/stretch. This keeps the game visually coherent even if the final skeletal path is never enabled by default.

## Approved skeletal source and current pilot

`KayKit Character Pack: Adventurers 1.0` is an approved CC0 source in the third-party manifest.

Upstream evidence reviewed on 2026-09-01:

- official repository: `KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0`;
- upstream tree/commit: `672074b73ba276876a19e8816ecdc5241817ab47`;
- `LICENSE.txt` explicitly states Creative Commons Zero (CC0) and commercial use;
- README documents rigged low-poly characters with 75 animations and GLTF/FBX delivery;
- upstream character GLBs are roughly 3.6 MB each before project-specific optimization.

PR #30 added a deterministic 2.70 MB derivative of the pinned upstream Mage GLB with detachable fantasy accessories removed and only `idle`, `walk`, `run`, and `throw_food` retained. It is source-pinned and audited, remains opt-in behind `?skeletalPilot=1`, and keeps the procedural chef as fallback. The existing 10 MiB character first-play budget remains authoritative.

## M12 animation extension

[PR #32](https://github.com/ajbergh/Food-Fight-26/pull/32) added a shared presentation-only action layer for both character paths:

- dodge crouch/lean/roll and silhouette compression;
- slip/stun wobble and recovery posture;
- bounded limb and facial reactions on the procedural chef;
- transform-layer fallback on the skeletal pilot without expanding the required GLB clip set.

The transform-layer reactions are considered valid production fallbacks. Future authored `dodge` or `slip` clips should replace them only when the result is clearer at gameplay distance.

## M14 model-finish extension

[PR #34](https://github.com/ajbergh/Food-Fight-26/pull/34) added a lightweight chef identity layer to the opt-in skeletal pilot:

- deterministic classic, tall, or compact toque proportions;
- animated-hierarchy head attachment where a compatible node is found;
- apron bib, waist band, and pocket attached to a compatible upper torso/spine node;
- exact-name attachment lookup with partial-name fallback;
- graceful degradation when expected attachment nodes are absent;
- team-neutral cosmetic finish so team rings and hue-independent team shapes remain the stable readability system.

M14 improves the pilot silhouette without adding another downloaded model or claiming that the underlying KayKit-derived mesh is the final Food Fight chef.

## Default-character acceptance criteria

Before replacing the procedural chef as the default, a skeletal pilot or final authored successor must:

1. pass third-party provenance and structural GLB audits;
2. fit inside the character first-play budget after optimization;
3. expose stable `idle`, `walk`, `run`, and `throw_food` clips;
4. provide an acceptable Food Fight throw release and required hit/results motion;
5. preserve external team-shape markers and color-safe palette treatment;
6. instantiate and animate efficiently for eight simultaneous rendered players;
7. fall back to the procedural chef when the model cannot load;
8. leave authoritative collision, combat, prediction, reconciliation, and networking untouched;
9. pass gameplay-camera clipping/readability review across locomotion, throw, dodge, slip, and results states;
10. pass reduced-motion and color-vision review before default enablement.

The automated eight-player room benchmark is treated as passing for current roadmap planning. The client-render gate above is separate: it must measure frame pacing, draw calls, skinning cost, texture/GPU memory, and download behavior with eight animated characters actually on screen.

## M16 final authored chef path

If the project determines the current pilot cannot reach the required Food Fight identity cleanly, M16 should produce one purpose-built reusable chef rig rather than accumulating more adapter geometry around the pilot.

Target production clips:

- `idle`;
- `walk`;
- `run`;
- `throw_food`;
- `dodge`;
- `slip`;
- `hit`;
- `celebrate`;
- `defeat`.

Recommended pipeline:

1. define the final chef silhouette and gameplay-camera proportion sheet;
2. create one reusable rig and stable held-food/cosmetic attachment points;
3. keep material/texture groups tightly bounded and atlas where practical;
4. retain only first-play-required animation data;
5. compress textures to KTX2/Basis and evaluate mesh compression only after browser compatibility testing;
6. preserve M12 transform reactions as fallback where authored clips are absent or inferior;
7. run `pnpm assets:audit`, build/bundle budgets, room benchmark, browser E2E, and eight-rendered-character profiling;
8. default-enable only after readability/accessibility/performance evidence supports the switch.

## Performance principle

Character quality should come primarily from silhouette, animation, timing, material grouping, and strong poses rather than per-player draw-call explosion. A single reusable rig with deterministic cosmetic variation is preferable to eight independently downloaded hero models.

See [Skeletal character pilot](skeletal-character-pilot.md), [Skeletal chef model finish](skeletal-chef-model-finish.md), [Reactive character animation](reactive-character-animation.md), and [Visual production roadmap](visual-production-roadmap.md).

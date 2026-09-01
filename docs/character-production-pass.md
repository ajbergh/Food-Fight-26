# M7 Character Production Pass

## Goal

Raise player readability and personality at the default multiplayer camera while keeping the authoritative capsule, prediction, reconciliation, and server simulation unchanged.

## Current authored character pass

The procedural chef presentation remains the guaranteed local fallback and now carries more of the final art language:

- layered chef coat, shirt front, lapels, apron and belt
- cuffs, ears, brows, mouth, extra facial expression and hat detail
- stronger shoes and running foot articulation
- animated scarf response during locomotion
- throw anticipation / release squash-and-stretch
- visible held tomato / banana presentation props with release timing
- deterministic body, hair and headwear variation per session

This keeps the game shippable without blocking on a binary character import and gives the eventual skeletal asset a precise presentation target.

## Approved production source candidate

`KayKit Character Pack: Adventurers 1.0` is now an approved CC0 source in the third-party manifest.

Upstream evidence reviewed on 2026-09-01:

- official repository: `KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0`
- upstream tree/commit observed: `672074b73ba276876a19e8816ecdc5241817ab47`
- `LICENSE.txt` explicitly states Creative Commons Zero (CC0) and commercial use
- README documents rigged, low-poly characters with 75 animations and GLTF/FBX delivery
- upstream character GLBs are roughly 3.6 MB each before project-specific optimization

The initial production import should therefore use **one** optimized character GLB as a rig/animation pilot rather than shipping the entire upstream character set. The existing 10 MiB character first-play budget remains authoritative.

## Skeletal-pilot acceptance criteria

Before replacing the fallback character at runtime, the pilot must:

1. pass the third-party asset audit and structural GLB budgets;
2. fit inside the character first-play budget after optimization;
3. expose stable clips for idle, walk and run;
4. provide an acceptable Food Fight throw clip or support a project-authored upper-body throw layer;
5. preserve team-shape markers and color-safe palette treatment;
6. instantiate efficiently for eight simultaneous players;
7. fall back to the authored procedural chef when the model cannot load;
8. leave authoritative collision and networking untouched.

## Recommended optimization pipeline

1. import one upstream GLB into Blender;
2. remove unused accessories and duplicate materials;
3. customize the silhouette toward the Food Fight chef art direction;
4. retain only required locomotion/action clips for first play;
5. author or retarget `throw_food`, `slip`, `dodge`, `hit`, `celebrate`, and `defeat` as needed;
6. export GLB with one material atlas where practical;
7. compress textures to KTX2/Basis and evaluate mesh compression only after browser compatibility testing;
8. run `pnpm assets:audit`, bundle budgets, eight-player benchmark and browser E2E before enabling by default.

## Performance principle

Character quality should come primarily from silhouette, animation, timing and material grouping rather than per-player draw-call explosion. A single reusable rig with deterministic cosmetic variation is preferable to eight independently downloaded hero models.

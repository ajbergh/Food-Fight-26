# Performance budgets

Performance is a design feature because startup and low-friction browser access are core product promises.

## First-play download

Initial aspiration (compressed transfer):

| Category | Budget |
|---|---:|
| HTML/JS/WASM | <= 5 MB |
| First arena | <= 10 MB |
| Required character content | <= 10 MB |
| Initial audio | <= 5 MB |
| Other initial textures/assets | <= 10 MB |
| **Target first-play total** | **20–35 MB preferred; 40 MB hard review threshold** |

Cosmetics, alternate maps, and nonessential audio stream after first interaction.

## Frame targets

Tier 1 desktop: stable 60 fps at common laptop resolutions on medium settings.

High-end: support higher refresh where practical without changing gameplay simulation.

Low quality: prioritize stable frame pacing over visual parity.

## CPU budgets

At 60 fps the total frame is 16.67 ms. Avoid spending the entire budget; leave browser/OS variance margin. Profile separately:

- simulation/input;
- animation;
- render preparation;
- network/state application;
- UI layout;
- GPU time.

## GPU priorities

Watch:

- draw calls;
- shadow casters;
- transparent particles/overdraw;
- post-processing passes;
- texture memory;
- render resolution;
- repeated material state changes.

Use instancing for repeated bananas, food pickups, benches/props where beneficial.

## Memory

Establish device-specific limits through real browser profiling. Texture compression is mandatory for production. Dispose streamed assets and transient VFX deterministically; browser tabs that grow without bound are a release blocker.

## Server budget

A 30 Hz room has ~33 ms tick interval, but normal simulation work should consume a small fraction of that to support many rooms/process and absorb GC/network jitter. Record p50/p95/p99 tick duration.

## Network budget

Measure before fixing a hard number. The design intent is tens of KB/s per player rather than hundreds. Compact semantic events and Colyseus delta state should keep eight-player matches inexpensive.

## Quality scaling order

When reducing quality:

1. particle density;
2. shadow resolution/distance/caster count;
3. AO/bloom/post effects;
4. render scale;
5. environment detail/LOD.

Never remove critical projectile shadows/telegraphs or player-identification cues before decorative effects.

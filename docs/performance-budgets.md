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

## Automated client build gates

The production game-client build has an intentionally tighter code-only regression gate before large production assets arrive. CI runs `pnpm perf:budget` after `pnpm build` and fails when any of these thresholds are exceeded:

| Measurement | CI budget |
|---|---:|
| Largest JavaScript bundle, raw | <= 2.75 MB |
| Largest JavaScript bundle, gzip estimate | <= 700 kB |
| Initial HTML/CSS/JS/WASM, gzip estimate | <= 900 kB |

The checker lives in `tools/perf-budget`. It measures the files emitted by `apps/game-client/dist`, uses deterministic gzip level 9 as a repository-local transfer-size estimate, prints the result to the build log, and appends the same report to the GitHub Actions step summary when available.

These are regression thresholds, not targets to consume. A budget increase requires an explicit performance review explaining why code splitting, lazy loading, dependency reduction, or a cheaper implementation is not appropriate. Asset budgets remain separate because compressed textures, models, and audio need format-aware accounting rather than generic gzip estimates.

For a local check:

```bash
pnpm build
pnpm perf:budget
```

## Automated third-party asset gates

The third-party provenance manifest in `assets/third-party/manifest.json` carries first-play byte ceilings that mirror the asset portions of the download budget:

| First-play third-party bucket | Audit ceiling |
|---|---:|
| Arena | <= 10 MiB |
| Characters | <= 10 MiB |
| Audio | <= 5 MiB |
| Other | <= 10 MiB |
| **Total third-party runtime assets** | **<= 40 MiB hard review threshold** |

CI runs `pnpm assets:audit` before the production build. The audit counts the committed runtime file size for assets marked `firstPlay: true`, which is intentionally conservative for already-compressed GLB/KTX2/audio derivatives. It also requires each runtime derivative to declare a per-file `maxBytes` ceiling and matching SHA-256 digest, so a replaced asset cannot silently grow or change provenance.

These buckets do not grant an extra 40 MiB on top of the overall first-play target. They are guardrails for third-party content entering the repository; final first-play accounting still includes code, first-party art, maps, UI, and audio together.

For a local check:

```bash
pnpm assets:audit
```

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

A 30 Hz room has ~33 ms tick interval, but normal simulation work should consume a small fraction of that to support many rooms/process and absorb GC/network jitter.

The game server measures the authoritative simulation callback directly. Each active room emits a structured `room_tick_perf` JSON event after roughly 60 seconds of valid tick samples with `samples`, `tickBudgetMs`, `p50Ms`, `p95Ms`, `p99Ms`, and `maxMs`. Percentiles use nearest-rank semantics so operational dashboards and local logs can compare the same values. `TICK_METRICS_REPORT_MS` may shorten the reporting window for controlled diagnostics; production should normally retain the 60-second default.

CI runs `pnpm benchmark:room` after the production build. That benchmark launches an isolated server, fills one room with eight protocol-level clients, drives continuous gameplay input for 10 seconds, and requests 2-second telemetry windows. The run fails if the room cannot populate or if usable tick telemetry is not produced. It reports worst observed p50/p95/p99/max values plus p99 as a percentage of the authoritative tick interval.

The hosted-run timing numbers are **not** a hard release threshold because shared CI hardware is noisy. Use benchmark history for regression investigation, then establish warning/critical thresholds from staging data on known machine classes. The design target remains for p99 simulation work to stay comfortably below the full tick interval.

For a local load sample:

```bash
pnpm build
pnpm benchmark:room
```

Longer diagnostic runs can use `LOAD_BENCHMARK_SECONDS` and `LOAD_BENCHMARK_REPORT_MS` without changing production defaults.

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

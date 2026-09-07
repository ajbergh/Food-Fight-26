# M18 Visual Validation Harness

PR #48 establishes the first M18 validation tranche: an opt-in browser measurement harness for collecting repeatable rendered-client evidence on representative hardware.

The harness is instrumentation, not evidence by itself. CI and headless Playwright validate only that the report contract works. Numbers produced by GitHub-hosted runners, virtual machines, headless Chromium, background tabs, or otherwise non-representative environments must not be used to declare the Food Court production-ready.

## Why this exists

The existing HUD performance readout is useful during play, but it intentionally shows a smoothed near-instantaneous FPS/frame-time value. M18 needs a durable comparison surface for:

- Low, Medium, and High graphics tiers;
- the default procedural chef and opt-in skeletal pilot;
- eight simultaneously rendered players;
- representative Windows, macOS, and tablet-class hardware;
- reduced-motion and color-safe presentation checks;
- before/after graphics changes.

The harness therefore records a bounded frame-time window and exposes a machine-readable summary without adding a visible benchmark overlay that could perturb the measurement.

## Enablement

Add `visualValidation=1` to the game-client URL.

Recommended representative-device run:

```text
?visualValidation=1&visualValidationPlayers=8&visualValidationWarmupMs=5000&visualValidationMs=30000&visualValidationQuality=medium&visualValidationLabel=win-laptop-medium-procedural-run1
```

To measure the skeletal pilot with the same contract, add the existing opt-in flag:

```text
?skeletalPilot=1&visualValidation=1&visualValidationPlayers=8&visualValidationWarmupMs=5000&visualValidationMs=30000&visualValidationQuality=medium&visualValidationLabel=win-laptop-medium-skeletal-run1
```

Supported harness parameters:

| Parameter | Default | Bounds / values | Purpose |
| --- | ---: | --- | --- |
| `visualValidation` | off | `1` enables | Keeps normal play completely outside the benchmark path. |
| `visualValidationPlayers` | any known population | integer 1–8 | Waits for the requested rendered-player count before warm-up and invalidates if it is not maintained. Use `8` for M18 acceptance runs. |
| `visualValidationWarmupMs` | 2000 | 0–10000 ms | Allows shaders/assets/runtime state to settle after the room population is ready. |
| `visualValidationMs` | 15000 | 500–120000 ms | Controls the measured requestAnimationFrame window. |
| `visualValidationMinSamples` | 10 | integer 1–120 | Changes the minimum valid RAF sample count. This exists for CI/plumbing diagnostics only. **Omit it for M18 acceptance runs so the default remains 10.** |
| `visualValidationQuality` | current tier | `low`, `medium`, `high` | Requests a tier once before warm-up; adaptive fallback remains authoritative afterward. |
| `visualValidationLabel` | empty | sanitized, 80 characters | Human-readable device/tier/path/run identifier. |

For M18 acceptance runs, use a **5-second warm-up and 30-second sample**, do not set `visualValidationMinSamples`, and require the resulting report to show `minimumFrameSamples: 10` unless a later ADR changes the standard.

## Report surface

When enabled, the root `<html>` element progresses through:

- `data-visual-validation="waiting-players"` while the room population is unknown or below/above an explicitly required count;
- `data-visual-validation="warming"` after the population gate is satisfied;
- `data-visual-validation="collecting"` during the measured window;
- `data-visual-validation="ready"` for a valid completed run;
- `data-visual-validation="invalid"` when a trustworthiness guard is violated.

`data-visual-validation-reasons` is `pending` while a run is active, `none` for a valid completed run, or a comma-separated set of invalidation reasons for a rejected run. This root diagnostic exists so browser/CI failures can identify the exact guard without opening the JavaScript report object first.

A completed report is published at:

```js
window.__foodfightVisualValidation
```

The report includes:

- validity and invalid-reason list;
- warm-up/sample duration;
- configured minimum frame-sample requirement and actual sample count;
- measured FPS;
- frame-time p50, p95, p99, and worst frame;
- viewport width/height and DPR;
- browser-reported hardware concurrency and device-memory hint where available;
- requested graphics tier plus graphics tier at sample start and finish;
- procedural/skeletal character path at sample start and finish plus a final convenience alias;
- required player count, player count at sample start and finish, plus a final convenience alias;
- reduced-motion state;
- team-palette state;
- sanitized run label and capture timestamp.

To copy a report from browser developer tools, evaluate:

```js
copy(JSON.stringify(window.__foodfightVisualValidation, null, 2))
```

If the browser does not provide the DevTools `copy()` helper, evaluate `JSON.stringify(window.__foodfightVisualValidation, null, 2)` and copy the returned value.

## Trustworthiness guards

The harness waits for a known live room population before beginning warm-up. When `visualValidationPlayers` is supplied, it waits until that exact count is present.

A report is marked invalid when:

- the document becomes hidden during the measured window, including an interval in which `requestAnimationFrame` is paused by the browser;
- the requested graphics tier cannot survive the warm-up;
- the graphics tier changes during the measured window, including an adaptive-quality fallback;
- the procedural/skeletal character path changes during the measured window;
- an explicitly required player count is not maintained throughout the measured window;
- reduced-motion or team-palette settings change during the measured window;
- viewport size or DPR changes during the measured window;
- fewer than the configured minimum valid frame samples are recorded.

The default minimum is 10. A representative-device M18 result with `minimumFrameSamples` below 10 is not acceptance evidence, even if `valid` is true. The override is deliberately serialized into the report so CI/plumbing runs cannot be mistaken for normal M18 captures.

An invalid run should be retained only as diagnostic evidence. It must be repeated before comparing tiers or character paths.

The harness intentionally does **not** disable adaptive quality. `visualValidationQuality` is applied once before warm-up. If High cannot remain High on a device under the current production workload, the run is invalid rather than the benchmark repeatedly forcing High back on. That failure is evidence M18 needs to see.

## Representative-device procedure

For each device under review:

1. Record the physical device model, CPU/SoC, GPU, RAM, OS version, browser/version, display resolution, browser viewport, power mode, and whether the device is plugged in.
2. Close unrelated high-load applications and avoid OS updates, screen recording, remote-desktop capture, or background GPU workloads during the measured window.
3. Start the normal release-shaped client/server stack. For local development, `pnpm dev` starts the web, game-client, game-server, and platform API; `pnpm bots` starts the existing bot harness.
4. Use `visualValidationPlayers=8`. The harness will remain in `waiting-players` until the room reaches **8/8**, then it begins the warm-up. M18 is specifically concerned with eight simultaneously rendered characters; the server-only eight-client benchmark is a separate gate and is not a substitute.
5. Do **not** set `visualValidationMinSamples`; confirm the completed report records `minimumFrameSamples: 10`. A lower value identifies a plumbing/diagnostic run rather than acceptance evidence.
6. Confirm the intended character path and requested graphics tier before accepting the result. A tier/path transition during sampling invalidates the report.
7. Run at least **three valid 30-second samples** for each required configuration. Use distinct `visualValidationLabel` values ending in `run1`, `run2`, and `run3`.
8. Save the JSON reports with the hardware notes and screenshots/reference captures from the same build.
9. Repeat any run marked invalid rather than averaging it into the comparison.

## Minimum M18 comparison matrix

At minimum, the current Food Court should collect representative evidence for:

- procedural chef: Low, Medium, High;
- skeletal pilot: Medium and High on the same hardware used for the procedural comparison;
- default and color-safe palettes at eight-player density for readability review;
- normal and reduced-motion modes for presentation review;
- standard desktop plus representative laptop/tablet viewports.

A future authored skeletal chef must be measured with the same matrix before it can replace the procedural chef as the default.

## Reading the numbers

Frame-time percentiles are the primary frame-pacing signal:

- p50 describes the typical rendered frame;
- p95 surfaces recurring slow frames;
- p99 surfaces tail latency/jank;
- worst frame is diagnostic and should not be used alone to accept or reject a build;
- FPS is useful for orientation but must be interpreted with the percentile distribution.

M18 should compare repeated runs and investigate material regressions rather than promoting one unusually good sample. Final thresholds/default-tier decisions belong in the M18 evidence record after representative hardware data exists; this harness deliberately does not manufacture acceptance thresholds before that evidence is collected.

## CI contract

Unit tests validate percentile ordering, invalid-sample filtering, empty windows, and bounded query durations. GitHub-hosted headless Chromium can render so slowly under CI contention that a short plumbing probe may produce fewer than 10 RAF callbacks even when the harness state machine is correct. Browser E2E therefore uses a short 3-second measurement window with `visualValidationMinSamples=1` to prove only that:

- the harness activates only when requested;
- it waits for a known live room population;
- the report becomes machine-readable;
- at least one valid frame sample is captured;
- frame-time percentile fields are coherent for the captured samples;
- tier start/end metadata is coherent;
- the default character path and player-count metadata are exposed;
- an explicit requested tier and required rendered-player count are honored in the valid report contract;
- the report explicitly records `minimumFrameSamples: 1`, preventing the CI result from being confused with default M18 evidence;
- completed runs expose `data-visual-validation-reasons="none"` or the exact comma-separated invalidation reason set.

**Headless CI values are plumbing diagnostics only and must not be copied into the M18 representative-device evidence table. A result is eligible for M18 acceptance only when `minimumFrameSamples` is 10, the physical-device procedure is followed, and the other acceptance conditions are met.**

## M18 status after PR #48

PR #48 makes representative visual validation repeatable, but M18 remains **in progress** until the physical-device evidence is actually collected and reviewed. The remaining M18 decision gate still includes:

- representative hardware frame-time and sustained-FPS evidence;
- eight-player draw-call/triangle/skinning/texture/GPU-memory investigation where browser/engine tooling permits;
- combat readability and color-vision review;
- reduced-motion review;
- screenshot/reference captures;
- default procedural-vs-skeletal character decision;
- default graphics tier/adaptive-fallback decision;
- first-play asset inventory decision;
- Food Court production-readiness decision before M19 begins.

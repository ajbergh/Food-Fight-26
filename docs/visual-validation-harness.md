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
?visualValidation=1&visualValidationWarmupMs=5000&visualValidationMs=30000&visualValidationQuality=medium&visualValidationLabel=win-laptop-medium-procedural-run1
```

To measure the skeletal pilot with the same contract, add the existing opt-in flag:

```text
?skeletalPilot=1&visualValidation=1&visualValidationWarmupMs=5000&visualValidationMs=30000&visualValidationQuality=medium&visualValidationLabel=win-laptop-medium-skeletal-run1
```

Supported harness parameters:

| Parameter | Default | Bounds / values | Purpose |
| --- | ---: | --- | --- |
| `visualValidation` | off | `1` enables | Keeps normal play completely outside the benchmark path. |
| `visualValidationWarmupMs` | 2000 | 0–10000 ms | Allows shaders/assets/runtime state to settle before sampling. |
| `visualValidationMs` | 15000 | 500–120000 ms | Controls the measured requestAnimationFrame window. |
| `visualValidationQuality` | current tier | `low`, `medium`, `high` | Requests a repeatable tier before warm-up. |
| `visualValidationLabel` | empty | sanitized, 80 characters | Human-readable device/tier/path/run identifier. |

For M18 acceptance runs, use a **5-second warm-up and 30-second sample** unless a later ADR changes the standard.

## Report surface

When enabled, the root `<html>` element progresses through:

- `data-visual-validation="warming"`
- `data-visual-validation="collecting"`
- `data-visual-validation="ready"` for a valid completed run
- `data-visual-validation="invalid"` when a trustworthiness guard is violated

A completed report is published at:

```js
window.__foodfightVisualValidation
```

The report includes:

- validity and invalid-reason list;
- warm-up/sample duration;
- sample count;
- measured FPS;
- frame-time p50, p95, p99, and worst frame;
- viewport width/height and DPR;
- browser-reported hardware concurrency and device-memory hint where available;
- graphics tier at the start and end of the sample;
- procedural/skeletal character path;
- visible player count parsed from live network diagnostics;
- reduced-motion state;
- team-palette state;
- sanitized run label and capture timestamp.

To copy a report from browser developer tools, evaluate:

```js
copy(JSON.stringify(window.__foodfightVisualValidation, null, 2))
```

If the browser does not provide the DevTools `copy()` helper, evaluate `JSON.stringify(window.__foodfightVisualValidation, null, 2)` and copy the returned value.

## Trustworthiness guards

A report is marked invalid when:

- the document becomes hidden during the measured window;
- the graphics tier differs between sample start and finish, including an adaptive-quality fallback;
- fewer than 10 valid frame samples are recorded.

An invalid run should be retained only as diagnostic evidence. It must be repeated before comparing tiers or character paths.

The harness intentionally does **not** disable adaptive quality. If High cannot remain High on a device under the current production workload, that is evidence M18 needs to see rather than behavior the benchmark should mask.

## Representative-device procedure

For each device under review:

1. Record the physical device model, CPU/SoC, GPU, RAM, OS version, browser/version, display resolution, browser viewport, power mode, and whether the device is plugged in.
2. Close unrelated high-load applications and avoid OS updates, screen recording, remote-desktop capture, or background GPU workloads during the measured window.
3. Start the normal release-shaped client/server stack. For local development, `pnpm dev` starts the web, game-client, game-server, and platform API; `pnpm bots` starts the existing bot harness.
4. Populate the room to **8/8** before the measured window. M18 is specifically concerned with eight simultaneously rendered characters; the server-only eight-client benchmark is a separate gate and is not a substitute.
5. Confirm the intended character path and graphics tier before accepting the result.
6. Run at least **three valid 30-second samples** for each required configuration. Use distinct `visualValidationLabel` values ending in `run1`, `run2`, and `run3`.
7. Save the JSON reports with the hardware notes and screenshots/reference captures from the same build.
8. Repeat any run marked invalid rather than averaging it into the comparison.

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

Unit tests validate percentile ordering, invalid-sample filtering, empty windows, and bounded query durations. Browser E2E runs a deliberately short sample to prove that:

- the harness activates only when requested;
- the report becomes machine-readable;
- frame-time percentiles remain ordered;
- tier start/end metadata is coherent;
- the default character path and player-count metadata are exposed.

**Headless CI values are plumbing diagnostics only and must not be copied into the M18 representative-device evidence table.**

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

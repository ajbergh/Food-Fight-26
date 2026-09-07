# M18 Render Resource Instrumentation

PR #50 adds render-resource evidence alongside the M18 frame-time harness introduced in PR #48.

The purpose is to answer a different question from FPS/frame pacing: **what is the renderer doing while that measured window is running?** The report is aligned to the same `visualValidation` collection interval so performance and renderer-cost evidence can be retained together.

## Enablement

The instrumentation activates automatically whenever the existing visual-validation harness is enabled:

```text
?visualValidation=1&visualValidationPlayers=8&visualValidationWarmupMs=5000&visualValidationMs=30000&visualValidationQuality=medium&visualValidationLabel=win-laptop-medium-procedural-run1
```

It can also be inspected independently with:

```text
?renderStats=1
```

For M18 acceptance work, prefer the first form so the renderer samples and frame-time report refer to the same bounded run.

## Report surface

A completed or live report is published at:

```js
window.__foodfightRenderResources
```

The root `<html>` element exposes:

- `data-render-resource-stats="waiting|collecting|ready|invalid|unavailable"`;
- `data-render-resource-detailed="available|unavailable"` after a report is published.

When coupled to `visualValidation`, the resource sampler clears its previous samples when the validation state enters `collecting`, samples every 100 ms, and finalizes when the validation run becomes `ready` or `invalid`.

## Always-available/basic metrics

The normal PlayCanvas application statistics surface provides:

- total draw calls per frame;
- texture VRAM bytes;
- geometry VRAM bytes (vertex + index buffers);
- other buffer VRAM bytes;
- total tracked VRAM bytes;
- graphics-device type where exposed by the engine.

The report summarizes draw calls as p50, p95, and maximum across the aligned window and records maximum VRAM values observed during that window.

These counters are renderer bookkeeping and browser/engine estimates. They are useful for comparing builds and tiers, but they are not a hardware-vendor GPU-memory profiler and should not be described as exact physical GPU residency.

## Profiler-build-only metrics

Current PlayCanvas detailed statistics are populated only by the engine profiler build. When that detailed surface is active, the report additionally records:

- rendered triangles p50/p95/max;
- skinned draw calls p50/p95/max.

The report contains `detailedStatsAvailable` and a `detailedMetricsNote`. If the current engine build does not populate detailed counters, triangle and skinning fields are **`null`**. They are never emitted as zero merely to make the schema numeric.

This distinction matters because a normal production build with many visible triangles can legitimately leave profiler-only counters at their initialized zero values.

## Physical-device procedure

For each PR #48 representative-device run:

1. Use the normal M18 requirement of eight rendered players, a 5-second warm-up, a 30-second sample, and the default `minimumFrameSamples: 10`.
2. Save both `window.__foodfightVisualValidation` and `window.__foodfightRenderResources` from the same run label.
3. Retain Low/Medium/High comparisons on the same device and browser before comparing across devices.
4. Repeat at least three valid runs per required configuration.
5. If `detailedStatsAvailable` is false, keep the basic draw-call/VRAM report and record triangle/skinning evidence from a controlled profiler build as a separate comparison. Do not substitute zeros.
6. Treat any resource report with `phase: "invalid"` as diagnostic only when its paired visual-validation run was invalid.

## Interpretation

Use these metrics primarily for comparative decisions:

- **draw calls:** identify quality-tier or asset changes that materially increase submission cost;
- **triangles:** compare geometry cost only when detailed stats are actually available;
- **skinned draw calls:** compare procedural vs skeletal character paths when profiler counters are available;
- **VRAM:** detect meaningful texture/geometry/buffer growth and first-play asset pressure.

A single counter should not decide M18. Frame pacing, renderer cost, download size, gameplay readability, accessibility, and actual physical-device behavior all contribute to the final default-character/default-tier decision.

## CI contract

CI verifies only that:

- the renderer sampler activates with the visual-validation harness;
- it aligns to the same collecting/completed state transition;
- at least one resource sample is captured;
- draw-call percentiles are ordered and nonzero for the rendered scene;
- VRAM fields are nonnegative;
- profiler-only fields are either populated consistently or remain null consistently.

As with PR #48 and PR #49, **GitHub-hosted headless values are plumbing diagnostics, not representative M18 shipping evidence**.

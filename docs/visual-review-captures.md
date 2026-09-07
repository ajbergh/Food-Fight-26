# M18 CI Visual Review Captures

PR #49 adds a small Playwright capture matrix that produces screenshots and adjacent runtime metadata for human visual review in CI.

These artifacts are deliberately **not** screenshot-baseline tests and are **not** representative-device M18 evidence. They exist to make common presentation states easy to inspect from every validated build without making nondeterministic 3D pixels a brittle automated oracle.

## Capture matrix

The current matrix is intentionally compact:

| Capture | Viewport | Character path | Palette | Motion |
| --- | ---: | --- | --- | --- |
| `desktop-procedural-medium-default` | 1440×900 | procedural | default | full |
| `desktop-skeletal-medium-default` | 1440×900 | skeletal pilot | default | full |
| `tablet-procedural-medium-color-safe` | 1024×768 | procedural | color-safe | full |
| `phone-procedural-medium-reduced-color-safe` | 390×844 | procedural | color-safe | reduced |

All captures use the normal Medium graphics tier. Medium is stable enough for structural review on hosted headless Chromium and reflects the current default presentation contract. High-quality production-prop cost and density remain part of the representative-device procedure in [M18 Visual Validation Harness](visual-validation-harness.md); the capture job does not force High back on when a headless renderer cannot sustain it.

## What each case writes

Each case creates two ignored build artifacts under `artifacts/visual-review/`:

- `<case>.png` — current viewport screenshot;
- `<case>.json` — capture provenance and live runtime diagnostics.

The JSON contains:

- schema version and capture timestamp;
- `GITHUB_SHA` when running in CI;
- the requested viewport/presentation case;
- network, live performance-label, and graphics-label text;
- HUD scale, reduced-motion, and team-palette state;
- procedural-chef and skeletal-pilot readiness;
- ambient-life/menu/crowd/service diagnostics;
- production-prop/furniture/fixture/mini-market/kitchen readiness where applicable;
- explicit `representativeHardware: false` and `acceptanceEvidence: false` markers.

Those markers are part of the artifact contract. A CI screenshot or metadata file must never be copied into the representative-hardware evidence set as if it satisfied M18 performance or eight-player density requirements.

## CI behavior

`pnpm test:e2e` creates the captures as part of the existing single-worker browser suite. The CI workflow then uploads `artifacts/visual-review/` as the `visual-review-captures` artifact with 14-day retention.

The upload uses `if: always()` so completed captures remain available when a later browser assertion fails. Missing capture output does not hide the underlying test failure: the Playwright test itself still fails when a requested presentation state cannot be reached.

## Automated assertions vs human review

Automation verifies only the state required to make a useful capture:

- client is online and the match reaches `playing`;
- graphics tier is Medium;
- procedural chef finish is ready;
- skeletal pilot is ready when that case requests it;
- requested palette state is active;
- requested reduced-motion state is active.

The PNG itself is not compared against a committed baseline. There is intentionally no `toHaveScreenshot()` threshold in this tranche.

Human review should use the captures to look for issues such as:

- HUD overlap, clipping, unsafe-area problems, or inaccessible settings controls;
- missing/incorrect character path;
- obvious team-marker or color-safe-palette regressions;
- reduced-motion state that still contains distracting nonessential movement cues;
- severe framing/composition regressions at standard desktop, tablet, or phone dimensions;
- missing major arena presentation layers visible at Medium quality.

## Limitations

These captures are single-client, headless Chromium renders on hosted CI hardware. They do not establish:

- eight-player combat readability;
- Low/High tier frame pacing;
- physical Windows/macOS/tablet GPU behavior;
- draw calls, skinning cost, GPU memory, or device thermals;
- first-play network/download experience on a real client;
- subjective animation quality under live human play.

Those remain M18 representative-device and playtest gates.

## M18 status after PR #49

PR #49 closes the repeatable **CI visual-review artifact** gap, not M18 itself. M18 remains open for physical-device performance evidence, eight-player readability/accessibility review, render-resource measurements, final procedural-vs-skeletal selection, default graphics-tier/adaptive-fallback decisions, first-play asset inventory, and the Food Court production-readiness decision before M19 begins.

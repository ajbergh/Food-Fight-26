# M18 Physical-Hardware Evidence and Acceptance Report

Issue [#51](https://github.com/ajbergh/Food-Fight-26/issues/51) remains the acceptance checklist. No headless CI measurement may substitute for physical-hardware results.

## Record a paired report

1. Deploy one immutable SHA-tagged build and record its full **40-character SHA**. Do not mix revisions in a comparison set.
2. On a physical Windows, macOS, or tablet-class client, record exact device model, CPU, GPU, RAM, OS, browser, and power mode. Choose `platform` as `windows`, `macos`, or `tablet`.
3. Connect **eight rendered players**, use `visualValidationPlayers=8&visualValidationWarmupMs=5000&visualValidationMs=30000`, and omit `visualValidationMinSamples`.
4. Run procedural Low, Medium, High and skeletal Medium, High, three valid samples each, with labels ending `run1`, `run2`, `run3`. Save each paired report as a separate `.json` file.
5. In browser DevTools, evaluate:

```js
copy(JSON.stringify({
  revision: "REPLACE_WITH_40_CHARACTER_GIT_SHA",
  device: {
    platform: "windows",
    id: "unique-hardware-id",
    model: "manufacturer and model",
    cpu: "CPU or SoC",
    gpu: "GPU model",
    ram: "RAM capacity",
    os: "OS/version",
    browser: "browser/version",
    powerMode: "plugged in/high performance"
  },
  visual: window.__foodfightVisualValidation,
  resources: window.__foodfightRenderResources
}, null, 2))
```

6. Save the copied text as a JSON file in a local private evidence directory. Retain screenshots/hardware notes separately. Do not commit personally identifying device information to this public repository.
7. Generate the report with:

```bash
node scripts/m18-report.mjs /path/to/evidence > m18-measurements.md
```

The command returns nonzero if data is missing or invalid. It rejects CI-shortened measurement windows, runs with missing players, unstable quality/character paths, invalid renderer pairing, nonrepresentative missing device metadata, duplicate run slots, and mixed immutable revisions. It explicitly reports missing three-run configurations instead of manufacturing pass/fail benchmarks.

Run unit checks: `pnpm test:m18`.

## Human signoff still required

The machine-readable report is **not** a shipping gate by itself. Review combat and objective readability at eight-player density, team color-safe markers, reduced-motion behavior, desktop/tablet layout, CI reference captures, first-play asset network inventory and physical-memory trends. Record final decisions for default character, default tier/fallback behavior, deferred assets, and whether M19 should begin. Capture the reviewer, SHA, and disposition in issue #51.

## Known limits

Measurements are valid only when the original in-browser harness marks them valid. This script does not prove the computer is physical, cannot independently verify hardware metadata, and intentionally avoids declaring target FPS thresholds without representative data. Profiler-only triangles/skinned-draw calls remain unavailable where the engine report declares them unavailable.

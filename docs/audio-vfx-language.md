# Audio and VFX language

## Goal

Food Fight 26 should sound and react like a fast arcade toy: short, exaggerated, readable cues that communicate game state without turning an eight-player match into continuous noise.

The current browser prototype synthesizes temporary Web Audio cues at runtime. These are design placeholders, not final production audio, but they establish timing, pitch contour, layering, and accessibility behavior before committing to an external SFX library or bespoke recordings.

## Action cues

### Tomato throw

- Fast broadband whoosh plus a short downward-pitch body tone.
- Target duration: roughly 100 ms.
- Visual partner: very brief red peripheral flash.

### Banana deploy

- Two small pitched notes with a cartoon "placed" cadence.
- Must remain distinguishable from tomato impacts.
- Visual partner: short yellow peripheral cue.

### Dodge

- Rising filtered sweep.
- Avoid long tails because dodge can happen frequently across eight players.
- Visual partner: cool-blue peripheral cue and existing squash/stretch pose.

## Match-state cues

Round start uses a compact ascending three-note cadence. Overtime uses a repeated urgent descending signal. Objective acquisition uses an upward two-note confirmation. Round finish uses a slightly longer major-shape cadence.

These cues should remain understandable at low volume and when multiple world effects are playing.

## Mix priorities

1. local player confirmation;
2. round/objective state;
3. incoming or received impact warnings;
4. remote combat actions;
5. ambience/music.

Future spatial audio should attenuate remote actions aggressively. UI and critical match-state cues remain non-spatial.

## Accessibility

- `M` or the HUD audio control toggles prototype audio and persists the preference locally.
- Visual action feedback exists alongside action audio.
- `prefers-reduced-motion: reduce` disables the short peripheral flash animation and removes HUD transition motion.
- Do not encode team ownership in pitch or color alone; text and objective state remain present.

## Performance instrumentation

The client now exposes a lightweight smoothed FPS/frame-time indicator. This is intentionally separate from authoritative network diagnostics. During M4 art iteration, record both render performance and network patch rate when evaluating effects or asset replacements.

Performance acceptance remains defined by `performance-budgets.md`; an attractive effect that damages combat readability or target-device frame pacing should be reduced or removed.

## Production replacement plan

When final audio is selected, preserve the established cue lengths and hierarchy first. Prefer CC0/permissive sources or bespoke work with clear provenance. Any incorporated external files must follow the asset intake and third-party notice policies documented under `docs/research/` and `asset-pipeline.md`.

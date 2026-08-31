# ADR 0003 — PlayCanvas renderer

**Status:** Accepted for prototype; review after M3 profiling.

## Context

The game needs stylized 3D, animation, particles, glTF assets, browser performance, and WebGPU/WebGL compatibility without assembling every subsystem directly on top of a low-level renderer.

## Decision

Use PlayCanvas for the game client renderer/runtime.

## Alternatives considered

- Three.js: excellent renderer/ecosystem but would require more game-engine assembly.
- Babylon.js: strong browser engine and credible fallback choice.
- Unity/Unreal web export: higher runtime/download friction relative to the browser-native product goal.

## Consequences

- Browser-focused runtime and asset pipeline.
- Engine APIs become a project dependency; isolate game rules from engine code.
- Reassess only from measured blocking issues, not preference churn.

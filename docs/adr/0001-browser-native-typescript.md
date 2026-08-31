# ADR 0001 — Browser-native TypeScript stack

**Status:** Accepted

## Context

The product promise is link-based multiplayer with fast startup and deep integration with normal web account/lobby systems. Shipping a large native-engine WebAssembly export would add download/runtime complexity and make the browser a secondary target.

## Decision

Use TypeScript as the primary language and browser-native libraries/tooling. React/Vite handles application UI; dedicated game/render/network packages handle real-time play.

## Consequences

Positive:

- one language across most client/server/shared code;
- straightforward browser debugging/deployment;
- small, streamable web bundles;
- natural DOM accessibility for lobby/HUD surfaces.

Tradeoffs:

- fewer turnkey game-editor workflows than Unity/Unreal;
- team must build some game-specific tooling;
- browser/device differences require explicit QA.

# ADR 0004 — Custom arcade physics first

**Status:** Accepted

## Context

Core gameplay is planar movement, simple obstacles, thrown projectiles, and readable hazards. A universal rigid-body simulation would introduce unnecessary determinism/network-prediction complexity.

## Decision

Implement players and baseline projectiles with simple custom arcade math/collision. Introduce Rapier selectively for rolling/bouncing/dynamic props only when a concrete mechanic requires it.

## Consequences

- Easier tuning and network prediction.
- Gameplay remains intentionally non-physical where that improves feel.
- Team owns collision edge cases and must test them.
- Selective physics integration may require careful boundary between authored and simulated bodies.

# ADR 0002 — Server-authoritative multiplayer

**Status:** Accepted

## Context

The client is downloadable JavaScript and therefore fully inspectable/modifiable. Peer authority would make movement, hits, inventory, and score trivial to manipulate and complicate host migration/NAT behavior.

## Decision

All competitive outcomes are owned by regional dedicated match servers. Clients send input/intents and use prediction/interpolation for responsiveness.

## Consequences

- Common browser cheating cannot directly set outcomes.
- Match behavior is centrally reproducible/observable.
- Hosting has ongoing server cost.
- Prediction/reconciliation increases implementation complexity.
- Region placement and latency monitoring become product concerns.

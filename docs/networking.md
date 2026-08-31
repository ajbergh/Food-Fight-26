# Networking design

## Goals

- Eight-player online matches feel immediate on ordinary broadband/Wi-Fi.
- Server owns competitive truth.
- Network bandwidth remains small enough for browsers/mobile hotspots.
- Visual extravagance does not multiply network traffic.

## Transport

Start with secure WebSockets through Colyseus. WebRTC can be investigated later only if a measured problem justifies added NAT/security/operational complexity.

## Tick rates

Initial targets:

- server simulation: 30 Hz;
- client simulation/input sampling: 60 Hz;
- state delivery: approximately 20 Hz, adaptive if needed;
- rendering: display cadence, target 60–120 fps.

These are profiling defaults, not invariants.

## Authority

Client sends **intent/input**, not trusted outcomes.

Client may request:

- movement axes;
- aim vector;
- throw pressed/released;
- dodge/interact intent.

Server decides:

- valid position;
- collision result;
- inventory;
- projectile spawn;
- hit;
- crowd-control state;
- score;
- respawn;
- match result.

## Local prediction

The local player applies movement immediately using the same movement rules as the server. Inputs carry monotonically increasing sequence numbers. Server snapshots acknowledge processed input. Client replays any newer local inputs after correcting to authoritative state.

Correction should be visually softened for small error but snapped when error becomes large enough that smoothing would misrepresent collision/gameplay.

## Remote interpolation

Remote entities are rendered from a short buffered timeline rather than extrapolated indefinitely. Interpolate position/rotation between received authoritative samples. Short controlled extrapolation may be used under minor packet delay; cap it aggressively.

## Projectiles

For baseline tomatoes:

- client immediately plays throw windup/release;
- server validates cooldown/ownership and creates authoritative projectile;
- client may spawn a predicted visual projectile keyed by input sequence;
- authoritative projectile replaces/reconciles predicted visual;
- hit event produces local VFX/audio from a compact event, not synchronized particles.

## VFX are local

Network events communicate semantic results, e.g. `tomatoHit(position,target,itemId)`. Each client generates splats, screen shake, fragments, audio, squash animation, and UI locally. The server never tracks individual particles.

## Lag handling

Initial latency strategy:

- movement collision uses current authoritative simulation;
- projectile hit testing may introduce limited rewind/lag compensation after playtesting;
- never allow clients to submit arbitrary hit timestamps without validation;
- display a network warning when sustained latency/jitter materially harms play.

## Reconnect

Prototype: if disconnected, attempt short reconnect to the same room if session support allows; otherwise return player to lobby with a clear status. Do not build complex mid-match migration before retention justifies it.

## Bandwidth telemetry

Measure per match:

- inbound/outbound bytes per client;
- snapshots/s and message sizes;
- input frequency;
- correction magnitude;
- RTT/jitter;
- disconnect/reconnect frequency.

# Backend and data

## Service split

### Match server
Real-time, ephemeral, authoritative. It should not query Postgres during the simulation loop.

### Platform API
Persistent player/profile/inventory/history endpoints, future party/social functions, and controlled handoff to matchmaking.

### PostgreSQL
Durable system of record for profiles, match summaries, inventory/progression, and operational references.

### Redis
Ephemeral coordination: presence, queue tickets, room discovery, rate-limit counters, and distributed locks when required.

## Initial schema

`infra/postgres/001_init.sql` creates a minimal profile, match, participant, and cosmetic inventory schema. It is intentionally not a final identity or commerce model.

## Match result contract

At end of match, the game server should eventually submit a server-authenticated result containing:

- match ID;
- server/region/build version;
- map/mode;
- start/end times;
- final team scores;
- participants and compact stats;
- abnormal termination flag.

Clients do not write match results directly.

## Identity

Prototype supports guest names. Production identity should use an external identity/session provider or carefully designed first-party auth. Display names are not stable identifiers.

## Privacy/data minimization

Collect only data needed for gameplay, safety, analytics, and operations. Avoid storing raw chat/voice because those systems are outside initial scope. Define retention for telemetry before broad launch.

## Analytics

Prefer event schemas with explicit versioning. Key early events:

- session started;
- matchmaking queued/matched/failed;
- room join/leave;
- round start/end;
- item pickup/use/hit;
- objective enter/exit/ownership;
- client performance sample;
- network quality sample;
- crash/error.

Analytics must not sit in the render or simulation critical path.

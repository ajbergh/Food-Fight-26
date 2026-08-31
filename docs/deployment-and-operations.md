# Deployment and operations

## Environments

- local: developer machine, Docker Postgres/Redis;
- preview: per-PR static build/API where economical;
- staging: production-like regional server and persistent services;
- production: CDN + platform services + regional match fleets.

## Static delivery

`apps/web` and `apps/game-client` build to static assets suitable for CDN/object storage. Use hashed immutable assets and short-lived HTML entry documents. Brotli/gzip text assets at the edge.

## Match servers

Package `apps/game-server` as a small container. Region selection should prioritize measured latency. A scheduler/load balancer maps matchmaking tickets to processes with available room capacity.

Start with a few broad regions (for example US East, US West, Europe) rather than a complex global fleet before player distribution is known.

## Platform API

Deploy independently from match servers. It can scale based on request throughput and background work, not room count.

## Database

Use managed Postgres and Redis for production unless operational requirements strongly justify self-hosting. Apply migrations through an explicit release step. Back up Postgres and test restore procedures.

## Observability

Minimum production signals:

- build/version in every log/event;
- request rate/error/latency for platform API;
- rooms/process and players/process;
- match tick p50/p95/p99;
- disconnect/reconnect rate;
- matchmaking wait time/failure rate;
- client JS errors;
- client frame-time and network-quality samples;
- match completion rate.

## Release strategy

- Deploy static client and servers with compatible protocol windows.
- Prefer staged/canary rollout for authoritative server changes.
- Keep a rapid rollback path.
- Do not make a database migration irreversible in the same release that first depends on it without a recovery plan.

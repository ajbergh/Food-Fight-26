# Observability

Food Fight 26 treats observability as part of the playable vertical slice rather than a post-launch add-on. The first implementation focuses on bounded browser health signals and keeps gameplay-authoritative server telemetry separate from browser presentation telemetry.

## Current signals

### Browser client

When `VITE_PLATFORM_API_URL` is configured, the game client emits a small versioned telemetry envelope to `POST /api/v1/telemetry/client`.

Supported event kinds:

- `session_started` — viewport/DPR and WebGPU availability only;
- `performance_sample` — approximately every 15 seconds, including FPS, p95 frame time, worst recent frame time, viewport size, DPR, and document visibility;
- `client_error` — bounded message, source filename only, line, and column;
- `unhandled_rejection` — bounded rejection message;
- `page_hidden` — elapsed page lifetime when the document becomes hidden.

The client never waits for telemetry delivery and telemetry failure must not affect gameplay. Delivery prefers `navigator.sendBeacon()` and falls back to a keepalive `fetch()`.

### Platform API

The platform API validates the versioned envelope, applies byte and field-count ceilings, and keeps only aggregate in-memory counters and bounded frame-performance samples. It does **not** retain the raw event stream in memory.

`GET /api/v1/telemetry/summary` currently exposes the staging-oriented aggregate:

- accepted event count;
- unique ephemeral browser sessions since process start;
- counts by event kind;
- frame sample count;
- FPS p50 and p05;
- p95-frame-time p50 and p95;
- last ingestion time.

Raw client error/rejection bodies are not returned by the summary endpoint. Error-class events are represented in structured application logs by kind and route so hosted logging can become the durable diagnostic source later.

### Game server

Authoritative simulation health remains covered by the existing room tick p50/p95/p99/max telemetry and the eight-client benchmark. Browser frame telemetry is intentionally not mixed into those simulation measurements.

## Privacy and collection constraints

The prototype telemetry is deliberately narrow:

- session IDs are random and ephemeral; they are not persisted in local storage;
- no account identifier, display name, IP-derived location, email, chat text, keystroke, inventory history, or raw gameplay input is included;
- user-agent strings are not collected;
- stack traces are not collected by the browser emitter;
- payloads allow primitive values only and have bounded key/string counts;
- the telemetry endpoint has an 8 KiB request-body ceiling;
- summary data is aggregate and process-local.

If accounts are introduced, telemetry identity must remain separately reviewed rather than silently attaching account IDs to this envelope.

## Staging configuration

Local development:

```text
VITE_PLATFORM_API_URL=http://localhost:3000
```

Containerized staging uses `PUBLIC_PLATFORM_API_URL` as the game-client build argument source. Because Vite environment values are compiled into the browser bundle, hosted staging must build the client with a browser-reachable platform API URL.

## Operational interpretation

For playtests, use the browser and server signals together:

- server tick p99 is healthy but browser FPS p05 is low -> rendering/content issue;
- both server tick p99 and browser frame time degrade -> load or host-level contention may be involved;
- error/rejection counts increase while frame metrics remain healthy -> client correctness/regression issue;
- browser telemetry disappears while matches still run -> telemetry routing/configuration problem rather than a gameplay outage.

The in-memory aggregate is intentionally a staging bridge, not a production analytics warehouse.

## Next observability increment

Before a broad external playtest:

1. ship structured logs to a hosted log backend;
2. export platform/game-server service metrics to a durable metrics backend;
3. add dashboard panels for active rooms, tick p95/p99, browser FPS p05/p50, browser p95 frame time, client error rate, and match completion/rematch rate;
4. add release/build identifiers to telemetry after the deployment pipeline produces immutable release IDs;
5. define retention and deletion policy before storing any durable per-session event data.

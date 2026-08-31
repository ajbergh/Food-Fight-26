# Testing and QA

## Test pyramid

### Unit
Pure rules in `game-core`: normalization, movement bounds, cooldowns, scoring, item tables, objective ownership.

### Protocol/state
Serialization compatibility, malformed input rejection, authoritative state transitions.

### Room integration
Multiple simulated clients join/leave, move, throw, score, disconnect, and finish rounds.

### Browser integration
Playwright Chromium smoke tests launch the real Vite client and Colyseus game server, then validate load -> connect -> synchronized room population -> live diagnostics -> graphics/audio controls -> active-round combat input. CI installs Chromium and runs `pnpm test:e2e` after type-checks, unit tests, production builds, the client performance-budget gate, and the eight-player authoritative-room load benchmark. Failed runs retain a short-lived Playwright report artifact. Add Firefox/WebKit coverage for critical regressions as the client matures.

For a local browser smoke run:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright starts the game server and game client automatically unless compatible local servers are already running.

### Manual gameplay QA
Game-feel, readability, controller behavior, audio mix, accessibility settings, network degradation, and multi-monitor/viewport edge cases.

## Multiplayer bot harness

`tools/bot-harness` provides lightweight Colyseus clients for repeatable local multiplayer smoke tests. With the server running, `pnpm bots` starts seven objective-seeking bots by default. Open a human browser client before starting the harness for an eight-player human-plus-bots session.

The harness deliberately sends the same public `input` protocol as a browser client. It must not use privileged room internals; that keeps it useful for detecting protocol, validation, combat, scoring, and lifecycle regressions.

Useful overrides:

```bash
BOT_COUNT=4 BOT_DURATION_SECONDS=60 GAME_SERVER_URL=http://localhost:2567 pnpm bots
```

Bot behavior is deterministic in shape but intentionally jittered in action timing. Do not use it as a gameplay-balance benchmark or substitute for human network/readability testing.

## Automated authoritative-room load benchmark

`pnpm benchmark:room` launches the already-built game server on an isolated local port, joins eight lightweight Colyseus clients into one room, drives continuous movement plus periodic throw/banana/dodge inputs, and consumes the server's real `room_tick_perf` telemetry. The default run lasts 10 seconds and shortens the telemetry report window to 2 seconds so CI receives multiple real simulation samples without waiting a minute.

The benchmark fails on integrity regressions: server startup failure, inability to put all clients in one room, or missing/mismatched tick telemetry. It intentionally does **not** fail on hosted-run p95/p99 duration because shared CI hardware is not a stable performance reference. The measured p50/p95/p99/max values and p99/tick-budget utilization are written to the build log and GitHub Actions step summary for trend review.

Run locally after a production build:

```bash
pnpm build
pnpm benchmark:room
```

Useful diagnostic overrides:

```bash
LOAD_BENCHMARK_SECONDS=30 LOAD_BENCHMARK_REPORT_MS=5000 LOAD_BENCHMARK_BOTS=8 pnpm benchmark:room
```

Keep the automated benchmark protocol-level and headless. Use the browser/device matrix for rendering cost and the interactive bot harness for human gameplay/readability sessions.

## Deterministic simulation tests

Given the same starting state and authoritative input sequence, pure gameplay helpers should produce predictable results within defined floating-point tolerances. This makes regressions easy to reproduce.

## Network simulation

Test at least:

- 20 ms RTT low jitter;
- 80 ms RTT moderate jitter;
- 150 ms RTT;
- packet delay/loss bursts where tooling permits;
- temporary disconnect/reconnect.

Capture correction magnitude and subjective feel.

## Browser/device matrix

Tier 1 before public playtest:

- current Chrome/Edge on Windows;
- current Chrome/Safari on macOS;
- representative integrated-GPU laptop;
- representative discrete-GPU desktop.

Tier 2 includes Firefox and Chromebook/Linux targets.

## Performance regression gates

CI measures the built game client with `pnpm perf:budget` and blocks merges when the largest JavaScript chunk or aggregate initial HTML/CSS/JS/WASM payload exceeds the repository budgets. The budget logic has unit coverage in `tools/perf-budget`, and the command emits a GitHub Actions step summary for quick review.

CI also runs `pnpm benchmark:room` to prove the authoritative server survives an eight-client room under continuous public-protocol input and emits usable p50/p95/p99/max tick telemetry. This is an observability/integrity gate rather than a hardware-sensitive latency threshold.

Next automated performance work should add:

- representative asset-size accounting by production format;
- browser frame-time trace on a stable scene;
- memory after repeated match cycles.

Budget changes must be reviewed as product/architecture changes rather than silently raised to make CI green.

## Playtest questionnaire

Ask behavior-focused questions:

- What were you trying to do when you felt confused?
- Could you tell who hit you?
- Did you understand when the objective was contested?
- Which food item felt unfair and why?
- Did you want another round?

Avoid asking players to design features before diagnosing the observed problem.

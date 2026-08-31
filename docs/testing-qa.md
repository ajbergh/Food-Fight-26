# Testing and QA

## Test pyramid

### Unit
Pure rules in `game-core`: normalization, movement bounds, cooldowns, scoring, item tables, objective ownership.

### Protocol/state
Serialization compatibility, malformed input rejection, authoritative state transitions.

### Room integration
Multiple simulated clients join/leave, move, throw, score, disconnect, and finish rounds.

### Browser integration
Playwright Chromium smoke tests launch the real Vite client and Colyseus game server, then validate load -> connect -> synchronized room population -> live diagnostics -> graphics/audio controls -> active-round combat input. CI installs Chromium and runs `pnpm test:e2e` after type-checks, unit tests, and production builds. Failed runs retain a short-lived Playwright report artifact. Add Firefox/WebKit coverage for critical regressions as the client matures.

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

Automated build should eventually report:

- bundle sizes;
- representative asset sizes;
- server simulation benchmark;
- browser frame-time trace on a stable scene;
- memory after repeated match cycles.

## Playtest questionnaire

Ask behavior-focused questions:

- What were you trying to do when you felt confused?
- Could you tell who hit you?
- Did you understand when the objective was contested?
- Which food item felt unfair and why?
- Did you want another round?

Avoid asking players to design features before diagnosing the observed problem.

# Testing and QA

## Test pyramid

### Unit
Pure rules in `game-core`: normalization, movement bounds, cooldowns, scoring, item tables, objective ownership.

### Protocol/state
Serialization compatibility, malformed input rejection, authoritative state transitions.

### Room integration
Multiple simulated clients join/leave, move, throw, score, disconnect, and finish rounds.

### Browser integration
Automated Chromium flows for load -> connect -> input -> visible state. Add Firefox/WebKit coverage for critical regressions as the client matures.

### Manual gameplay QA
Game-feel, readability, controller behavior, audio mix, accessibility settings, network degradation, and multi-monitor/viewport edge cases.

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

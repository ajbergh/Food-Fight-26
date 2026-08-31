import { describe, expect, it } from "vitest";
import { ClientTelemetryStore, parseClientTelemetry } from "./clientTelemetry";

const baseEvent = {
  schemaVersion: 1,
  sessionId: "session-123",
  kind: "performance_sample",
  at: "2026-08-31T12:00:00.000Z",
  route: "/",
  payload: { fps: 58.4, p95FrameMs: 19.2, release: "sha-test" },
} as const;

describe("client telemetry", () => {
  it("accepts a bounded valid event", () => {
    expect(parseClientTelemetry(baseEvent)).toEqual(baseEvent);
  });

  it("rejects unknown event kinds and malformed timestamps", () => {
    expect(parseClientTelemetry({ ...baseEvent, kind: "keystroke" })).toBeNull();
    expect(parseClientTelemetry({ ...baseEvent, at: "not-a-date" })).toBeNull();
  });

  it("drops nested payload data instead of retaining arbitrary objects", () => {
    expect(
      parseClientTelemetry({
        ...baseEvent,
        payload: { fps: 60, release: "sha-test", nested: { secret: "nope" }, list: [1, 2, 3] },
      })?.payload,
    ).toEqual({ fps: 60, release: "sha-test" });
  });

  it("aggregates event counts, releases, and frame percentiles without retaining raw events", () => {
    const store = new ClientTelemetryStore();
    for (const fps of [60, 58, 30]) {
      const event = parseClientTelemetry({
        ...baseEvent,
        sessionId: `session-${fps}`,
        payload: { fps, p95FrameMs: 1000 / fps, release: "sha-test" },
      });
      expect(event).not.toBeNull();
      store.record(event!);
    }

    expect(store.summary()).toMatchObject({
      received: 3,
      uniqueSessions: 3,
      byKind: { performance_sample: 3 },
      byRelease: { "sha-test": 3 },
      frame: { samples: 3, fpsP50: 58, fpsP05: 30 },
    });
  });
});

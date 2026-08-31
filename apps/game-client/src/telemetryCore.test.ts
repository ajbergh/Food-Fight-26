import { describe, expect, it } from "vitest";
import { createTelemetryEnvelope, percentile, sanitizeTelemetryPayload, sanitizeTelemetryText } from "./telemetryCore";

describe("client telemetry helpers", () => {
  it("normalizes whitespace and bounds telemetry text", () => {
    expect(sanitizeTelemetryText("  one\n\ttwo  ", 7)).toBe("one two");
  });

  it("keeps only bounded primitive payload values", () => {
    expect(
      sanitizeTelemetryPayload({
        fps: 59.8,
        visible: true,
        message: "  render   failed ",
        empty: null,
        ignoredObject: { nested: true },
        ignoredInfinity: Number.POSITIVE_INFINITY,
      }),
    ).toEqual({ fps: 59.8, visible: true, message: "render failed", empty: null });
  });

  it("builds a versioned envelope without carrying arbitrary objects", () => {
    const event = createTelemetryEnvelope(
      "performance_sample",
      "session-1",
      { fps: 60, extra: [1, 2, 3] },
      { now: new Date("2026-08-31T12:00:00.000Z"), route: "/arena" },
    );

    expect(event).toEqual({
      schemaVersion: 1,
      sessionId: "session-1",
      kind: "performance_sample",
      at: "2026-08-31T12:00:00.000Z",
      route: "/arena",
      payload: { fps: 60 },
    });
  });

  it("computes nearest-rank percentiles", () => {
    const samples = [4, 1, 3, 2, 100];
    expect(percentile(samples, 0.5)).toBe(3);
    expect(percentile(samples, 0.95)).toBe(100);
    expect(percentile([], 0.95)).toBe(0);
  });
});

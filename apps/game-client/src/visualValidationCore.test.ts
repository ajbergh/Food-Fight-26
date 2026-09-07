import { describe, expect, it } from "vitest";
import { clampMeasurementMs, summarizeFrameTimes } from "./visualValidationCore";

describe("visual validation frame summaries", () => {
  it("reports ordered frame-time percentiles and measured fps", () => {
    const summary = summarizeFrameTimes([10, 12, 14, 16, 18, 20, 30, 40, 50, 60], 1_000);

    expect(summary.sampleCount).toBe(10);
    expect(summary.fps).toBeCloseTo(10);
    expect(summary.frameMsP50).toBeLessThanOrEqual(summary.frameMsP95);
    expect(summary.frameMsP95).toBeLessThanOrEqual(summary.frameMsP99);
    expect(summary.frameMsP99).toBeLessThanOrEqual(summary.worstFrameMs);
    expect(summary.worstFrameMs).toBe(60);
  });

  it("ignores invalid frame samples and safely handles an empty window", () => {
    const filtered = summarizeFrameTimes([16, Number.NaN, -1, 0, 20], 1_000);
    expect(filtered.sampleCount).toBe(2);
    expect(filtered.frameMsP50).toBe(16);
    expect(filtered.worstFrameMs).toBe(20);

    expect(summarizeFrameTimes([], 0)).toEqual({
      sampleCount: 0,
      elapsedMs: 0,
      fps: 0,
      frameMsP50: 0,
      frameMsP95: 0,
      frameMsP99: 0,
      worstFrameMs: 0,
    });
  });

  it("bounds query-configured measurement durations", () => {
    expect(clampMeasurementMs(null, 2_000, 0, 10_000)).toBe(2_000);
    expect(clampMeasurementMs("bad", 2_000, 0, 10_000)).toBe(2_000);
    expect(clampMeasurementMs("-500", 2_000, 0, 10_000)).toBe(0);
    expect(clampMeasurementMs("250000", 15_000, 500, 120_000)).toBe(120_000);
    expect(clampMeasurementMs("725.4", 15_000, 500, 120_000)).toBe(725);
  });
});

import { describe, expect, it } from "vitest";
import {
  samplesForReportWindow,
  TickDurationReporter,
  summarizeTickDurations,
} from "./tickMetrics";

describe("tick duration metrics", () => {
  it("reports nearest-rank p50/p95/p99 and max values", () => {
    const summary = summarizeTickDurations(Array.from({ length: 100 }, (_, index) => index + 1));

    expect(summary).toEqual({
      samples: 100,
      p50Ms: 50,
      p95Ms: 95,
      p99Ms: 99,
      maxMs: 100,
    });
  });

  it("filters invalid samples before calculating a summary", () => {
    expect(summarizeTickDurations([4, Number.NaN, -1, 2, Number.POSITIVE_INFINITY])).toEqual({
      samples: 2,
      p50Ms: 2,
      p95Ms: 4,
      p99Ms: 4,
      maxMs: 4,
    });
    expect(summarizeTickDurations([Number.NaN, -1])).toBeUndefined();
  });

  it("emits a fixed-size window and then resets", () => {
    const reporter = new TickDurationReporter(3);

    expect(reporter.record(1)).toBeUndefined();
    expect(reporter.record(2)).toBeUndefined();
    expect(reporter.pendingSamples).toBe(2);
    expect(reporter.record(3)).toEqual({
      samples: 3,
      p50Ms: 2,
      p95Ms: 3,
      p99Ms: 3,
      maxMs: 3,
    });
    expect(reporter.pendingSamples).toBe(0);
    expect(reporter.record(4)).toBeUndefined();
    expect(reporter.pendingSamples).toBe(1);
  });

  it("ignores invalid durations without advancing the report window", () => {
    const reporter = new TickDurationReporter(2);

    expect(reporter.record(Number.NaN)).toBeUndefined();
    expect(reporter.record(-0.1)).toBeUndefined();
    expect(reporter.pendingSamples).toBe(0);
    expect(reporter.record(0.5)).toBeUndefined();
    expect(reporter.record(1)).toMatchObject({ samples: 2, maxMs: 1 });
  });

  it("converts report windows to deterministic sample counts", () => {
    expect(samplesForReportWindow(1000 / 30, 60_000)).toBe(1800);
    expect(samplesForReportWindow(1000 / 30, 2_000)).toBe(60);
    expect(samplesForReportWindow(40, 10)).toBe(1);
  });

  it("rejects invalid report-window configuration", () => {
    expect(() => new TickDurationReporter(0)).toThrow(/positive integer/);
    expect(() => new TickDurationReporter(1.5)).toThrow(/positive integer/);
    expect(() => samplesForReportWindow(0, 1000)).toThrow(/tickDelayMs/);
    expect(() => samplesForReportWindow(10, Number.NaN)).toThrow(/reportWindowMs/);
  });
});

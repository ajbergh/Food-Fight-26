import { describe, expect, it } from "vitest";
import {
  aggregateRoomTickPerf,
  formatBenchmarkReport,
  parseRoomTickPerfLine,
  type RoomTickPerfEvent,
} from "./metrics";

const first: RoomTickPerfEvent = {
  event: "room_tick_perf",
  roomId: "room-a",
  samples: 60,
  tickBudgetMs: 33.333,
  p50Ms: 0.5,
  p95Ms: 1.2,
  p99Ms: 1.8,
  maxMs: 2.5,
};

const second: RoomTickPerfEvent = {
  ...first,
  samples: 61,
  p50Ms: 0.7,
  p95Ms: 1.5,
  p99Ms: 2.1,
  maxMs: 3.4,
};

describe("room load benchmark metrics", () => {
  it("parses structured room tick telemetry and ignores unrelated lines", () => {
    expect(parseRoomTickPerfLine(JSON.stringify(first))).toEqual(first);
    expect(parseRoomTickPerfLine("Food Fight game server listening on :2567")).toBeUndefined();
    expect(parseRoomTickPerfLine('{"event":"room_tick_perf","roomId":"x","p99Ms":"slow"}')).toBeUndefined();
  });

  it("aggregates worst-case percentile values across report windows", () => {
    expect(aggregateRoomTickPerf([first, second])).toEqual({
      reports: 2,
      samples: 121,
      roomIds: ["room-a"],
      worstP50Ms: 0.7,
      worstP95Ms: 1.5,
      worstP99Ms: 2.1,
      worstMaxMs: 3.4,
      maxP99BudgetPercent: (2.1 / 33.333) * 100,
    });
    expect(aggregateRoomTickPerf([])).toBeUndefined();
  });

  it("formats a human-readable benchmark summary", () => {
    const aggregate = aggregateRoomTickPerf([first])!;
    const report = formatBenchmarkReport(aggregate, 8, 10);

    expect(report).toContain("Simulated clients: 8");
    expect(report).toContain("Worst p99: 1.800 ms");
    expect(report).toContain("telemetry/load integrity only");
  });
});

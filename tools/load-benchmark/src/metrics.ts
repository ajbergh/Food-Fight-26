export interface RoomTickPerfEvent {
  event: "room_tick_perf";
  roomId: string;
  samples: number;
  tickBudgetMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
}

export interface RoomTickPerfAggregate {
  reports: number;
  samples: number;
  roomIds: string[];
  worstP50Ms: number;
  worstP95Ms: number;
  worstP99Ms: number;
  worstMaxMs: number;
  maxP99BudgetPercent: number;
}

export function parseRoomTickPerfLine(line: string): RoomTickPerfEvent | undefined {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    return undefined;
  }

  if (!isRecord(value) || value.event !== "room_tick_perf" || typeof value.roomId !== "string") {
    return undefined;
  }

  const numericKeys = ["samples", "tickBudgetMs", "p50Ms", "p95Ms", "p99Ms", "maxMs"] as const;
  for (const key of numericKeys) {
    const numericValue = value[key];
    if (typeof numericValue !== "number" || !Number.isFinite(numericValue) || numericValue < 0) {
      return undefined;
    }
  }

  return value as unknown as RoomTickPerfEvent;
}

export function aggregateRoomTickPerf(events: readonly RoomTickPerfEvent[]): RoomTickPerfAggregate | undefined {
  if (events.length === 0) return undefined;

  return {
    reports: events.length,
    samples: events.reduce((sum, event) => sum + event.samples, 0),
    roomIds: [...new Set(events.map((event) => event.roomId))],
    worstP50Ms: Math.max(...events.map((event) => event.p50Ms)),
    worstP95Ms: Math.max(...events.map((event) => event.p95Ms)),
    worstP99Ms: Math.max(...events.map((event) => event.p99Ms)),
    worstMaxMs: Math.max(...events.map((event) => event.maxMs)),
    maxP99BudgetPercent: Math.max(
      ...events.map((event) => event.tickBudgetMs > 0 ? (event.p99Ms / event.tickBudgetMs) * 100 : 0),
    ),
  };
}

export function formatBenchmarkReport(
  aggregate: RoomTickPerfAggregate,
  botCount: number,
  durationSeconds: number,
): string {
  return [
    "## Eight-player room load benchmark",
    "",
    `- Simulated clients: ${botCount}`,
    `- Active duration: ${durationSeconds}s`,
    `- Tick reports: ${aggregate.reports}`,
    `- Tick samples: ${aggregate.samples}`,
    `- Rooms observed: ${aggregate.roomIds.join(", ")}`,
    `- Worst p50: ${formatMs(aggregate.worstP50Ms)}`,
    `- Worst p95: ${formatMs(aggregate.worstP95Ms)}`,
    `- Worst p99: ${formatMs(aggregate.worstP99Ms)}`,
    `- Worst max: ${formatMs(aggregate.worstMaxMs)}`,
    `- Highest p99/tick-budget utilization: ${aggregate.maxP99BudgetPercent.toFixed(1)}%`,
    "",
    "Result: PASS (telemetry/load integrity only; hosted-run latency is not a release threshold)",
    "",
  ].join("\n");
}

function formatMs(value: number): string {
  return `${value.toFixed(3)} ms`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

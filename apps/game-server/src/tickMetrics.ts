export interface TickDurationSummary {
  samples: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
}

export class TickDurationReporter {
  private durations: number[] = [];

  constructor(private readonly reportEverySamples: number) {
    if (!Number.isInteger(reportEverySamples) || reportEverySamples <= 0) {
      throw new Error("reportEverySamples must be a positive integer");
    }
  }

  record(durationMs: number): TickDurationSummary | undefined {
    if (!Number.isFinite(durationMs) || durationMs < 0) return undefined;
    this.durations.push(durationMs);
    if (this.durations.length < this.reportEverySamples) return undefined;

    const summary = summarizeTickDurations(this.durations);
    this.durations = [];
    return summary;
  }

  get pendingSamples(): number {
    return this.durations.length;
  }
}

export function summarizeTickDurations(durations: readonly number[]): TickDurationSummary | undefined {
  const sorted = durations
    .filter((duration) => Number.isFinite(duration) && duration >= 0)
    .slice()
    .sort((a, b) => a - b);
  if (sorted.length === 0) return undefined;

  return {
    samples: sorted.length,
    p50Ms: percentile(sorted, 0.5),
    p95Ms: percentile(sorted, 0.95),
    p99Ms: percentile(sorted, 0.99),
    maxMs: sorted[sorted.length - 1]!,
  };
}

function percentile(sorted: readonly number[], percentileValue: number): number {
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(percentileValue * sorted.length) - 1));
  return sorted[index]!;
}

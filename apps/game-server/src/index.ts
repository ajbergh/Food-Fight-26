import { createServer } from "node:http";
import { performance } from "node:perf_hooks";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { FoodFightRoom } from "./rooms/FoodFightRoom";
import {
  samplesForReportWindow,
  TickDurationReporter,
  type TickDurationSummary,
} from "./tickMetrics";

const port = Number(process.env.GAME_SERVER_PORT ?? 2567);
const tickMetricsReportMs = readPositiveNumber("TICK_METRICS_REPORT_MS", 60_000);
const httpServer = createServer();
const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

class InstrumentedFoodFightRoom extends FoodFightRoom {
  private tickDurationReporter?: TickDurationReporter;
  private tickBudgetMs = 0;

  override setSimulationInterval(
    onTickCallback: (deltaTime: number) => void = () => {},
    delay = 1000 / 60,
  ): void {
    this.tickBudgetMs = delay;
    this.tickDurationReporter = new TickDurationReporter(
      samplesForReportWindow(delay, tickMetricsReportMs),
    );

    super.setSimulationInterval((deltaTime) => {
      const startedAt = performance.now();
      try {
        onTickCallback(deltaTime);
      } finally {
        const summary = this.tickDurationReporter?.record(performance.now() - startedAt);
        if (summary) this.logTickSummary(summary);
      }
    }, delay);
  }

  private logTickSummary(summary: TickDurationSummary): void {
    console.info(
      JSON.stringify({
        event: "room_tick_perf",
        roomId: this.roomId,
        samples: summary.samples,
        tickBudgetMs: roundMetric(this.tickBudgetMs),
        p50Ms: roundMetric(summary.p50Ms),
        p95Ms: roundMetric(summary.p95Ms),
        p99Ms: roundMetric(summary.p99Ms),
        maxMs: roundMetric(summary.maxMs),
      }),
    );
  }
}

gameServer.define("food_fight", InstrumentedFoodFightRoom);
await gameServer.listen(port);
console.log(`Food Fight game server listening on :${port}`);

function roundMetric(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function readPositiveNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

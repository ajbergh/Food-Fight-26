import { percentile } from "./telemetryCore";

export interface FrameTimingSummary {
  sampleCount: number;
  elapsedMs: number;
  fps: number;
  frameMsP50: number;
  frameMsP95: number;
  frameMsP99: number;
  worstFrameMs: number;
}

export function summarizeFrameTimes(
  frameTimes: readonly number[],
  elapsedMs: number,
): FrameTimingSummary {
  const samples = frameTimes.filter((value) => Number.isFinite(value) && value > 0);
  const safeElapsedMs = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  const fps = safeElapsedMs > 0 ? (samples.length * 1000) / safeElapsedMs : 0;

  return {
    sampleCount: samples.length,
    elapsedMs: safeElapsedMs,
    fps,
    frameMsP50: percentile(samples, 0.5),
    frameMsP95: percentile(samples, 0.95),
    frameMsP99: percentile(samples, 0.99),
    worstFrameMs: samples.length > 0 ? Math.max(...samples) : 0,
  };
}

export function clampMeasurementMs(
  value: string | null,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(parsed)));
}

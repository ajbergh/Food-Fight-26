import * as pc from "playcanvas";
import {
  summarizeRenderResourceSamples,
  type RenderResourceSample,
  type RenderResourceSummary,
} from "./renderResourceStatsCore";

export interface RenderResourceReport extends RenderResourceSummary {
  schemaVersion: 1;
  capturedAt: string;
  phase: "live" | "ready" | "invalid";
  sampleIntervalMs: number;
  detailedStatsAvailable: boolean;
  detailedMetricsNote: string;
  graphicsDeviceType: string;
}

declare global {
  interface Window {
    __foodfightRenderResources?: RenderResourceReport;
  }
}

const params = new URLSearchParams(window.location.search);
const validationValue = params.get("visualValidation");
const renderStatsValue = params.get("renderStats");
const enabled = isEnabled(validationValue) || isEnabled(renderStatsValue);
const SAMPLE_INTERVAL_MS = 100;
const LIVE_SAMPLE_LIMIT = 300;

if (enabled) startRenderResourceStats();

function startRenderResourceStats() {
  const root = document.documentElement;
  const app = pc.Application.getApplication();
  if (!app) {
    root.dataset.renderResourceStats = "unavailable";
    return;
  }

  const samples: RenderResourceSample[] = [];
  const validationCoupled = isEnabled(validationValue);
  let previousValidationState = root.dataset.visualValidation ?? "";

  root.dataset.renderResourceStats = validationCoupled ? "waiting" : "collecting";
  delete window.__foodfightRenderResources;

  window.setInterval(() => {
    const validationState = root.dataset.visualValidation ?? "";

    if (validationCoupled) {
      if (validationState === "collecting" && previousValidationState !== "collecting") {
        samples.length = 0;
        delete window.__foodfightRenderResources;
        root.dataset.renderResourceStats = "collecting";
      }

      if (validationState === "collecting") {
        samples.push(readSample(app));
      } else if (
        (validationState === "ready" || validationState === "invalid") &&
        previousValidationState === "collecting"
      ) {
        publishReport(app, samples, validationState, root);
      } else if (validationState === "waiting-players" || validationState === "warming") {
        root.dataset.renderResourceStats = "waiting";
      }
    } else {
      samples.push(readSample(app));
      if (samples.length > LIVE_SAMPLE_LIMIT) samples.splice(0, samples.length - LIVE_SAMPLE_LIMIT);
      publishReport(app, samples, "live", root);
    }

    previousValidationState = validationState;
  }, SAMPLE_INTERVAL_MS);
}

function publishReport(
  app: pc.AppBase,
  samples: readonly RenderResourceSample[],
  phase: "live" | "ready" | "invalid",
  root: HTMLElement,
) {
  const summary = summarizeRenderResourceSamples(samples);
  const detailedStatsAvailable = samples.some(
    (sample) => sample.triangles !== null || sample.skinnedDrawCalls !== null,
  );

  window.__foodfightRenderResources = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    phase,
    sampleIntervalMs: SAMPLE_INTERVAL_MS,
    detailedStatsAvailable,
    detailedMetricsNote: detailedStatsAvailable
      ? "Profiler-build triangle and skinning counters were populated."
      : "This engine build exposed basic draw-call/VRAM stats only; profiler-only triangle and skinning counters are null.",
    graphicsDeviceType: readGraphicsDeviceType(app),
    ...summary,
  };
  root.dataset.renderResourceStats = phase;
  root.dataset.renderResourceDetailed = detailedStatsAvailable ? "available" : "unavailable";
}

function readSample(app: pc.AppBase): RenderResourceSample {
  const stats = (app as pc.AppBase & { stats?: EngineStatsLike }).stats;
  const drawCallsTotal = safeNumber(stats?.drawCalls?.total);
  const detailedAvailable = safeNumber(stats?.drawCalls?.forward) > 0 ||
    safeNumber(stats?.drawCalls?.shadow) > 0 ||
    safeNumber(stats?.drawCalls?.skinned) > 0 ||
    safeNumber(stats?.frame?.triangles) > 0;
  const vram = stats?.vram;
  const texture = safeNumber(vram?.tex);
  const geometry = safeNumber(vram?.geom, safeNumber(vram?.vb) + safeNumber(vram?.ib));
  const buffers = safeNumber(vram?.buffers, safeNumber(vram?.ub) + safeNumber(vram?.sb));
  const total = safeNumber(vram?.totalUsed, texture + geometry + buffers);

  return {
    drawCallsTotal,
    triangles: detailedAvailable ? safeNumber(stats?.frame?.triangles) : null,
    skinnedDrawCalls: detailedAvailable ? safeNumber(stats?.drawCalls?.skinned) : null,
    vramTextureBytes: texture,
    vramGeometryBytes: geometry,
    vramBufferBytes: buffers,
    vramTotalBytes: total,
  };
}

function readGraphicsDeviceType(app: pc.AppBase) {
  const device = app.graphicsDevice as pc.GraphicsDevice & {
    deviceType?: string;
    isWebGPU?: boolean;
    isWebGL2?: boolean;
  };
  if (typeof device.deviceType === "string" && device.deviceType) return device.deviceType;
  if (device.isWebGPU) return "webgpu";
  if (device.isWebGL2) return "webgl2";
  return "unknown";
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isEnabled(value: string | null) {
  return value !== null && value !== "0" && value.toLowerCase() !== "false";
}

interface EngineStatsLike {
  frame?: {
    triangles?: number;
  };
  drawCalls?: {
    total?: number;
    forward?: number;
    shadow?: number;
    skinned?: number;
  };
  vram?: {
    tex?: number;
    vb?: number;
    ib?: number;
    ub?: number;
    sb?: number;
    geom?: number;
    buffers?: number;
    totalUsed?: number;
  };
}

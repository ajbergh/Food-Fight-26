import { getRuntimeConfig } from "./runtimeConfig";
import { createTelemetryEnvelope, percentile, type ClientTelemetryKind } from "./telemetryCore";

const runtimeConfig = getRuntimeConfig();
const endpoint = runtimeConfig.platformApiUrl ? `${runtimeConfig.platformApiUrl}/api/v1/telemetry/client` : "";
const sessionId = crypto.randomUUID?.() ?? `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const SAMPLE_INTERVAL_MS = 15_000;
const frameTimes: number[] = [];
let lastFrameAt = performance.now();
let framesInWindow = 0;
let windowStartedAt = lastFrameAt;

function send(kind: ClientTelemetryKind, payload: Record<string, unknown>) {
  if (!endpoint) return;
  const event = createTelemetryEnvelope(kind, sessionId, { ...payload, release: runtimeConfig.release }, { route: window.location.pathname });
  const body = JSON.stringify(event);

  try {
    if (navigator.sendBeacon) {
      const accepted = navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain;charset=UTF-8" }));
      if (accepted) return;
    }
  } catch {
    // Fall through to fetch. Telemetry must never affect gameplay.
  }

  void fetch(endpoint, {
    method: "POST",
    body,
    headers: { "content-type": "text/plain;charset=UTF-8" },
    keepalive: true,
    mode: "cors",
  }).catch(() => undefined);
}

function renderFrame(now: number) {
  const delta = now - lastFrameAt;
  lastFrameAt = now;
  framesInWindow += 1;
  if (delta > 0 && delta < 2_000) {
    frameTimes.push(delta);
    if (frameTimes.length > 1_200) frameTimes.shift();
  }
  requestAnimationFrame(renderFrame);
}

function samplePerformance() {
  const now = performance.now();
  const elapsedSeconds = Math.max(0.001, (now - windowStartedAt) / 1000);
  const fps = framesInWindow / elapsedSeconds;
  const p95FrameMs = percentile(frameTimes, 0.95);
  const worstFrameMs = frameTimes.length > 0 ? Math.max(...frameTimes) : 0;

  send("performance_sample", {
    fps: Math.round(fps * 10) / 10,
    p95FrameMs: Math.round(p95FrameMs * 10) / 10,
    worstFrameMs: Math.round(worstFrameMs * 10) / 10,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    dpr: Math.round(window.devicePixelRatio * 100) / 100,
    hidden: document.hidden,
  });

  framesInWindow = 0;
  windowStartedAt = now;
  frameTimes.length = 0;
}

window.addEventListener("error", (event) => {
  send("client_error", {
    message: event.message || "window error",
    source: event.filename ? event.filename.split("/").pop() : "unknown",
    line: event.lineno || 0,
    column: event.colno || 0,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  send("unhandled_rejection", {
    message: reason instanceof Error ? reason.message : String(reason ?? "unhandled rejection"),
  });
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) return;
  send("page_hidden", {
    elapsedSeconds: Math.round(performance.now() / 100) / 10,
  });
});

send("session_started", {
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  dpr: Math.round(window.devicePixelRatio * 100) / 100,
  webgpu: "gpu" in navigator,
});
requestAnimationFrame(renderFrame);
window.setInterval(samplePerformance, SAMPLE_INTERVAL_MS);

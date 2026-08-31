export type ClientTelemetryKind =
  | "session_started"
  | "performance_sample"
  | "client_error"
  | "unhandled_rejection"
  | "page_hidden";

export interface ClientTelemetryEnvelope {
  schemaVersion: 1;
  sessionId: string;
  kind: ClientTelemetryKind;
  at: string;
  route: string;
  payload: Record<string, string | number | boolean | null>;
}

const ALLOWED_KINDS = new Set<ClientTelemetryKind>([
  "session_started",
  "performance_sample",
  "client_error",
  "unhandled_rejection",
  "page_hidden",
]);
const MAX_SESSION_LENGTH = 80;
const MAX_ROUTE_LENGTH = 120;
const MAX_PAYLOAD_KEYS = 24;
const MAX_STRING_LENGTH = 240;
const MAX_FPS_SAMPLES = 600;

function cleanString(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim().slice(0, max);
  return normalized || null;
}

export function parseClientTelemetry(value: unknown): ClientTelemetryEnvelope | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== 1) return null;
  if (typeof candidate.kind !== "string" || !ALLOWED_KINDS.has(candidate.kind as ClientTelemetryKind)) return null;

  const sessionId = cleanString(candidate.sessionId, MAX_SESSION_LENGTH);
  const route = cleanString(candidate.route, MAX_ROUTE_LENGTH);
  if (!sessionId || !route) return null;
  if (typeof candidate.at !== "string" || Number.isNaN(Date.parse(candidate.at))) return null;
  if (!candidate.payload || typeof candidate.payload !== "object" || Array.isArray(candidate.payload)) return null;

  const payload: Record<string, string | number | boolean | null> = {};
  for (const [key, raw] of Object.entries(candidate.payload).slice(0, MAX_PAYLOAD_KEYS)) {
    const safeKey = cleanString(key, 48);
    if (!safeKey) continue;
    if (typeof raw === "string") payload[safeKey] = cleanString(raw, MAX_STRING_LENGTH) ?? "";
    else if (typeof raw === "number" && Number.isFinite(raw)) payload[safeKey] = raw;
    else if (typeof raw === "boolean" || raw === null) payload[safeKey] = raw;
  }

  return {
    schemaVersion: 1,
    sessionId,
    kind: candidate.kind as ClientTelemetryKind,
    at: candidate.at,
    route,
    payload,
  };
}

function percentile(values: number[], fraction: number) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1));
  return Math.round((sorted[index] ?? 0) * 10) / 10;
}

export class ClientTelemetryStore {
  private received = 0;
  private sessions = new Set<string>();
  private byKind = new Map<ClientTelemetryKind, number>();
  private fpsSamples: number[] = [];
  private p95FrameSamples: number[] = [];
  private lastReceivedAt: string | null = null;

  record(event: ClientTelemetryEnvelope) {
    this.received += 1;
    this.sessions.add(event.sessionId);
    this.byKind.set(event.kind, (this.byKind.get(event.kind) ?? 0) + 1);
    this.lastReceivedAt = new Date().toISOString();

    if (event.kind === "performance_sample") {
      const fps = event.payload.fps;
      const p95FrameMs = event.payload.p95FrameMs;
      if (typeof fps === "number" && Number.isFinite(fps)) this.pushBounded(this.fpsSamples, fps);
      if (typeof p95FrameMs === "number" && Number.isFinite(p95FrameMs)) this.pushBounded(this.p95FrameSamples, p95FrameMs);
    }
  }

  summary() {
    return {
      received: this.received,
      uniqueSessions: this.sessions.size,
      byKind: Object.fromEntries(this.byKind),
      frame: {
        samples: this.fpsSamples.length,
        fpsP50: percentile(this.fpsSamples, 0.5),
        fpsP05: percentile(this.fpsSamples, 0.05),
        p95FrameMsP50: percentile(this.p95FrameSamples, 0.5),
        p95FrameMsP95: percentile(this.p95FrameSamples, 0.95),
      },
      lastReceivedAt: this.lastReceivedAt,
    };
  }

  private pushBounded(target: number[], value: number) {
    target.push(value);
    if (target.length > MAX_FPS_SAMPLES) target.shift();
  }
}

export type ClientTelemetryKind =
  | "session_started"
  | "performance_sample"
  | "client_error"
  | "unhandled_rejection"
  | "page_hidden";

export type TelemetryPrimitive = string | number | boolean | null;

export interface ClientTelemetryEnvelope {
  schemaVersion: 1;
  sessionId: string;
  kind: ClientTelemetryKind;
  at: string;
  route: string;
  payload: Record<string, TelemetryPrimitive>;
}

const MAX_TEXT_LENGTH = 240;
const MAX_PAYLOAD_KEYS = 24;

export function sanitizeTelemetryText(value: unknown, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeTelemetryPayload(payload: Record<string, unknown>) {
  const result: Record<string, TelemetryPrimitive> = {};
  for (const [key, value] of Object.entries(payload).slice(0, MAX_PAYLOAD_KEYS)) {
    const safeKey = sanitizeTelemetryText(key, 48);
    if (!safeKey) continue;
    if (typeof value === "string") result[safeKey] = sanitizeTelemetryText(value);
    else if (typeof value === "number" && Number.isFinite(value)) result[safeKey] = value;
    else if (typeof value === "boolean" || value === null) result[safeKey] = value;
  }
  return result;
}

export function createTelemetryEnvelope(
  kind: ClientTelemetryKind,
  sessionId: string,
  payload: Record<string, unknown>,
  options: { now?: Date; route?: string } = {},
): ClientTelemetryEnvelope {
  return {
    schemaVersion: 1,
    sessionId: sanitizeTelemetryText(sessionId, 80),
    kind,
    at: (options.now ?? new Date()).toISOString(),
    route: sanitizeTelemetryText(options.route ?? "/", 120) || "/",
    payload: sanitizeTelemetryPayload(payload),
  };
}

export function percentile(values: number[], fraction: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const clamped = Math.min(1, Math.max(0, fraction));
  const index = Math.min(sorted.length - 1, Math.ceil(clamped * sorted.length) - 1);
  return sorted[Math.max(0, index)] ?? 0;
}

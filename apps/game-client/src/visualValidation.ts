import { clampMeasurementMs, summarizeFrameTimes } from "./visualValidationCore";

type GraphicsTier = "low" | "medium" | "high" | "unknown";
type CharacterPath = "procedural" | "skeletal" | "skeletal-loading" | "procedural-fallback";

export interface VisualValidationReport {
  schemaVersion: 1;
  capturedAt: string;
  label: string;
  valid: boolean;
  invalidReasons: string[];
  warmupMs: number;
  requestedSampleMs: number;
  sampleCount: number;
  elapsedMs: number;
  fps: number;
  frameMsP50: number;
  frameMsP95: number;
  frameMsP99: number;
  worstFrameMs: number;
  viewportWidth: number;
  viewportHeight: number;
  dpr: number;
  hardwareConcurrency: number;
  deviceMemoryGb: number | null;
  graphicsTierStart: GraphicsTier;
  graphicsTierEnd: GraphicsTier;
  characterPath: CharacterPath;
  playerCount: number | null;
  reducedMotion: boolean;
  teamPalette: string;
}

declare global {
  interface Window {
    __foodfightVisualValidation?: VisualValidationReport;
  }
}

const params = new URLSearchParams(window.location.search);
const enabledValue = params.get("visualValidation");
const enabled = enabledValue !== null && enabledValue !== "0" && enabledValue.toLowerCase() !== "false";

if (enabled) startVisualValidation();

function startVisualValidation() {
  const root = document.documentElement;
  const warmupMs = clampMeasurementMs(
    params.get("visualValidationWarmupMs"),
    2_000,
    0,
    10_000,
  );
  const sampleMs = clampMeasurementMs(
    params.get("visualValidationMs"),
    15_000,
    500,
    120_000,
  );
  const label = sanitizeLabel(params.get("visualValidationLabel"));
  const requestedTier = readRequestedTier(params.get("visualValidationQuality"));

  root.dataset.visualValidation = "warming";
  delete window.__foodfightVisualValidation;

  let warmupStartedAt = performance.now();
  let sampleStartedAt: number | undefined;
  let lastFrameAt = warmupStartedAt;
  let hiddenDuringSample = false;
  let graphicsTierStart: GraphicsTier = "unknown";
  const frameTimes: number[] = [];

  function tick(now: number) {
    if (document.hidden) {
      if (sampleStartedAt !== undefined) hiddenDuringSample = true;
      lastFrameAt = now;
      window.requestAnimationFrame(tick);
      return;
    }

    if (sampleStartedAt === undefined) {
      if (requestedTier) applyRequestedTier(requestedTier);
      if (now - warmupStartedAt < warmupMs) {
        lastFrameAt = now;
        window.requestAnimationFrame(tick);
        return;
      }

      graphicsTierStart = readGraphicsTier();
      sampleStartedAt = now;
      lastFrameAt = now;
      root.dataset.visualValidation = "collecting";
      window.requestAnimationFrame(tick);
      return;
    }

    const delta = now - lastFrameAt;
    lastFrameAt = now;
    if (delta > 0 && delta < 2_000) frameTimes.push(delta);

    const elapsedMs = now - sampleStartedAt;
    if (elapsedMs < sampleMs) {
      window.requestAnimationFrame(tick);
      return;
    }

    const summary = summarizeFrameTimes(frameTimes, elapsedMs);
    const graphicsTierEnd = readGraphicsTier();
    const invalidReasons: string[] = [];
    if (hiddenDuringSample) invalidReasons.push("document-hidden-during-sample");
    if (graphicsTierStart !== graphicsTierEnd) invalidReasons.push("graphics-tier-changed-during-sample");
    if (summary.sampleCount < 10) invalidReasons.push("insufficient-frame-samples");

    const report: VisualValidationReport = {
      schemaVersion: 1,
      capturedAt: new Date().toISOString(),
      label,
      valid: invalidReasons.length === 0,
      invalidReasons,
      warmupMs,
      requestedSampleMs: sampleMs,
      sampleCount: summary.sampleCount,
      elapsedMs: round(summary.elapsedMs),
      fps: round(summary.fps),
      frameMsP50: round(summary.frameMsP50),
      frameMsP95: round(summary.frameMsP95),
      frameMsP99: round(summary.frameMsP99),
      worstFrameMs: round(summary.worstFrameMs),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      dpr: round(window.devicePixelRatio),
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemoryGb: readDeviceMemory(),
      graphicsTierStart,
      graphicsTierEnd,
      characterPath: readCharacterPath(),
      playerCount: readPlayerCount(),
      reducedMotion: readReducedMotion(),
      teamPalette: document.body.dataset.teamPalette ?? "default",
    };

    window.__foodfightVisualValidation = report;
    root.dataset.visualValidation = report.valid ? "ready" : "invalid";
    root.dataset.visualValidationTier = graphicsTierEnd;
    root.dataset.visualValidationCharacter = report.characterPath;
    root.dataset.visualValidationPlayers = report.playerCount === null ? "unknown" : String(report.playerCount);
  }

  // Let the other game-client modules finish their synchronous setup before applying an optional tier.
  window.requestAnimationFrame((now) => {
    warmupStartedAt = now;
    lastFrameAt = now;
    if (requestedTier) applyRequestedTier(requestedTier);
    window.requestAnimationFrame(tick);
  });
}

function applyRequestedTier(requested: GraphicsTier) {
  if (requested === "unknown") return;
  const button = document.querySelector<HTMLButtonElement>("#quality");
  if (!button) return;
  for (let attempts = 0; attempts < 3 && readGraphicsTier() !== requested; attempts += 1) {
    button.click();
  }
}

function readRequestedTier(value: string | null): GraphicsTier | undefined {
  if (value === "low" || value === "medium" || value === "high") return value;
  return undefined;
}

function readGraphicsTier(): GraphicsTier {
  const text = document.querySelector<HTMLButtonElement>("#quality")?.textContent?.toLowerCase() ?? "";
  if (text.includes("low")) return "low";
  if (text.includes("medium")) return "medium";
  if (text.includes("high")) return "high";
  return "unknown";
}

function readCharacterPath(): CharacterPath {
  const state = document.documentElement.dataset.skeletalPilot;
  if (state === "ready") return "skeletal";
  if (state === "loading") return "skeletal-loading";
  if (state === "fallback") return "procedural-fallback";
  return "procedural";
}

function readPlayerCount() {
  const text = document.querySelector<HTMLElement>("#network")?.textContent ?? "";
  const match = text.match(/(?:^|\s)(\d+)\s*\/\s*8(?:\s|$)/);
  return match ? Number(match[1]) : null;
}

function readReducedMotion() {
  return document.body.dataset.reducedMotion === "true" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readDeviceMemory() {
  const value = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sanitizeLabel(value: string | null) {
  return (value ?? "").replace(/[^a-zA-Z0-9 ._()-]/g, "").trim().slice(0, 80);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

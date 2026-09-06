import { clampMeasurementMs, summarizeFrameTimes } from "./visualValidationCore";

type GraphicsTier = "low" | "medium" | "high" | "unknown";
type RequestedGraphicsTier = Exclude<GraphicsTier, "unknown">;
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
  requestedGraphicsTier: RequestedGraphicsTier | null;
  graphicsTierStart: GraphicsTier;
  graphicsTierEnd: GraphicsTier;
  characterPathStart: CharacterPath;
  characterPathEnd: CharacterPath;
  requiredPlayerCount: number | null;
  playerCountStart: number | null;
  playerCountEnd: number | null;
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
  const requiredPlayerCount = readRequiredPlayerCount(params.get("visualValidationPlayers"));

  root.dataset.visualValidation = requiredPlayerCount === null ? "warming" : "waiting-players";
  delete window.__foodfightVisualValidation;

  let warmupStartedAt: number | undefined;
  let sampleStartedAt: number | undefined;
  let lastFrameAt = performance.now();
  let hiddenDuringSample = false;
  let graphicsTierChangedDuringSample = false;
  let characterPathChangedDuringSample = false;
  let playerCountChangedDuringSample = false;
  let presentationSettingsChangedDuringSample = false;
  let viewportChangedDuringSample = false;
  let graphicsTierStart: GraphicsTier = "unknown";
  let characterPathStart: CharacterPath = "procedural";
  let playerCountStart: number | null = null;
  let reducedMotionStart = false;
  let teamPaletteStart = "default";
  let viewportWidthStart = window.innerWidth;
  let viewportHeightStart = window.innerHeight;
  let dprStart = window.devicePixelRatio;
  const frameTimes: number[] = [];

  const qualityButton = document.querySelector<HTMLButtonElement>("#quality");
  const networkLabel = document.querySelector<HTMLElement>("#network");

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && sampleStartedAt !== undefined) hiddenDuringSample = true;
  });
  window.addEventListener("resize", () => {
    if (sampleStartedAt !== undefined) viewportChangedDuringSample = true;
  });
  if (qualityButton) {
    new MutationObserver(() => {
      if (sampleStartedAt !== undefined && readGraphicsTier() !== graphicsTierStart) {
        graphicsTierChangedDuringSample = true;
      }
    }).observe(qualityButton, { childList: true, characterData: true, subtree: true });
  }
  if (networkLabel && requiredPlayerCount !== null) {
    new MutationObserver(() => {
      if (sampleStartedAt !== undefined && readPlayerCount() !== requiredPlayerCount) {
        playerCountChangedDuringSample = true;
      }
    }).observe(networkLabel, { childList: true, characterData: true, subtree: true });
  }
  new MutationObserver(() => {
    if (sampleStartedAt !== undefined && readCharacterPath() !== characterPathStart) {
      characterPathChangedDuringSample = true;
    }
  }).observe(root, { attributes: true, attributeFilter: ["data-skeletal-pilot"] });
  new MutationObserver(() => {
    if (sampleStartedAt === undefined) return;
    if (readReducedMotion() !== reducedMotionStart || readTeamPalette() !== teamPaletteStart) {
      presentationSettingsChangedDuringSample = true;
    }
  }).observe(document.body, {
    attributes: true,
    attributeFilter: ["data-reduced-motion", "data-team-palette"],
  });

  function tick(now: number) {
    if (document.hidden) {
      if (sampleStartedAt !== undefined) hiddenDuringSample = true;
      lastFrameAt = now;
      window.requestAnimationFrame(tick);
      return;
    }

    if (sampleStartedAt === undefined) {
      if (warmupStartedAt === undefined) {
        if (requiredPlayerCount !== null && readPlayerCount() !== requiredPlayerCount) {
          root.dataset.visualValidation = "waiting-players";
          lastFrameAt = now;
          window.requestAnimationFrame(tick);
          return;
        }
        warmupStartedAt = now;
        root.dataset.visualValidation = "warming";
      }

      if (now - warmupStartedAt < warmupMs) {
        lastFrameAt = now;
        window.requestAnimationFrame(tick);
        return;
      }

      graphicsTierStart = readGraphicsTier();
      characterPathStart = readCharacterPath();
      playerCountStart = readPlayerCount();
      reducedMotionStart = readReducedMotion();
      teamPaletteStart = readTeamPalette();
      viewportWidthStart = window.innerWidth;
      viewportHeightStart = window.innerHeight;
      dprStart = window.devicePixelRatio;
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
    const characterPathEnd = readCharacterPath();
    const playerCountEnd = readPlayerCount();
    const reducedMotionEnd = readReducedMotion();
    const teamPaletteEnd = readTeamPalette();
    const invalidReasons: string[] = [];

    if (hiddenDuringSample) invalidReasons.push("document-hidden-during-sample");
    if (requestedTier && graphicsTierStart !== requestedTier) invalidReasons.push("requested-graphics-tier-unavailable");
    if (graphicsTierChangedDuringSample || graphicsTierStart !== graphicsTierEnd) {
      invalidReasons.push("graphics-tier-changed-during-sample");
    }
    if (characterPathChangedDuringSample || characterPathStart !== characterPathEnd) {
      invalidReasons.push("character-path-changed-during-sample");
    }
    if (
      requiredPlayerCount !== null &&
      (playerCountChangedDuringSample || playerCountStart !== requiredPlayerCount || playerCountEnd !== requiredPlayerCount)
    ) {
      invalidReasons.push("required-player-count-not-maintained");
    }
    if (
      presentationSettingsChangedDuringSample ||
      reducedMotionStart !== reducedMotionEnd ||
      teamPaletteStart !== teamPaletteEnd
    ) {
      invalidReasons.push("presentation-settings-changed-during-sample");
    }
    if (
      viewportChangedDuringSample ||
      viewportWidthStart !== window.innerWidth ||
      viewportHeightStart !== window.innerHeight ||
      dprStart !== window.devicePixelRatio
    ) {
      invalidReasons.push("viewport-changed-during-sample");
    }
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
      requestedGraphicsTier: requestedTier ?? null,
      graphicsTierStart,
      graphicsTierEnd,
      characterPathStart,
      characterPathEnd,
      requiredPlayerCount,
      playerCountStart,
      playerCountEnd,
      reducedMotion: reducedMotionEnd,
      teamPalette: teamPaletteEnd,
    };

    window.__foodfightVisualValidation = report;
    root.dataset.visualValidation = report.valid ? "ready" : "invalid";
    root.dataset.visualValidationTier = graphicsTierEnd;
    root.dataset.visualValidationCharacter = characterPathEnd;
    root.dataset.visualValidationPlayers = playerCountEnd === null ? "unknown" : String(playerCountEnd);
  }

  // Apply a requested tier exactly once. The normal adaptive-quality behavior then remains authoritative.
  window.requestAnimationFrame((now) => {
    lastFrameAt = now;
    if (requestedTier) applyRequestedTier(requestedTier);
    if (requiredPlayerCount === null || readPlayerCount() === requiredPlayerCount) {
      warmupStartedAt = now;
      root.dataset.visualValidation = "warming";
    }
    window.requestAnimationFrame(tick);
  });
}

function applyRequestedTier(requested: RequestedGraphicsTier) {
  const button = document.querySelector<HTMLButtonElement>("#quality");
  if (!button) return;
  for (let attempts = 0; attempts < 3 && readGraphicsTier() !== requested; attempts += 1) {
    button.click();
  }
}

function readRequestedTier(value: string | null): RequestedGraphicsTier | undefined {
  if (value === "low" || value === "medium" || value === "high") return value;
  return undefined;
}

function readRequiredPlayerCount(value: string | null) {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 8) return null;
  return parsed;
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

function readTeamPalette() {
  return document.body.dataset.teamPalette ?? "default";
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

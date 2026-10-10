import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TIERS = ["low", "medium", "high"];
const PLATFORMS = ["windows", "macos", "tablet"];
const REQUIRED = [["procedural", "low"], ["procedural", "medium"], ["procedural", "high"], ["skeletal", "medium"], ["skeletal", "high"]];

const finite = (x) => typeof x === "number" && Number.isFinite(x);
const med = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  return n === 0 ? null : n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
};
const fixed = (x, digits = 1) => x == null ? "—" : Number(x).toFixed(digits);

export function evaluateEvidence(entries) {
  const errors = [], diagnostics = [], groups = new Map(), seen = new Set();
  const revisionSet = new Set();
  for (const [file, evidence] of entries) {
    const failures = [];
    const { revision, device, visual, resources } = evidence ?? {};
    if (!/^[a-f0-9]{40}$/.test(revision ?? "")) failures.push("missing immutable 40-character revision");
    else revisionSet.add(revision);
    if (!PLATFORMS.includes(device?.platform) || typeof device?.id !== "string" || !device.id.trim()) failures.push("missing platform/device ID");
    for (const field of ["model", "cpu", "gpu", "ram", "os", "browser", "powerMode"]) {
      if (typeof device?.[field] !== "string" || !device[field].trim()) failures.push("missing device." + field);
    }
    if (visual?.schemaVersion !== 1 || visual?.valid !== true || (visual?.invalidReasons?.length ?? 0) !== 0) failures.push("invalid visual run");
    if (visual?.warmupMs !== 5000 || visual?.requestedSampleMs !== 30000 || visual?.minimumFrameSamples !== 10 || !(visual?.sampleCount >= 10)) failures.push("non-acceptance timing/samples");
    if (visual?.requiredPlayerCount !== 8 || visual?.playerCountStart !== 8 || visual?.playerCountEnd !== 8) failures.push("not a stable eight-player render");
    const tier = visual?.requestedGraphicsTier;
    const character = visual?.characterPath;
    if (!TIERS.includes(tier) || visual?.graphicsTierStart !== tier || visual?.graphicsTierEnd !== tier) failures.push("graphics tier mismatch");
    if (!["procedural", "skeletal"].includes(character) || visual?.characterPathStart !== character || visual?.characterPathEnd !== character) failures.push("character path changed");
    if (!finite(visual?.fps) || !finite(visual?.frameMsP95) || !finite(visual?.frameMsP99)) failures.push("frame-time data missing");
    if (resources?.schemaVersion !== 1 || resources?.phase !== "ready" || !(resources?.sampleCount > 0)) failures.push("unpaired/invalid renderer window");
    if (!finite(resources?.drawCallsP95) || !finite(resources?.vramTotalBytesMax)) failures.push("renderer metrics missing");
    const label = visual?.label ?? "";
    if (typeof label !== "string" || !/run[123]$/.test(label)) failures.push("label must end in run1, run2 or run3");
    const key = [revision, device?.platform, device?.id, character, tier].join("|");
    const duplicateKey = key + "|" + label.slice(-4);
    if (seen.has(duplicateKey)) failures.push("duplicate configuration run slot");
    seen.add(duplicateKey);
    if (failures.length) {
      diagnostics.push({ file, reasons: failures });
      continue;
    }
    if (!groups.has(key)) groups.set(key, { revision, device, character, tier, samples: [] });
    groups.get(key).samples.push({ visual, resources, file });
  }
  if (revisionSet.size > 1) errors.push("multiple revisions in the evidence set; compare revisions separately");
  const rows = [...groups.values()].map(({ revision, device, character, tier, samples }) => ({
    revision: revision.slice(0, 12),
    platform: device.platform,
    device: device.id,
    character,
    tier,
    runs: samples.length,
    fpsMedian: med(samples.map((s) => s.visual.fps)),
    frameP95Median: med(samples.map((s) => s.visual.frameMsP95)),
    frameP99Worst: Math.max(...samples.map((s) => s.visual.frameMsP99)),
    drawCallsP95Median: med(samples.map((s) => s.resources.drawCallsP95)),
    vramMaxMiB: Math.max(...samples.map((s) => s.resources.vramTotalBytesMax)) / 1048576,
    profilerDetailRuns: samples.filter((s) => s.resources.detailedStatsAvailable === true).length,
  })).sort((a, b) => a.platform.localeCompare(b.platform) || a.device.localeCompare(b.device) || a.character.localeCompare(b.character) || a.tier.localeCompare(b.tier));
  for (const r of rows) if (r.runs < 3) errors.push(r.platform + "/" + r.device + "/" + r.character + "/" + r.tier + ": fewer than three valid runs");
  for (const p of PLATFORMS) {
    const devices = [...new Set(rows.filter((r) => r.platform === p).map((r) => r.device))];
    if (!devices.length) {
      errors.push("no representative " + p + " evidence");
      continue;
    }
    for (const [character, tier] of REQUIRED) {
      if (!devices.some((id) => rows.some((r) => r.platform === p && r.device === id && r.character === character && r.tier === tier && r.runs >= 3))) {
        errors.push("missing " + p + " " + character + "/" + tier + " three-run configuration");
      }
    }
  }
  return { rows, diagnostics, errors, measurementsComplete: diagnostics.length === 0 && errors.length === 0 };
}

export function renderMarkdown(result) {
  const out = ["# M18 representative-device measurement inventory", "", "**Measurement matrix complete:** " + (result.measurementsComplete ? "YES" : "NO"), "",
    "Completion here covers measurement bookkeeping only. Human readability/accessibility review, first-play inventory, default character/tier decisions and M18 signoff remain separate.", "",
    "| Platform | Device | Chef | Tier | Valid runs | FPS median | Frame p95 median (ms) | Worst p99 (ms) | Draw calls p95 median | VRAM max (MiB) | Profiler runs |",
    "|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|"];
  for (const r of result.rows) out.push("| " + [r.platform, r.device, r.character, r.tier, r.runs, fixed(r.fpsMedian), fixed(r.frameP95Median), fixed(r.frameP99Worst), fixed(r.drawCallsP95Median, 0), fixed(r.vramMaxMiB), r.profilerDetailRuns].join(" | ") + " |");
  out.push("", "## Invalid / diagnostic-only captures");
  if (!result.diagnostics.length) out.push("None.");
  else for (const d of result.diagnostics) out.push("- " + d.file + ": " + d.reasons.join("; "));
  out.push("", "## Missing requirements");
  if (!result.errors.length) out.push("None for the structured measurement matrix.");
  else for (const error of result.errors) out.push("- " + error);
  return out.join("\n") + "\n";
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Usage: node scripts/m18-report.mjs <directory-of-paired-JSON-evidence>");
    process.exitCode = 2;
  } else {
    try {
      const paths = readdirSync(dir).filter((x) => x.endsWith(".json")).sort();
      const entries = paths.map((p) => [p, JSON.parse(readFileSync(resolve(dir, p), "utf8"))]);
      const summary = evaluateEvidence(entries);
      process.stdout.write(renderMarkdown(summary));
      if (!summary.measurementsComplete) process.exitCode = 1;
    } catch (error) {
      console.error(error);
      process.exitCode = 2;
    }
  }
}

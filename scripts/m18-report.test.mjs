import assert from "node:assert/strict";
import test from "node:test";
import { evaluateEvidence, renderMarkdown } from "./m18-report.mjs";

const revision = "a".repeat(40);
const sample = (platform, character, tier, n) => ({
  revision,
  device: { platform, id: platform + "-device", model: "test", cpu: "test", gpu: "test", ram: "test", os: "test", browser: "test", powerMode: "test" },
  visual: { schemaVersion: 1, valid: true, invalidReasons: [], warmupMs: 5000, requestedSampleMs: 30000, minimumFrameSamples: 10,
    sampleCount: 150, requiredPlayerCount: 8, playerCountStart: 8, playerCountEnd: 8,
    requestedGraphicsTier: tier, graphicsTierStart: tier, graphicsTierEnd: tier,
    characterPath: character, characterPathStart: character, characterPathEnd: character,
    label: platform + "-" + character + "-" + tier + "-run" + n, fps: 61, frameMsP95: 18, frameMsP99: 22 },
  resources: { schemaVersion: 1, phase: "ready", sampleCount: 200, drawCallsP95: 140, vramTotalBytesMax: 1048576, detailedStatsAvailable: false },
});

test("refuses missing physical-device evidence and never fabricates metrics", () => {
  const report = evaluateEvidence([]);
  assert.equal(report.measurementsComplete, false);
  assert.match(renderMarkdown(report), /no representative windows evidence/);
});
test("accepts a complete consistent three-run matrix as measurement bookkeeping only", () => {
  const entries = [];
  for (const platform of ["windows", "macos", "tablet"]) {
    for (const [character, tier] of [["procedural", "low"], ["procedural", "medium"], ["procedural", "high"], ["skeletal", "medium"], ["skeletal", "high"]]) {
      for (const n of [1,2,3]) entries.push([String(entries.length) + ".json", sample(platform, character, tier, n)]);
    }
  }
  const report = evaluateEvidence(entries);
  assert.equal(report.measurementsComplete, true);
  assert.equal(report.rows.length, 15);
  assert.equal(report.rows[0].runs, 3);
});
test("rejects headless plumbing overrides, non-eight-player, invalid and duplicate runs", () => {
  const bad = sample("windows", "procedural", "medium", 1);
  bad.visual.minimumFrameSamples = 1;
  bad.visual.playerCountEnd = 7;
  bad.resources.phase = "invalid";
  const result = evaluateEvidence([["bad.json", bad]]);
  assert.equal(result.rows.length, 0);
  assert.match(result.diagnostics[0].reasons.join(" "), /timing\/samples/);
  assert.match(result.diagnostics[0].reasons.join(" "), /eight-player/);
  assert.match(result.diagnostics[0].reasons.join(" "), /renderer/);
});

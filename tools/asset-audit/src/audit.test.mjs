import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { auditManifest, formatAuditReport } from "./audit.mjs";

const RUNTIME_ROOT = "apps/game-client/public/assets/third-party";

test("accepts an approved source with no imported runtime files", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-assets-"));
  try {
    const result = auditManifest(makeManifest(), repoRoot);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.warnings, []);
    assert.equal(result.summary.sourceCount, 1);
    assert.equal(result.summary.assetCount, 0);
    assert.match(formatAuditReport(result), /Result: PASS/);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("blocks runtime assets backed by a source on hold", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-assets-"));
  try {
    const path = `${RUNTIME_ROOT}/held/model.glb`;
    const content = Buffer.from("glTF-held-model");
    writeRuntimeFile(repoRoot, path, content);
    const manifest = makeManifest({
      sources: [
        {
          id: "held-pack",
          name: "Held pack",
          provider: "Example",
          sourceUrl: "https://example.com/pack",
          licenseId: "REVIEW_REQUIRED",
          licenseEvidenceUrl: "https://example.com/license",
          verifiedOn: "2026-08-31",
          status: "hold",
          notes: "License terms require review.",
        },
      ],
      assets: [makeAsset(path, "held-pack", content)],
    });

    const result = auditManifest(manifest, repoRoot);
    assert.ok(result.errors.some((error) => error.includes("not approved for runtime use")));
    assert.ok(result.warnings.some((warning) => warning.includes("on hold")));
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("verifies runtime hashes and first-play budgets", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-assets-"));
  try {
    const path = `${RUNTIME_ROOT}/kenney-food-kit/tomato.glb`;
    const content = Buffer.alloc(80, 7);
    writeRuntimeFile(repoRoot, path, content);
    const manifest = makeManifest({
      budgets: { arena: 64, characters: 100, audio: 100, other: 100, total: 64 },
      assets: [makeAsset(path, "kenney-food-kit", content)],
    });

    const result = auditManifest(manifest, repoRoot);
    assert.ok(result.errors.some((error) => error.includes("First-play arena assets total")));
    assert.ok(result.errors.some((error) => error.includes("hard review threshold")));
    assert.equal(result.summary.firstPlayBytes, 80);

    manifest.budgets.arena = 100;
    manifest.budgets.total = 100;
    manifest.assets[0].sha256 = "0".repeat(64);
    const hashResult = auditManifest(manifest, repoRoot);
    assert.ok(hashResult.errors.some((error) => error.includes("sha256 does not match")));
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("rejects source authoring formats from the runtime asset directory", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-assets-"));
  try {
    const path = `${RUNTIME_ROOT}/kenney-food-kit/tomato.obj`;
    const content = Buffer.from("o tomato");
    writeRuntimeFile(repoRoot, path, content);
    const manifest = makeManifest({ assets: [makeAsset(path, "kenney-food-kit", content)] });

    const result = auditManifest(manifest, repoRoot);
    assert.ok(result.errors.some((error) => error.includes("unsupported model extension '.obj'")));
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

function makeManifest(overrides = {}) {
  return {
    schemaVersion: 1,
    runtimeRoot: RUNTIME_ROOT,
    budgets: { arena: 100, characters: 100, audio: 100, other: 100, total: 400 },
    sources: [
      {
        id: "kenney-food-kit",
        name: "Food Kit",
        provider: "Kenney",
        sourceUrl: "https://kenney.nl/assets/food-kit",
        licenseId: "CC0-1.0",
        licenseEvidenceUrl: "https://kenney.nl/assets/food-kit",
        verifiedOn: "2026-08-31",
        status: "approved",
        notes: "Verified source.",
      },
    ],
    assets: [],
    ...overrides,
  };
}

function makeAsset(path, sourceId, content) {
  return {
    path,
    sourceId,
    kind: "model",
    budgetBucket: "arena",
    firstPlay: true,
    maxBytes: 100,
    sha256: createHash("sha256").update(content).digest("hex"),
  };
}

function writeRuntimeFile(repoRoot, path, content) {
  const fullPath = join(repoRoot, path);
  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, content);
}

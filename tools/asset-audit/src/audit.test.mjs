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
    const path = `${RUNTIME_ROOT}/held/model.gltf`;
    const content = makeGltf();
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
    const path = `${RUNTIME_ROOT}/kenney-food-kit/tomato.gltf`;
    const content = makeGltf();
    writeRuntimeFile(repoRoot, path, content);
    const manifest = makeManifest({
      budgets: {
        arena: content.length - 1,
        characters: 1000,
        audio: 1000,
        other: 1000,
        total: content.length - 1,
      },
      assets: [makeAsset(path, "kenney-food-kit", content, { maxBytes: content.length + 1 })],
    });

    const result = auditManifest(manifest, repoRoot);
    assert.ok(result.errors.some((error) => error.includes("First-play arena assets total")));
    assert.ok(result.errors.some((error) => error.includes("hard review threshold")));
    assert.equal(result.summary.firstPlayBytes, content.length);

    manifest.budgets.arena = content.length + 1;
    manifest.budgets.total = content.length + 1;
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

test("enforces explicit triangle, primitive, material, texture, and animation ceilings", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-assets-"));
  try {
    const path = `${RUNTIME_ROOT}/kenney-food-kit/heavy.gltf`;
    const content = makeGltf({
      accessors: [{ count: 300 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
      materials: [{}, {}],
      textures: [{}, {}],
      animations: [{}, {}],
    });
    writeRuntimeFile(repoRoot, path, content);
    const asset = makeAsset(path, "kenney-food-kit", content, {
      maxBytes: content.length + 1,
      maxTriangles: 50,
      maxPrimitives: 0,
      maxMaterials: 1,
      maxTextures: 1,
      maxAnimations: 1,
    });
    const manifest = makeManifest({
      budgets: { arena: 10_000, characters: 10_000, audio: 10_000, other: 10_000, total: 40_000 },
      assets: [asset],
    });

    const result = auditManifest(manifest, repoRoot);
    assert.ok(result.errors.some((error) => error.includes("100 triangles; limit is 50")));
    assert.ok(result.errors.some((error) => error.includes("1 primitives; limit is 0")));
    assert.ok(result.errors.some((error) => error.includes("2 materials; limit is 1")));
    assert.ok(result.errors.some((error) => error.includes("2 textures; limit is 1")));
    assert.ok(result.errors.some((error) => error.includes("2 animations; limit is 1")));
    assert.equal(result.summary.modelCount, 1);
    assert.equal(result.summary.modelTriangles, 100);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

function makeManifest(overrides = {}) {
  return {
    schemaVersion: 1,
    runtimeRoot: RUNTIME_ROOT,
    budgets: { arena: 1000, characters: 1000, audio: 1000, other: 1000, total: 4000 },
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

function makeAsset(path, sourceId, content, overrides = {}) {
  return {
    path,
    sourceId,
    kind: "model",
    budgetBucket: "arena",
    firstPlay: true,
    maxBytes: Math.max(1000, content.length + 1),
    maxTriangles: 5000,
    maxPrimitives: 20,
    maxMaterials: 10,
    maxTextures: 10,
    maxAnimations: 10,
    sha256: createHash("sha256").update(content).digest("hex"),
    ...overrides,
  };
}

function makeGltf(overrides = {}) {
  return Buffer.from(JSON.stringify({ asset: { version: "2.0" }, ...overrides }));
}

function writeRuntimeFile(repoRoot, path, content) {
  const fullPath = join(repoRoot, path);
  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, content);
}

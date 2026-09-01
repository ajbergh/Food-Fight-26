import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { auditSkeletalContracts, formatSkeletalAuditReport } from "./skeletal.mjs";

const RUNTIME_ROOT = "apps/game-client/public/assets/third-party";

test("accepts a skinned model with the canonical pilot clips", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-skeletal-"));
  try {
    const path = `${RUNTIME_ROOT}/kaykit-adventurers/chef-pilot.gltf`;
    writeModel(repoRoot, path, {
      asset: { version: "2.0" },
      skins: [{}],
      animations: [
        { name: "idle" },
        { name: "walk" },
        { name: "run" },
        { name: "throw-food" },
      ],
    });

    const result = auditSkeletalContracts(makeManifest(path), repoRoot);
    assert.deepEqual(result.errors, []);
    assert.equal(result.checked.length, 1);
    assert.match(formatSkeletalAuditReport(result), /Result: PASS/);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("rejects a pilot without a skin or required locomotion clips", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-skeletal-"));
  try {
    const path = `${RUNTIME_ROOT}/kaykit-adventurers/chef-pilot.gltf`;
    writeModel(repoRoot, path, {
      asset: { version: "2.0" },
      animations: [{ name: "idle" }, { name: "walk" }],
    });

    const result = auditSkeletalContracts(makeManifest(path), repoRoot);
    assert.ok(result.errors.some((error) => error.includes("requires at least 1 skin")));
    assert.ok(result.errors.some((error) => error.includes("requires animation 'run'")));
    assert.ok(result.errors.some((error) => error.includes("requires animation 'throw_food'")));
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("validates skeletal contract shape", () => {
  const result = auditSkeletalContracts({
    assets: [{ kind: "texture", path: "x.ktx2", skeletal: { minSkins: 0, requiredAnimations: [] } }],
  }, "/tmp");
  assert.ok(result.errors.some((error) => error.includes("only valid for model assets")));
});

function makeManifest(path) {
  return {
    assets: [
      {
        path,
        kind: "model",
        skeletal: {
          minSkins: 1,
          requiredAnimations: ["idle", "walk", "run", "throw_food"],
        },
      },
    ],
  };
}

function writeModel(repoRoot, path, document) {
  const fullPath = join(repoRoot, path);
  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, JSON.stringify(document));
}

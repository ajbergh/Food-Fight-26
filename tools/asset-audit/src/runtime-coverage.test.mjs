import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { findUnmanifestedRuntimeAssets } from "./runtime-coverage.mjs";

const RUNTIME_ROOT = "apps/game-client/public/assets/third-party";

test("finds supported runtime assets that are not declared in the manifest", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-runtime-coverage-"));
  try {
    const tracked = `${RUNTIME_ROOT}/pack/tracked.glb`;
    const untracked = `${RUNTIME_ROOT}/pack/untracked.glb`;
    writeRuntimeFile(repoRoot, tracked);
    writeRuntimeFile(repoRoot, untracked);

    const result = findUnmanifestedRuntimeAssets(
      {
        runtimeRoot: RUNTIME_ROOT,
        assets: [{ path: tracked }],
      },
      repoRoot,
    );

    assert.deepEqual(result, [untracked]);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test("ignores non-runtime documentation files and absent runtime roots", () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "foodfight-runtime-coverage-"));
  try {
    assert.deepEqual(
      findUnmanifestedRuntimeAssets({ runtimeRoot: RUNTIME_ROOT, assets: [] }, repoRoot),
      [],
    );

    writeRuntimeFile(repoRoot, `${RUNTIME_ROOT}/pack/README.txt`);
    assert.deepEqual(
      findUnmanifestedRuntimeAssets({ runtimeRoot: RUNTIME_ROOT, assets: [] }, repoRoot),
      [],
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

function writeRuntimeFile(repoRoot, path) {
  const fullPath = join(repoRoot, path);
  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, Buffer.from("runtime-asset"));
}

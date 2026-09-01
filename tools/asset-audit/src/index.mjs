import { appendFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { auditManifest, formatAuditReport, loadManifest } from "./audit.mjs";
import { auditSkeletalContracts, formatSkeletalAuditReport } from "./skeletal.mjs";

const manifestPath = resolve(process.argv[2] ?? "../../assets/third-party/manifest.json");
const repoRoot = findRepoRoot(dirname(manifestPath));

if (!repoRoot) {
  console.error(`Could not locate repository root above ${manifestPath}.`);
  process.exitCode = 1;
} else {
  try {
    const manifest = loadManifest(manifestPath);
    const result = auditManifest(manifest, repoRoot);
    const skeletalResult = auditSkeletalContracts(manifest, repoRoot);
    const report = `${formatAuditReport(result)}\n${formatSkeletalAuditReport(skeletalResult)}`;
    process.stdout.write(report);

    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
    }

    if (result.errors.length > 0 || skeletalResult.errors.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`Asset audit failed to read ${manifestPath}:`, error);
    process.exitCode = 1;
  }
}

function findRepoRoot(start) {
  let current = resolve(start);
  while (true) {
    if (existsSync(join(current, "pnpm-workspace.yaml"))) return current;
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

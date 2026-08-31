import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, isAbsolute, resolve } from "node:path";

const SOURCE_STATUSES = new Set(["approved", "hold", "rejected"]);
const ASSET_KINDS = new Set(["model", "texture", "audio"]);
const BUDGET_BUCKETS = ["arena", "characters", "audio", "other"];
const EXTENSIONS_BY_KIND = Object.freeze({
  model: new Set([".glb", ".gltf"]),
  texture: new Set([".ktx2", ".basis"]),
  audio: new Set([".ogg", ".mp3", ".webm"]),
});
const SOURCE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function loadManifest(manifestPath) {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

export function auditManifest(manifest, repoRoot) {
  const errors = [];
  const warnings = [];
  const summary = {
    sourceCount: 0,
    approvedSourceCount: 0,
    heldSourceCount: 0,
    assetCount: 0,
    firstPlayBytes: 0,
    firstPlayByBucket: Object.fromEntries(BUDGET_BUCKETS.map((bucket) => [bucket, 0])),
    budgets: Object.fromEntries([...BUDGET_BUCKETS, "total"].map((bucket) => [bucket, 0])),
  };

  if (!isRecord(manifest)) {
    errors.push("Manifest root must be a JSON object.");
    return { errors, warnings, summary };
  }

  if (manifest.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1.");
  }

  const runtimeRoot = normalizeRelativePath(manifest.runtimeRoot);
  if (!runtimeRoot) {
    errors.push("runtimeRoot must be a repository-relative path.");
  }

  validateBudgets(manifest.budgets, errors, summary);

  const sources = Array.isArray(manifest.sources) ? manifest.sources : [];
  if (!Array.isArray(manifest.sources)) errors.push("sources must be an array.");
  summary.sourceCount = sources.length;

  const sourceMap = new Map();
  for (const [index, source] of sources.entries()) {
    const label = `sources[${index}]`;
    if (!isRecord(source)) {
      errors.push(`${label} must be an object.`);
      continue;
    }

    const id = typeof source.id === "string" ? source.id : "";
    if (!SOURCE_ID_PATTERN.test(id)) {
      errors.push(`${label}.id must use lowercase letters, numbers, and hyphens.`);
    } else if (sourceMap.has(id)) {
      errors.push(`Source id '${id}' is duplicated.`);
    } else {
      sourceMap.set(id, source);
    }

    requireString(source, "name", label, errors);
    requireString(source, "provider", label, errors);
    requireHttpsUrl(source, "sourceUrl", label, errors);
    requireString(source, "licenseId", label, errors);
    requireHttpsUrl(source, "licenseEvidenceUrl", label, errors);

    if (typeof source.verifiedOn !== "string" || !ISO_DATE_PATTERN.test(source.verifiedOn)) {
      errors.push(`${label}.verifiedOn must use YYYY-MM-DD.`);
    }

    if (!SOURCE_STATUSES.has(source.status)) {
      errors.push(`${label}.status must be approved, hold, or rejected.`);
    } else if (source.status === "approved") {
      summary.approvedSourceCount += 1;
      if (source.licenseId === "REVIEW_REQUIRED") {
        errors.push(`${label} cannot be approved while licenseId is REVIEW_REQUIRED.`);
      }
    } else if (source.status === "hold") {
      summary.heldSourceCount += 1;
      warnings.push(`Source '${id || label}' is on hold and cannot back runtime assets.`);
    }

    if (source.status !== "approved" && (typeof source.notes !== "string" || source.notes.trim() === "")) {
      errors.push(`${label}.notes is required for hold/rejected sources.`);
    }
  }

  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
  if (!Array.isArray(manifest.assets)) errors.push("assets must be an array.");
  summary.assetCount = assets.length;

  const assetPaths = new Set();
  for (const [index, asset] of assets.entries()) {
    const label = `assets[${index}]`;
    if (!isRecord(asset)) {
      errors.push(`${label} must be an object.`);
      continue;
    }

    const assetPath = normalizeRelativePath(asset.path);
    if (!assetPath) {
      errors.push(`${label}.path must be a repository-relative path.`);
    } else {
      if (assetPaths.has(assetPath)) errors.push(`Asset path '${assetPath}' is duplicated.`);
      assetPaths.add(assetPath);
      if (runtimeRoot && !assetPath.startsWith(`${runtimeRoot}/`)) {
        errors.push(`${label}.path must live under ${runtimeRoot}/.`);
      }
    }

    const source = sourceMap.get(asset.sourceId);
    if (!source) {
      errors.push(`${label}.sourceId references unknown source '${asset.sourceId ?? ""}'.`);
    } else if (source.status !== "approved") {
      errors.push(`${label}.sourceId '${asset.sourceId}' is not approved for runtime use.`);
    }

    if (!ASSET_KINDS.has(asset.kind)) {
      errors.push(`${label}.kind must be model, texture, or audio.`);
    } else if (assetPath) {
      const extension = extname(assetPath).toLowerCase();
      if (!EXTENSIONS_BY_KIND[asset.kind].has(extension)) {
        errors.push(`${label}.path has unsupported ${asset.kind} extension '${extension || "(none)"}'.`);
      }
    }

    if (!BUDGET_BUCKETS.includes(asset.budgetBucket)) {
      errors.push(`${label}.budgetBucket must be arena, characters, audio, or other.`);
    }
    if (asset.kind === "audio" && asset.budgetBucket !== "audio") {
      errors.push(`${label} audio assets must use the audio budget bucket.`);
    }
    if (asset.kind !== "audio" && asset.budgetBucket === "audio") {
      errors.push(`${label} non-audio assets cannot use the audio budget bucket.`);
    }

    if (typeof asset.firstPlay !== "boolean") {
      errors.push(`${label}.firstPlay must be a boolean.`);
    }
    if (!Number.isInteger(asset.maxBytes) || asset.maxBytes <= 0) {
      errors.push(`${label}.maxBytes must be a positive integer.`);
    }
    if (typeof asset.sha256 !== "string" || !SHA256_PATTERN.test(asset.sha256)) {
      errors.push(`${label}.sha256 must be a lowercase SHA-256 hex digest.`);
    }

    if (!assetPath) continue;
    const fullPath = resolve(repoRoot, assetPath);
    if (!existsSync(fullPath)) {
      errors.push(`${label}.path '${assetPath}' does not exist.`);
      continue;
    }

    const stat = statSync(fullPath);
    if (!stat.isFile()) {
      errors.push(`${label}.path '${assetPath}' is not a file.`);
      continue;
    }

    if (Number.isInteger(asset.maxBytes) && asset.maxBytes > 0 && stat.size > asset.maxBytes) {
      errors.push(`${label}.path is ${formatBytes(stat.size)}; per-asset limit is ${formatBytes(asset.maxBytes)}.`);
    }

    if (typeof asset.sha256 === "string" && SHA256_PATTERN.test(asset.sha256)) {
      const digest = createHash("sha256").update(readFileSync(fullPath)).digest("hex");
      if (digest !== asset.sha256) {
        errors.push(`${label}.sha256 does not match '${assetPath}'.`);
      }
    }

    if (asset.firstPlay === true && BUDGET_BUCKETS.includes(asset.budgetBucket)) {
      summary.firstPlayBytes += stat.size;
      summary.firstPlayByBucket[asset.budgetBucket] += stat.size;
    }
  }

  for (const bucket of BUDGET_BUCKETS) {
    const budget = summary.budgets[bucket];
    const used = summary.firstPlayByBucket[bucket];
    if (budget > 0 && used > budget) {
      errors.push(`First-play ${bucket} assets total ${formatBytes(used)}; budget is ${formatBytes(budget)}.`);
    }
  }
  if (summary.budgets.total > 0 && summary.firstPlayBytes > summary.budgets.total) {
    errors.push(
      `First-play third-party assets total ${formatBytes(summary.firstPlayBytes)}; hard review threshold is ${formatBytes(summary.budgets.total)}.`,
    );
  }

  return { errors, warnings, summary };
}

export function formatAuditReport(result) {
  const { errors, warnings, summary } = result;
  const lines = [
    "## Third-party asset audit",
    "",
    `- Sources: ${summary.sourceCount} (${summary.approvedSourceCount} approved, ${summary.heldSourceCount} hold)`,
    `- Runtime assets: ${summary.assetCount}`,
    `- First-play third-party payload: ${formatBytes(summary.firstPlayBytes)} / ${formatBytes(summary.budgets.total)} hard review threshold`,
  ];

  for (const bucket of BUDGET_BUCKETS) {
    lines.push(
      `- ${capitalize(bucket)}: ${formatBytes(summary.firstPlayByBucket[bucket])} / ${formatBytes(summary.budgets[bucket])}`,
    );
  }

  if (warnings.length > 0) {
    lines.push("", "Warnings:", ...warnings.map((warning) => `- ${warning}`));
  }
  if (errors.length > 0) {
    lines.push("", "Failures:", ...errors.map((error) => `- ${error}`));
  }
  lines.push("", `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`);
  return `${lines.join("\n")}\n`;
}

export function formatBytes(bytes) {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} kB`;
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

function validateBudgets(value, errors, summary) {
  if (!isRecord(value)) {
    errors.push("budgets must be an object.");
    return;
  }

  for (const bucket of [...BUDGET_BUCKETS, "total"]) {
    const budget = value[bucket];
    if (!Number.isInteger(budget) || budget <= 0) {
      errors.push(`budgets.${bucket} must be a positive integer byte count.`);
    } else {
      summary.budgets[bucket] = budget;
    }
  }
}

function normalizeRelativePath(value) {
  if (typeof value !== "string" || value.trim() === "" || isAbsolute(value)) return "";
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/+$/, "");
  if (normalized === "" || normalized === "." || normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) {
    return "";
  }
  return normalized;
}

function requireString(record, key, label, errors) {
  if (typeof record[key] !== "string" || record[key].trim() === "") {
    errors.push(`${label}.${key} must be a non-empty string.`);
  }
}

function requireHttpsUrl(record, key, label, errors) {
  try {
    const url = new URL(record[key]);
    if (url.protocol !== "https:") throw new Error("HTTPS required");
  } catch {
    errors.push(`${label}.${key} must be a valid HTTPS URL.`);
  }
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

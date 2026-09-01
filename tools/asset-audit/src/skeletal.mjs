import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { inspectModelFile } from "./gltf.mjs";

export function auditSkeletalContracts(manifest, repoRoot) {
  const errors = [];
  const checked = [];
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];

  for (const [index, asset] of assets.entries()) {
    if (!asset || typeof asset !== "object" || asset.skeletal === undefined) continue;
    const label = `assets[${index}].skeletal`;
    const contract = asset.skeletal;

    if (asset.kind !== "model") {
      errors.push(`${label} is only valid for model assets.`);
      continue;
    }
    if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
      errors.push(`${label} must be an object.`);
      continue;
    }

    const minSkins = contract.minSkins;
    if (!Number.isInteger(minSkins) || minSkins < 1) {
      errors.push(`${label}.minSkins must be a positive integer.`);
    }

    const requiredAnimations = contract.requiredAnimations;
    if (!Array.isArray(requiredAnimations) || requiredAnimations.length === 0) {
      errors.push(`${label}.requiredAnimations must be a non-empty array.`);
    } else {
      const normalized = requiredAnimations.map((name) => typeof name === "string" ? name.trim() : "");
      if (normalized.some((name) => name.length === 0)) {
        errors.push(`${label}.requiredAnimations must contain only non-empty strings.`);
      }
      if (new Set(normalized).size !== normalized.length) {
        errors.push(`${label}.requiredAnimations must not contain duplicates.`);
      }
    }

    if (typeof asset.path !== "string" || asset.path.trim() === "") continue;
    const fullPath = resolve(repoRoot, asset.path);
    if (!existsSync(fullPath) || !statSync(fullPath).isFile()) continue;

    const inspection = inspectModelFile(fullPath);
    if (inspection.errors.length > 0) continue;
    const metrics = inspection.metrics;
    checked.push({ path: asset.path, skins: metrics.skins, animationNames: metrics.animationNames });

    if (Number.isInteger(minSkins) && minSkins >= 1 && metrics.skins < minSkins) {
      errors.push(`${label} requires at least ${minSkins} skin(s); model has ${metrics.skins}.`);
    }

    if (Array.isArray(requiredAnimations)) {
      const available = new Set(metrics.animationNames.map(normalizeClipName));
      for (const required of requiredAnimations) {
        if (typeof required !== "string" || required.trim() === "") continue;
        if (!available.has(normalizeClipName(required))) {
          const names = metrics.animationNames.length > 0 ? metrics.animationNames.join(", ") : "(none)";
          errors.push(`${label} requires animation '${required.trim()}'; available named clips: ${names}.`);
        }
      }
    }
  }

  return { errors, checked };
}

export function formatSkeletalAuditReport(result) {
  const lines = [
    "## Skeletal asset contract",
    "",
    `- Contracted models checked: ${result.checked.length}`,
  ];
  for (const model of result.checked) {
    lines.push(`- ${model.path}: ${model.skins} skin(s); clips: ${model.animationNames.join(", ") || "(none)"}`);
  }
  if (result.errors.length > 0) {
    lines.push("", "Failures:", ...result.errors.map((error) => `- ${error}`));
  }
  lines.push("", `Result: ${result.errors.length === 0 ? "PASS" : "FAIL"}`);
  return `${lines.join("\n")}\n`;
}

function normalizeClipName(value) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

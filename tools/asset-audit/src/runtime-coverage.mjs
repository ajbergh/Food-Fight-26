import { existsSync, readdirSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

const RUNTIME_ASSET_EXTENSIONS = new Set([
  ".glb",
  ".gltf",
  ".ktx2",
  ".basis",
  ".ogg",
  ".mp3",
  ".webm",
]);

export function findUnmanifestedRuntimeAssets(manifest, repoRoot) {
  if (!isRecord(manifest) || !Array.isArray(manifest.assets)) return [];

  const runtimeRoot = normalizeRelativePath(manifest.runtimeRoot);
  if (!runtimeRoot) return [];

  const absoluteRepoRoot = resolve(repoRoot);
  const absoluteRuntimeRoot = resolve(absoluteRepoRoot, runtimeRoot);
  if (!isInsideRoot(absoluteRepoRoot, absoluteRuntimeRoot) || !existsSync(absoluteRuntimeRoot)) {
    return [];
  }

  const declared = new Set(
    manifest.assets
      .map((asset) => (isRecord(asset) ? normalizeRelativePath(asset.path) : ""))
      .filter(Boolean),
  );

  const unmanifested = [];
  walkRuntimeDirectory(absoluteRuntimeRoot, absoluteRepoRoot, declared, unmanifested);
  return unmanifested.sort();
}

function walkRuntimeDirectory(directory, repoRoot, declared, unmanifested) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      walkRuntimeDirectory(fullPath, repoRoot, declared, unmanifested);
      continue;
    }
    if (!entry.isFile()) continue;

    const extension = extensionOf(entry.name);
    if (!RUNTIME_ASSET_EXTENSIONS.has(extension)) continue;

    const repoRelativePath = relative(repoRoot, fullPath).split(sep).join("/");
    if (!declared.has(repoRelativePath)) unmanifested.push(repoRelativePath);
  }
}

function extensionOf(fileName) {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

function normalizeRelativePath(value) {
  if (typeof value !== "string" || value.trim() === "" || isAbsolute(value)) return "";
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/+$/, "");
  if (
    normalized === "" ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    return "";
  }
  return normalized;
}

function isInsideRoot(root, candidate) {
  const relativePath = relative(root, candidate);
  return relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath));
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

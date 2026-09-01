import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";

const GLB_MAGIC = 0x46546c67;
const GLB_JSON_CHUNK = 0x4e4f534a;
const TRIANGLES = 4;
const TRIANGLE_STRIP = 5;
const TRIANGLE_FAN = 6;

export function inspectModelFile(fullPath) {
  const errors = [];
  let document;

  try {
    document = readGltfDocument(fullPath);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { errors, metrics: emptyMetrics() };
  }

  if (!isObject(document)) {
    errors.push("glTF root must be a JSON object.");
    return { errors, metrics: emptyMetrics() };
  }
  if (!isObject(document.asset) || document.asset.version !== "2.0") {
    errors.push("glTF asset.version must be exactly '2.0'.");
  }

  errors.push(...validateResourceUris(document, fullPath));
  return { errors, metrics: summarizeGltf(document) };
}

export function readGltfDocument(fullPath) {
  const extension = extname(fullPath).toLowerCase();
  if (extension === ".gltf") {
    return JSON.parse(readFileSync(fullPath, "utf8"));
  }
  if (extension === ".glb") {
    return parseGlb(readFileSync(fullPath));
  }
  throw new Error(`Unsupported glTF model extension '${extension || "(none)"}'.`);
}

export function parseGlb(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new TypeError("GLB input must be a Buffer.");
  if (buffer.length < 20) throw new Error("GLB is too small to contain a header and JSON chunk.");

  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const declaredLength = buffer.readUInt32LE(8);
  if (magic !== GLB_MAGIC) throw new Error("GLB header magic is invalid.");
  if (version !== 2) throw new Error(`GLB version ${version} is unsupported; expected version 2.`);
  if (declaredLength !== buffer.length) {
    throw new Error(`GLB declared length ${declaredLength} does not match file length ${buffer.length}.`);
  }
  if (declaredLength % 4 !== 0) throw new Error("GLB file length must be 4-byte aligned.");

  let offset = 12;
  let jsonChunk;
  let chunkIndex = 0;
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) throw new Error("GLB chunk header is truncated.");
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    offset += 8;
    if (chunkLength % 4 !== 0) throw new Error("GLB chunk lengths must be 4-byte aligned.");
    if (offset + chunkLength > buffer.length) throw new Error("GLB chunk extends beyond the declared file length.");
    if (chunkIndex === 0 && chunkType !== GLB_JSON_CHUNK) {
      throw new Error("GLB first chunk must be the JSON chunk.");
    }
    if (chunkType === GLB_JSON_CHUNK) {
      if (jsonChunk !== undefined) throw new Error("GLB contains more than one JSON chunk.");
      jsonChunk = buffer.subarray(offset, offset + chunkLength);
    }
    offset += chunkLength;
    chunkIndex += 1;
  }

  if (offset !== buffer.length) throw new Error("GLB chunk layout does not consume the complete file.");
  if (!jsonChunk) throw new Error("GLB does not contain a JSON chunk.");

  const json = jsonChunk.toString("utf8").replace(/[\u0000\u0020]+$/u, "");
  if (json.length === 0) throw new Error("GLB JSON chunk is empty.");
  return JSON.parse(json);
}

export function summarizeGltf(document) {
  const accessors = Array.isArray(document.accessors) ? document.accessors : [];
  const meshes = Array.isArray(document.meshes) ? document.meshes : [];
  const animationEntries = Array.isArray(document.animations) ? document.animations : [];
  let primitives = 0;
  let triangles = 0;

  for (const mesh of meshes) {
    if (!mesh || !Array.isArray(mesh.primitives)) continue;
    for (const primitive of mesh.primitives) {
      primitives += 1;
      const count = primitiveElementCount(primitive, accessors);
      const mode = Number.isInteger(primitive?.mode) ? primitive.mode : TRIANGLES;
      if (mode === TRIANGLES) triangles += Math.floor(count / 3);
      if (mode === TRIANGLE_STRIP || mode === TRIANGLE_FAN) triangles += Math.max(0, count - 2);
    }
  }

  return {
    meshes: meshes.length,
    primitives,
    triangles,
    materials: arrayLength(document.materials),
    textures: arrayLength(document.textures),
    images: arrayLength(document.images),
    animations: animationEntries.length,
    animationNames: animationEntries
      .map((animation) => (typeof animation?.name === "string" ? animation.name.trim() : ""))
      .filter((name) => name.length > 0),
    skins: arrayLength(document.skins),
  };
}

export function validateResourceUris(document, fullPath) {
  const errors = [];
  const modelDirectory = dirname(fullPath);
  const resources = [
    ...collectUris(document.buffers, "buffer"),
    ...collectUris(document.images, "image"),
  ];

  if (extname(fullPath).toLowerCase() === ".gltf" && Array.isArray(document.buffers)) {
    document.buffers.forEach((buffer, index) => {
      if (isObject(buffer) && typeof buffer.uri !== "string") {
        errors.push(`buffer[${index}] in a .gltf file must declare a local or embedded URI.`);
      }
    });
  }

  for (const resource of resources) {
    const { uri, label } = resource;
    if (uri.startsWith("data:")) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(uri) || uri.startsWith("//")) {
      errors.push(`${label} URI '${uri}' must not reference a remote resource.`);
      continue;
    }

    let decoded;
    try {
      decoded = decodeURIComponent(uri.split(/[?#]/, 1)[0]);
    } catch {
      errors.push(`${label} URI '${uri}' contains invalid percent encoding.`);
      continue;
    }

    if (decoded === "" || isAbsolute(decoded)) {
      errors.push(`${label} URI '${uri}' must be a relative file path or data URI.`);
      continue;
    }

    const target = resolve(modelDirectory, decoded);
    const pathFromModel = relative(modelDirectory, target);
    if (pathFromModel === ".." || pathFromModel.startsWith(`..${sep}`) || isAbsolute(pathFromModel)) {
      errors.push(`${label} URI '${uri}' escapes the model asset directory.`);
      continue;
    }
    if (!existsSync(target) || !statSync(target).isFile()) {
      errors.push(`${label} URI '${uri}' does not resolve to a committed file beside the model.`);
    }
  }

  return errors;
}

function primitiveElementCount(primitive, accessors) {
  if (!primitive || typeof primitive !== "object") return 0;
  if (Number.isInteger(primitive.indices)) return accessorCount(accessors, primitive.indices);
  const positionAccessor = primitive.attributes?.POSITION;
  if (Number.isInteger(positionAccessor)) return accessorCount(accessors, positionAccessor);
  return 0;
}

function accessorCount(accessors, index) {
  const accessor = accessors[index];
  return Number.isInteger(accessor?.count) && accessor.count >= 0 ? accessor.count : 0;
}

function collectUris(entries, kind) {
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry, index) =>
    typeof entry?.uri === "string" && entry.uri.length > 0
      ? [{ uri: entry.uri, label: `${kind}[${index}]` }]
      : [],
  );
}

function arrayLength(value) {
  return Array.isArray(value) ? value.length : 0;
}

function emptyMetrics() {
  return {
    meshes: 0,
    primitives: 0,
    triangles: 0,
    materials: 0,
    textures: 0,
    images: 0,
    animations: 0,
    animationNames: [],
    skins: 0,
  };
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

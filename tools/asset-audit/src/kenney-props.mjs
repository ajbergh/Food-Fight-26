import { createHash } from "node:crypto";

const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

export function gitBlobSha1(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return createHash("sha1")
    .update(`blob ${buffer.length}\0`, "utf8")
    .update(buffer)
    .digest("hex");
}

export function embedExternalImage(
  source,
  imageBytes,
  imageUri = "Textures/colormap.png",
  mimeType = "image/png",
) {
  const chunks = parseChunks(source);
  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  const binChunk = chunks.find((chunk) => chunk.type === BIN_CHUNK);
  if (!jsonChunk) throw new Error("Source GLB does not contain a JSON chunk.");
  if (!binChunk) throw new Error("Source GLB does not contain a BIN chunk.");

  const document = JSON.parse(
    jsonChunk.data.toString("utf8").replace(/[\u0000 ]+$/u, ""),
  );
  if (document?.asset?.version !== "2.0") {
    throw new Error(
      `Expected a glTF 2.0 asset; found '${document?.asset?.version ?? "unknown"}'.`,
    );
  }
  if (!Array.isArray(document.buffers) || document.buffers.length !== 1) {
    throw new Error("Kenney prop derivation expects exactly one GLB buffer.");
  }

  const logicalBinLength = document.buffers[0]?.byteLength;
  if (
    !Number.isInteger(logicalBinLength) ||
    logicalBinLength < 0 ||
    logicalBinLength > binChunk.data.length
  ) {
    throw new Error("Source GLB declares an invalid binary buffer length.");
  }

  const images = Array.isArray(document.images) ? document.images : [];
  const matches = images.filter((image) => image?.uri === imageUri);
  if (matches.length === 0) {
    throw new Error(`Source GLB does not reference expected image '${imageUri}'.`);
  }

  const image = Buffer.isBuffer(imageBytes)
    ? imageBytes
    : Buffer.from(imageBytes);
  const imageOffset = alignToFour(logicalBinLength);
  const logicalOutputLength = imageOffset + image.length;
  const outputBin = Buffer.alloc(alignToFour(logicalOutputLength));
  binChunk.data.subarray(0, logicalBinLength).copy(outputBin, 0);
  image.copy(outputBin, imageOffset);

  const bufferViews = Array.isArray(document.bufferViews)
    ? document.bufferViews
    : [];
  document.bufferViews = bufferViews;
  const imageBufferView = bufferViews.length;
  bufferViews.push({
    buffer: 0,
    byteOffset: imageOffset,
    byteLength: image.length,
  });

  for (const entry of matches) {
    delete entry.uri;
    entry.bufferView = imageBufferView;
    entry.mimeType = mimeType;
  }

  document.buffers[0].byteLength = logicalOutputLength;
  binChunk.data = outputBin;

  const json = Buffer.from(JSON.stringify(document), "utf8");
  const paddedJson = Buffer.alloc(alignToFour(json.length), 0x20);
  json.copy(paddedJson);
  jsonChunk.data = paddedJson;

  return encodeChunks(chunks);
}

function parseChunks(source) {
  const buffer = Buffer.isBuffer(source) ? source : Buffer.from(source);
  if (buffer.length < 20) throw new Error("Source GLB is too short.");
  if (buffer.readUInt32LE(0) !== GLB_MAGIC) {
    throw new Error("Source GLB has an invalid magic header.");
  }
  if (buffer.readUInt32LE(4) !== GLB_VERSION) {
    throw new Error("Source GLB is not version 2.");
  }
  if (buffer.readUInt32LE(8) !== buffer.length) {
    throw new Error("Source GLB declared length does not match its bytes.");
  }

  const chunks = [];
  let offset = 12;
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) {
      throw new Error("Source GLB has a truncated chunk header.");
    }
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const end = offset + 8 + length;
    if (length % 4 !== 0) {
      throw new Error("Source GLB chunk lengths must be 4-byte aligned.");
    }
    if (end > buffer.length) {
      throw new Error("Source GLB has a truncated chunk payload.");
    }
    chunks.push({
      type,
      data: Buffer.from(buffer.subarray(offset + 8, end)),
    });
    offset = end;
  }
  return chunks;
}

function encodeChunks(chunks) {
  const length =
    12 + chunks.reduce((total, chunk) => total + 8 + chunk.data.length, 0);
  const output = Buffer.alloc(length);
  output.writeUInt32LE(GLB_MAGIC, 0);
  output.writeUInt32LE(GLB_VERSION, 4);
  output.writeUInt32LE(length, 8);

  let offset = 12;
  for (const chunk of chunks) {
    output.writeUInt32LE(chunk.data.length, offset);
    output.writeUInt32LE(chunk.type, offset + 4);
    chunk.data.copy(output, offset + 8);
    offset += 8 + chunk.data.length;
  }
  return output;
}

function alignToFour(value) {
  return Math.ceil(value / 4) * 4;
}

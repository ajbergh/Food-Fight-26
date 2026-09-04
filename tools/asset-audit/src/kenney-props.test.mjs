import assert from "node:assert/strict";
import { test } from "node:test";
import { parseGlb } from "./gltf.mjs";
import { embedExternalImage, gitBlobSha1 } from "./kenney-props.mjs";

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

test("gitBlobSha1 matches Git object framing", () => {
  assert.equal(
    gitBlobSha1(Buffer.from("hello\n", "utf8")),
    "ce013625030ba8dba906f756967f9e9ca394464a",
  );
});

test("embedExternalImage converts a relative PNG URI into a self-contained GLB", () => {
  const source = createFixtureGlb();
  const image = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
  const output = embedExternalImage(source, image);
  const document = parseGlb(output);

  assert.equal(document.images[0].uri, undefined);
  assert.equal(document.images[0].mimeType, "image/png");
  assert.equal(document.images[0].bufferView, 1);
  assert.equal(document.bufferViews[1].byteLength, image.length);
  assert.equal(document.bufferViews[1].byteOffset % 4, 0);
  assert.equal(document.buffers[0].byteLength, 4 + image.length);
});

function createFixtureGlb() {
  const document = {
    asset: { version: "2.0" },
    buffers: [{ byteLength: 4 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 4 }],
    images: [{ uri: "Textures/colormap.png", name: "colormap" }],
  };
  const json = Buffer.from(JSON.stringify(document), "utf8");
  const jsonChunk = Buffer.alloc(align4(json.length), 0x20);
  json.copy(jsonChunk);
  const binChunk = Buffer.from([1, 2, 3, 4]);
  return encodeGlb([
    { type: JSON_CHUNK, data: jsonChunk },
    { type: BIN_CHUNK, data: binChunk },
  ]);
}

function encodeGlb(chunks) {
  const length =
    12 + chunks.reduce((total, chunk) => total + 8 + chunk.data.length, 0);
  const output = Buffer.alloc(length);
  output.writeUInt32LE(0x46546c67, 0);
  output.writeUInt32LE(2, 4);
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

function align4(value) {
  return Math.ceil(value / 4) * 4;
}

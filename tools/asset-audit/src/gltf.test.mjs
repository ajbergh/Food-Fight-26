import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectModelFile, parseGlb, summarizeGltf } from "./gltf.mjs";

test("parses GLB 2.0 JSON chunks and summarizes production structure", () => {
  const document = {
    asset: { version: "2.0" },
    accessors: [{ count: 12 }, { count: 6 }],
    meshes: [
      {
        primitives: [
          { indices: 0, mode: 4, material: 0 },
          { attributes: { POSITION: 1 }, mode: 5, material: 1 },
        ],
      },
    ],
    materials: [{}, {}],
    textures: [{}],
    images: [{}],
    animations: [{}],
    skins: [{}],
  };

  const parsed = parseGlb(makeGlb(document));
  assert.equal(parsed.asset.version, "2.0");
  assert.deepEqual(summarizeGltf(parsed), {
    meshes: 1,
    primitives: 2,
    triangles: 8,
    materials: 2,
    textures: 1,
    images: 1,
    animations: 1,
    skins: 1,
  });
});

test("rejects malformed GLB headers and declared lengths", () => {
  const valid = makeGlb({ asset: { version: "2.0" } });
  const wrongMagic = Buffer.from(valid);
  wrongMagic.writeUInt32LE(0, 0);
  assert.throws(() => parseGlb(wrongMagic), /header magic is invalid/);

  const wrongLength = Buffer.from(valid);
  wrongLength.writeUInt32LE(valid.length + 4, 8);
  assert.throws(() => parseGlb(wrongLength), /declared length/);
});

test("rejects remote and escaping glTF resources", () => {
  const directory = mkdtempSync(join(tmpdir(), "foodfight-gltf-"));
  const path = join(directory, "model.gltf");
  try {
    writeFileSync(
      path,
      JSON.stringify({
        asset: { version: "2.0" },
        buffers: [{ uri: "https://example.com/model.bin" }],
        images: [{ uri: "../secret.png" }],
      }),
    );

    const result = inspectModelFile(path);
    assert.ok(result.errors.some((error) => error.includes("must not reference a remote resource")));
    assert.ok(result.errors.some((error) => error.includes("escapes the model asset directory")));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("accepts committed local glTF resources and embedded data URIs", () => {
  const directory = mkdtempSync(join(tmpdir(), "foodfight-gltf-"));
  const path = join(directory, "model.gltf");
  try {
    writeFileSync(join(directory, "model.bin"), Buffer.from([0, 1, 2, 3]));
    writeFileSync(
      path,
      JSON.stringify({
        asset: { version: "2.0" },
        buffers: [{ uri: "model.bin" }],
        images: [{ uri: "data:image/png;base64,AA==" }],
      }),
    );

    const result = inspectModelFile(path);
    assert.deepEqual(result.errors, []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

function makeGlb(document) {
  const json = Buffer.from(JSON.stringify(document), "utf8");
  const padding = (4 - (json.length % 4)) % 4;
  const jsonChunk = Buffer.concat([json, Buffer.alloc(padding, 0x20)]);
  const buffer = Buffer.alloc(12 + 8 + jsonChunk.length);
  buffer.writeUInt32LE(0x46546c67, 0);
  buffer.writeUInt32LE(2, 4);
  buffer.writeUInt32LE(buffer.length, 8);
  buffer.writeUInt32LE(jsonChunk.length, 12);
  buffer.writeUInt32LE(0x4e4f534a, 16);
  jsonChunk.copy(buffer, 20);
  return buffer;
}

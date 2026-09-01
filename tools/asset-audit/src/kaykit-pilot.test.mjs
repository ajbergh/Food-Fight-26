import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveKayKitPilot,
  KAYKIT_PILOT_CLIP_MAP,
  KAYKIT_PILOT_EXCLUDED_NODES,
} from "./kaykit-pilot.mjs";
import { parseGlb } from "./gltf.mjs";

test("creates a bounded four-clip pilot and detaches fantasy accessories", () => {
  const excludedNodes = KAYKIT_PILOT_EXCLUDED_NODES.map((name, index) => ({
    name,
    mesh: index,
  }));
  const bodyIndex = excludedNodes.length;
  const parentIndex = bodyIndex + 1;
  const source = makeGlb({
    asset: { version: "2.0", generator: "upstream" },
    scenes: [{ nodes: [parentIndex] }],
    nodes: [
      ...excludedNodes,
      { name: "Mage_Body", mesh: excludedNodes.length },
      {
        name: "Rig",
        children: [...excludedNodes.map((_, index) => index), bodyIndex],
      },
    ],
    animations: [
      ...Object.keys(KAYKIT_PILOT_CLIP_MAP).map((name, index) => ({
        name,
        channels: [],
        samplers: [],
        extras: { index },
      })),
      { name: "Death_A", channels: [], samplers: [] },
    ],
  });

  const result = parseGlb(deriveKayKitPilot(source));
  assert.deepEqual(
    result.animations.map((animation) => animation.name),
    ["idle", "walk", "run", "throw_food"],
  );
  assert.deepEqual(result.nodes[parentIndex].children, [bodyIndex]);
  for (const node of result.nodes.slice(0, excludedNodes.length)) {
    assert.equal(node.mesh, undefined);
  }
  assert.equal(
    result.asset.extras.foodFightDerivative.sourceRevision,
    "672074b73ba276876a19e8816ecdc5241817ab47",
  );
});

test("fails closed when the pinned source no longer exposes a required clip", () => {
  const document = {
    asset: { version: "2.0" },
    nodes: KAYKIT_PILOT_EXCLUDED_NODES.map((name) => ({ name })),
    animations: Object.keys(KAYKIT_PILOT_CLIP_MAP)
      .filter((name) => name !== "Throw")
      .map((name) => ({ name })),
  };
  assert.throws(
    () => deriveKayKitPilot(makeGlb(document)),
    /missing animation 'Throw'/,
  );
});

function makeGlb(document) {
  const json = Buffer.from(JSON.stringify(document), "utf8");
  const paddedLength = Math.ceil(json.length / 4) * 4;
  const output = Buffer.alloc(12 + 8 + paddedLength, 0x20);
  output.writeUInt32LE(0x46546c67, 0);
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(paddedLength, 12);
  output.writeUInt32LE(0x4e4f534a, 16);
  json.copy(output, 20);
  return output;
}

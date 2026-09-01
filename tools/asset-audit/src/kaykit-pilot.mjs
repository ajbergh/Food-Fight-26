const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const JSON_CHUNK = 0x4e4f534a;

export const KAYKIT_PILOT_CLIP_MAP = Object.freeze({
  Idle: "idle",
  Walking_A: "walk",
  Running_A: "run",
  Throw: "throw_food",
});

export const KAYKIT_PILOT_EXCLUDED_NODES = Object.freeze([
  "Spellbook",
  "Spellbook_open",
  "1H_Wand",
  "2H_Staff",
  "Mage_Hat",
  "Mage_Cape",
]);

export function deriveKayKitPilot(source) {
  const chunks = parseChunks(source);
  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  if (!jsonChunk) throw new Error("Source GLB does not contain a JSON chunk.");

  const document = JSON.parse(
    jsonChunk.data.toString("utf8").replace(/[\u0000 ]+$/u, ""),
  );
  if (document?.asset?.version !== "2.0") {
    throw new Error(
      `Expected a glTF 2.0 asset; found '${document?.asset?.version ?? "unknown"}'.`,
    );
  }

  const nodes = Array.isArray(document.nodes) ? document.nodes : [];
  const nodeIndexByName = new Map(
    nodes.map((node, index) => [node?.name, index]),
  );
  const excludedIndices = new Set();
  for (const name of KAYKIT_PILOT_EXCLUDED_NODES) {
    const index = nodeIndexByName.get(name);
    if (index === undefined)
      throw new Error(
        `Pinned KayKit source is missing detachable node '${name}'.`,
      );
    excludedIndices.add(index);
    delete nodes[index].mesh;
    delete nodes[index].skin;
  }

  for (const node of nodes) {
    if (Array.isArray(node?.children)) {
      node.children = node.children.filter(
        (index) => !excludedIndices.has(index),
      );
    }
  }
  for (const scene of Array.isArray(document.scenes) ? document.scenes : []) {
    if (Array.isArray(scene?.nodes)) {
      scene.nodes = scene.nodes.filter((index) => !excludedIndices.has(index));
    }
  }

  const animations = Array.isArray(document.animations)
    ? document.animations
    : [];
  const animationByName = new Map(
    animations.map((animation) => [animation?.name, animation]),
  );
  document.animations = Object.entries(KAYKIT_PILOT_CLIP_MAP).map(
    ([sourceName, canonicalName]) => {
      const animation = animationByName.get(sourceName);
      if (!animation)
        throw new Error(
          `Pinned KayKit source is missing animation '${sourceName}'.`,
        );
      return { ...animation, name: canonicalName };
    },
  );

  document.asset.generator =
    "Food Fight 26 deterministic KayKit pilot derivative";
  document.asset.extras = {
    ...(document.asset.extras ?? {}),
    foodFightDerivative: {
      sourceRepository:
        "KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0",
      sourceRevision: "672074b73ba276876a19e8816ecdc5241817ab47",
      sourceAsset:
        "addons/kaykit_character_pack_adventures/Characters/gltf/Mage.glb",
      excludedNodes: [...KAYKIT_PILOT_EXCLUDED_NODES],
      animationMap: { ...KAYKIT_PILOT_CLIP_MAP },
    },
  };

  const json = Buffer.from(JSON.stringify(document), "utf8");
  const paddedJson = Buffer.alloc(alignToFour(json.length), 0x20);
  json.copy(paddedJson);
  jsonChunk.data = paddedJson;

  return encodeChunks(chunks);
}

function parseChunks(source) {
  const buffer = Buffer.isBuffer(source) ? source : Buffer.from(source);
  if (buffer.length < 20) throw new Error("Source GLB is too short.");
  if (buffer.readUInt32LE(0) !== GLB_MAGIC)
    throw new Error("Source GLB has an invalid magic header.");
  if (buffer.readUInt32LE(4) !== GLB_VERSION)
    throw new Error("Source GLB is not version 2.");
  if (buffer.readUInt32LE(8) !== buffer.length)
    throw new Error("Source GLB declared length does not match its bytes.");

  const chunks = [];
  let offset = 12;
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length)
      throw new Error("Source GLB has a truncated chunk header.");
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const end = offset + 8 + length;
    if (end > buffer.length)
      throw new Error("Source GLB has a truncated chunk payload.");
    chunks.push({ type, data: Buffer.from(buffer.subarray(offset + 8, end)) });
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

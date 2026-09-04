import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectModelFile } from "../src/gltf.mjs";
import { embedExternalImage, gitBlobSha1 } from "../src/kenney-props.mjs";

const SOURCE_REPOSITORY = "MMqd/godot-screenspace-projection";
const SOURCE_REVISION = "d00f54f4acd328bc2162656a09f4b78a9a1e6364";
const SOURCE_ROOT = "assets/kenney_food-kit";
const TEXTURE = Object.freeze({
  path: `${SOURCE_ROOT}/Textures/colormap.png`,
  gitBlobSha1: "1dfac9e6c4639266b629ad4c43e3048c2117d520",
});
const MODELS = Object.freeze([
  {
    name: "pizza",
    path: `${SOURCE_ROOT}/pizza.glb`,
    gitBlobSha1: "989049a255f3e692df6886b7f019d45cd9cd607f",
  },
  {
    name: "pizza-box",
    path: `${SOURCE_ROOT}/pizza-box.glb`,
    gitBlobSha1: "cd2dffb46823eefdfae69975f7de2a9fdb894d5e",
  },
  {
    name: "can",
    path: `${SOURCE_ROOT}/can.glb`,
    gitBlobSha1: "f235fa49a8a91dcc0356918839123ddca8c8b191",
  },
  {
    name: "carton",
    path: `${SOURCE_ROOT}/carton.glb`,
    gitBlobSha1: "fe095efdf461dcee80ff2222f8c51032e0a48b62",
  },
]);

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "../../..");
const outputDirectory = resolve(
  repoRoot,
  "apps/game-client/public/assets/third-party/kenney-food-kit",
);

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

const texture = await downloadPinned(TEXTURE);
const generated = [];
for (const model of MODELS) {
  const source = await downloadPinned(model);
  const output = embedExternalImage(source, texture);
  const outputPath = resolve(outputDirectory, `${model.name}.glb`);
  writeFileSync(outputPath, output);

  const inspection = inspectModelFile(outputPath);
  if (inspection.errors.length > 0) {
    throw new Error(
      `Generated Kenney prop '${model.name}' failed structural inspection: ${inspection.errors.join("; ")}`,
    );
  }

  generated.push({
    name: model.name,
    sourcePath: model.path,
    sourceGitBlobSha1: model.gitBlobSha1,
    outputPath,
    outputBytes: output.length,
    outputSha256: sha256(output),
    metrics: inspection.metrics,
  });
}

process.stdout.write(
  `${JSON.stringify(
    {
      sourceRepository: SOURCE_REPOSITORY,
      sourceRevision: SOURCE_REVISION,
      texture: {
        sourcePath: TEXTURE.path,
        sourceGitBlobSha1: TEXTURE.gitBlobSha1,
      },
      generated,
    },
    null,
    2,
  )}\n`,
);

async function downloadPinned(source) {
  const url = `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${SOURCE_REVISION}/${source.path}`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(
      `Unable to download pinned Kenney source '${source.path}': HTTP ${response.status}.`,
    );
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = gitBlobSha1(bytes);
  if (digest !== source.gitBlobSha1) {
    throw new Error(
      `Pinned Kenney source Git blob mismatch for '${source.path}': expected ${source.gitBlobSha1}, received ${digest}.`,
    );
  }
  return bytes;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

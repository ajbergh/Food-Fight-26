import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectModelFile } from "../src/gltf.mjs";
import { embedExternalImage, gitBlobSha1 } from "../src/kenney-props.mjs";

// Kenney is the provenance/license authority. This public repository is used
// strictly as an immutable byte mirror so selected GLB files can be reproduced
// exactly in CI without vendoring the complete Mini Market pack.
const SOURCE_REPOSITORY = "AP-B-IMT-RapidPrototyping/assignment-2-workplace-game-flashforge";
const SOURCE_REVISION = "2821b7fc7ba39960bc1f555bb4ebef7bc32efabc";
const SOURCE_ROOT = "project/Models/Anas/kenney_mini-market/Models/GLB format";
const TEXTURE = Object.freeze({
  path: `${SOURCE_ROOT}/Textures/colormap.png`,
  gitBlobSha1: "166a545e0e6fda582acc5b6475643acba1288bd7",
});
const MODELS = Object.freeze([
  {
    name: "service-window",
    path: `${SOURCE_ROOT}/wall-window.glb`,
    gitBlobSha1: "d5985143d4ba4a50574aad8bf732f4dd2c41c256",
  },
  {
    name: "freezers-standing",
    path: `${SOURCE_ROOT}/freezers-standing.glb`,
    gitBlobSha1: "de8a0b54056dbff5d4137904e16d92db50007f83",
  },
  {
    name: "cash-register",
    path: `${SOURCE_ROOT}/cash-register.glb`,
    gitBlobSha1: "364c8d7cfa85cff42d90a1e8359ca2deb072b942",
  },
  {
    name: "bottle-return",
    path: `${SOURCE_ROOT}/bottle-return.glb`,
    gitBlobSha1: "66f6a4ac349a843a8207998963de9122bf51b3f0",
  },
]);

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "../../..");
const outputDirectory = resolve(
  repoRoot,
  "apps/game-client/public/assets/third-party/kenney-mini-market",
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
      `Generated Kenney Mini Market fixture '${model.name}' failed structural inspection: ${inspection.errors.join("; ")}`,
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
  const encodedPath = source.path.split("/").map(encodeURIComponent).join("/");
  const url = `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${SOURCE_REVISION}/${encodedPath}`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(
      `Unable to download pinned Mini Market source '${source.path}': HTTP ${response.status}.`,
    );
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = gitBlobSha1(bytes);
  if (digest !== source.gitBlobSha1) {
    throw new Error(
      `Pinned Mini Market Git blob mismatch for '${source.path}': expected ${source.gitBlobSha1}, received ${digest}.`,
    );
  }
  return bytes;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

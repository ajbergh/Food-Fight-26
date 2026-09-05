import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectModelFile } from "../src/gltf.mjs";
import { gitBlobSha1 } from "../src/kenney-props.mjs";

const PROVENANCE_URL =
  "https://kenney.nl/media/pages/assets/furniture-kit/440e0608a4-1677580847/kenney_furniture-kit.zip";
const ARCHIVE_SHA256 =
  "e67652d0932cee41683f74711c03d3e192a2af9979ef8e6b237711f5482d46b0";
const LICENSE_PATH = "License.txt";

// Kenney remains the provenance and license authority. RetroDECK is used only
// as an immutable byte mirror because the current official ZIP is a legacy
// package and does not contain the GLB runtime format used by the client.
const SOURCE_REPOSITORY = "RetroDECK/RetroQUEST";
const SOURCE_REVISION = "dfa19a5602a31f64bd890d15279a61f43b127328";
const SOURCE_ROOT = "assets/kenney_furniture-kit/Models/GLTF format";
const MODELS = Object.freeze([
  {
    name: "bench",
    path: `${SOURCE_ROOT}/bench.glb`,
    gitBlobSha1: "7897dd0652ad3c6e94ae1dbdbbfc6180dab6b4e8",
  },
  {
    name: "chair",
    path: `${SOURCE_ROOT}/chair.glb`,
    gitBlobSha1: "2d57af4fef2a32910e3af9283d1e45f177068d63",
  },
  {
    name: "table-round",
    path: `${SOURCE_ROOT}/tableRound.glb`,
    gitBlobSha1: "885fdcd356eff8cc379e306d7b3b1ef3c5ca7475",
  },
  {
    name: "trashcan",
    path: `${SOURCE_ROOT}/trashcan.glb`,
    gitBlobSha1: "7c7d381cd693c9ffcc37a520750f5eb6de56f462",
  },
  {
    name: "lamp-square-ceiling",
    path: `${SOURCE_ROOT}/lampSquareCeiling.glb`,
    gitBlobSha1: "8aaf95cd620ab2b96b326012137af3e8534a2e4d",
  },
  {
    name: "lamp-wall",
    path: `${SOURCE_ROOT}/lampWall.glb`,
    gitBlobSha1: "cc2d160260a0b7ef08e611a22013043378209898",
  },
  {
    name: "stove-electric",
    path: `${SOURCE_ROOT}/kitchenStoveElectric.glb`,
    gitBlobSha1: "1418ed1fc1e54ae552834def86979ec2c8be753a",
  },
  {
    name: "hood-large",
    path: `${SOURCE_ROOT}/hoodLarge.glb`,
    gitBlobSha1: "cd555ba7d57ad2aabe373b0dfbaa00539c5d7d22",
  },
  {
    name: "blender",
    path: `${SOURCE_ROOT}/kitchenBlender.glb`,
    gitBlobSha1: "c2068a71ccd628c7ccd9850242b04fba597967c6",
  },
  {
    name: "coffee-machine",
    path: `${SOURCE_ROOT}/kitchenCoffeeMachine.glb`,
    gitBlobSha1: "f10641b44f34270570796a6115e524b53a4ecb71",
  },
  {
    name: "microwave",
    path: `${SOURCE_ROOT}/kitchenMicrowave.glb`,
    gitBlobSha1: "1ef2100740f1935324f9ea7d3875d00b9f0659c0",
  },
]);

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "../../..");
const outputDirectory = resolve(
  repoRoot,
  "apps/game-client/public/assets/third-party/kenney-furniture-kit",
);
const tempDirectory = mkdtempSync(join(tmpdir(), "foodfight-kenney-furniture-"));
const archivePath = join(tempDirectory, "kenney_furniture-kit.zip");

try {
  const archive = await downloadOfficialArchive();
  writeFileSync(archivePath, archive);

  const members = listArchiveMembers(archivePath);
  assertMember(members, LICENSE_PATH);
  const license = extractMember(archivePath, LICENSE_PATH).toString("utf8");
  if (!/(CC0\s+1\.0\s+Universal|Creative Commons Zero)/iu.test(license)) {
    throw new Error(
      "Official Kenney Furniture Kit archive license did not contain the expected CC0 1.0 marker.",
    );
  }

  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });

  const generated = [];
  for (const model of MODELS) {
    const source = await downloadPinnedModel(model);
    const outputPath = resolve(outputDirectory, `${model.name}.glb`);
    writeFileSync(outputPath, source);

    // inspectModelFile validates the GLB structure and rejects unresolved,
    // remote, or escaping resource URIs. This intentionally prevents an
    // unpinned texture/resource from entering the runtime asset set.
    const inspection = inspectModelFile(outputPath);
    if (inspection.errors.length > 0) {
      throw new Error(
        `Pinned furniture prop '${model.name}' failed structural inspection: ${inspection.errors.join("; ")}`,
      );
    }

    generated.push({
      name: model.name,
      sourceAsset: model.path,
      sourceGitBlobSha1: model.gitBlobSha1,
      outputPath,
      outputBytes: source.length,
      outputSha256: sha256(source),
      metrics: inspection.metrics,
    });
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        provenanceUrl: PROVENANCE_URL,
        provenanceArchiveSha256: ARCHIVE_SHA256,
        licensePath: LICENSE_PATH,
        sourceRepository: SOURCE_REPOSITORY,
        sourceRevision: SOURCE_REVISION,
        generated,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
}

async function downloadOfficialArchive() {
  const response = await fetch(PROVENANCE_URL, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(
      `Unable to download official Kenney Furniture Kit archive: HTTP ${response.status}.`,
    );
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = sha256(bytes);
  if (digest !== ARCHIVE_SHA256) {
    throw new Error(
      `Kenney Furniture Kit archive SHA-256 mismatch: expected ${ARCHIVE_SHA256}, received ${digest}.`,
    );
  }
  return bytes;
}

async function downloadPinnedModel(model) {
  const encodedPath = model.path.split("/").map(encodeURIComponent).join("/");
  const url = `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${SOURCE_REVISION}/${encodedPath}`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(
      `Unable to download pinned Furniture Kit model '${model.path}': HTTP ${response.status}.`,
    );
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = gitBlobSha1(bytes);
  if (digest !== model.gitBlobSha1) {
    throw new Error(
      `Pinned Furniture Kit Git blob mismatch for '${model.path}': expected ${model.gitBlobSha1}, received ${digest}.`,
    );
  }
  return bytes;
}

function listArchiveMembers(path) {
  try {
    return execFileSync("unzip", ["-Z1", path], {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    })
      .split(/\r?\n/u)
      .filter(Boolean);
  } catch (error) {
    throw new Error(
      `Unable to inspect Kenney Furniture Kit ZIP. Ensure the 'unzip' utility is installed. ${String(error)}`,
    );
  }
}

function assertMember(members, expected) {
  if (members.includes(expected)) return;
  throw new Error(`Pinned Furniture Kit archive is missing '${expected}'.`);
}

function extractMember(path, member) {
  try {
    return execFileSync("unzip", ["-p", path, member], {
      encoding: "buffer",
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch (error) {
    throw new Error(`Unable to extract '${member}' from Furniture Kit ZIP: ${String(error)}`);
  }
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

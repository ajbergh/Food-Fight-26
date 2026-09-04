import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectModelFile } from "../src/gltf.mjs";
import { embedExternalImage } from "../src/kenney-props.mjs";

const SOURCE_URL =
  "https://kenney.nl/media/pages/assets/furniture-kit/440e0608a4-1677580847/kenney_furniture-kit.zip";
const ARCHIVE_SHA256 =
  "e67652d0932cee41683f74711c03d3e192a2af9979ef8e6b237711f5482d46b0";
const LICENSE_PATH = "License.txt";
const TEXTURE_PATH = "Models/GLB format/Textures/colormap.png";
const IMAGE_URI = "Textures/colormap.png";
const MODELS = Object.freeze([
  { name: "bench", member: "Models/GLB format/bench.glb" },
  { name: "chair", member: "Models/GLB format/chair.glb" },
  { name: "table-round", member: "Models/GLB format/tableRound.glb" },
  { name: "trashcan", member: "Models/GLB format/trashcan.glb" },
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
  const archive = await downloadArchive();
  writeFileSync(archivePath, archive);

  const members = listArchiveMembers(archivePath);
  assertMember(members, LICENSE_PATH);
  for (const model of MODELS) assertMember(members, model.member);

  const license = extractMember(archivePath, LICENSE_PATH).toString("utf8");
  if (!/(Creative Commons Zero|CC0)/iu.test(license)) {
    throw new Error(
      "Official Kenney Furniture Kit archive license did not contain the expected CC0 marker.",
    );
  }

  const texture = members.includes(TEXTURE_PATH)
    ? extractMember(archivePath, TEXTURE_PATH)
    : undefined;

  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });

  const generated = [];
  for (const model of MODELS) {
    const source = extractMember(archivePath, model.member);
    const sourceSha256 = sha256(source);
    let output = source;

    if (source.includes(Buffer.from(IMAGE_URI, "utf8"))) {
      if (!texture) {
        throw new Error(
          `Furniture model '${model.name}' references '${IMAGE_URI}', but '${TEXTURE_PATH}' is absent from the pinned archive.`,
        );
      }
      output = embedExternalImage(source, texture, IMAGE_URI);
    } else if (source.includes(Buffer.from("colormap.png", "utf8"))) {
      throw new Error(
        `Furniture model '${model.name}' references an unexpected colormap URI; update the derivation deliberately instead of passing it through.`,
      );
    }

    const outputPath = resolve(outputDirectory, `${model.name}.glb`);
    writeFileSync(outputPath, output);
    const inspection = inspectModelFile(outputPath);
    if (inspection.errors.length > 0) {
      throw new Error(
        `Generated furniture prop '${model.name}' failed structural inspection: ${inspection.errors.join("; ")}`,
      );
    }

    generated.push({
      name: model.name,
      sourceAsset: model.member,
      sourceSha256,
      outputPath,
      outputBytes: output.length,
      outputSha256: sha256(output),
      metrics: inspection.metrics,
    });
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        sourceUrl: SOURCE_URL,
        sourceArchiveSha256: ARCHIVE_SHA256,
        licensePath: LICENSE_PATH,
        texturePath: texture ? TEXTURE_PATH : null,
        generated,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
}

async function downloadArchive() {
  const response = await fetch(SOURCE_URL, { redirect: "follow" });
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
  const leaf = expected.split("/").at(-1)?.replace(/\.[^.]+$/u, "").toLowerCase() ?? "";
  const candidates = members
    .filter((member) => member.toLowerCase().includes(leaf))
    .slice(0, 12);
  throw new Error(
    `Pinned Furniture Kit archive is missing '${expected}'. Candidate members: ${candidates.join(", ") || "none"}.`,
  );
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

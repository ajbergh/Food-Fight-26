import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveKayKitPilot } from "../src/kaykit-pilot.mjs";
import { inspectModelFile } from "../src/gltf.mjs";

const SOURCE_REVISION = "672074b73ba276876a19e8816ecdc5241817ab47";
const SOURCE_PATH =
  "addons/kaykit_character_pack_adventures/Characters/gltf/Mage.glb";
const SOURCE_URL = `https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/${SOURCE_REVISION}/${SOURCE_PATH}`;
const SOURCE_SHA256 =
  "cf898585da33fab50c724d31605fb931eb2912e6d2280092141e98ca81ad507d";
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "../../..");
const defaultOutput = resolve(
  repoRoot,
  "apps/game-client/public/assets/third-party/kaykit-adventurers/chef-pilot.glb",
);

const options = parseOptions(process.argv.slice(2));
const source = options.source
  ? readFileSync(resolve(options.source))
  : await downloadPinnedSource();
const sourceDigest = sha256(source);
if (sourceDigest !== SOURCE_SHA256) {
  throw new Error(
    `Pinned KayKit source SHA-256 mismatch: expected ${SOURCE_SHA256}, received ${sourceDigest}.`,
  );
}

const output = resolve(options.output ?? defaultOutput);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, deriveKayKitPilot(source));

const inspection = inspectModelFile(output);
if (inspection.errors.length > 0) {
  throw new Error(
    `Generated pilot failed structural inspection: ${inspection.errors.join("; ")}`,
  );
}

const generated = readFileSync(output);
process.stdout.write(
  `${JSON.stringify(
    {
      sourceRevision: SOURCE_REVISION,
      sourceSha256: sourceDigest,
      output,
      outputBytes: generated.length,
      outputSha256: sha256(generated),
      metrics: inspection.metrics,
    },
    null,
    2,
  )}\n`,
);

async function downloadPinnedSource() {
  const response = await fetch(SOURCE_URL, { redirect: "follow" });
  if (!response.ok)
    throw new Error(
      `Unable to download pinned KayKit source: HTTP ${response.status}.`,
    );
  return Buffer.from(await response.arrayBuffer());
}

function parseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument !== "--source" && argument !== "--output") {
      throw new Error(
        `Unknown argument '${argument}'. Use --source <path> or --output <path>.`,
      );
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--"))
      throw new Error(`Argument '${argument}' requires a path.`);
    options[argument.slice(2)] = value;
    index += 1;
  }
  if (options.source && !existsSync(resolve(options.source))) {
    throw new Error(`Local source does not exist: ${resolve(options.source)}`);
  }
  return options;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

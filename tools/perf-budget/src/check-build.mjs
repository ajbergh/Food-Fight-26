import { appendFileSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";
import {
  CLIENT_BUILD_BUDGET,
  evaluateBudget,
  formatBytes,
  measureFiles,
  summarizeBuild,
} from "./budget.mjs";

const distPath = resolve(process.argv[2] ?? "../../apps/game-client/dist");
if (!existsSync(distPath)) {
  console.error(`Build output does not exist: ${distPath}`);
  console.error("Run `pnpm build` before checking the performance budget.");
  process.exit(1);
}

const files = collectFiles(distPath).map((path) => ({
  path: relative(distPath, path),
  content: readFileSync(path),
}));
const summary = summarizeBuild(measureFiles(files));
const failures = evaluateBudget(summary);
const largest = summary.largestJavaScript;

const lines = [
  "## Game client build budget",
  "",
  `- Files: ${summary.fileCount}`,
  `- Total build output: ${formatBytes(summary.rawBytes)} raw / ${formatBytes(summary.gzipBytes)} gzip-estimate`,
  `- Initial HTML/CSS/JS/WASM: ${formatBytes(summary.initialCodeGzipBytes)} gzip-estimate / ${formatBytes(CLIENT_BUILD_BUDGET.initialCodeGzipBytes)} budget`,
  largest
    ? `- Largest JS (${largest.path}): ${formatBytes(largest.rawBytes)} raw / ${formatBytes(largest.gzipBytes)} gzip-estimate`
    : "- Largest JS: none found",
  `- Largest JS budgets: ${formatBytes(CLIENT_BUILD_BUDGET.largestJavaScriptRawBytes)} raw / ${formatBytes(CLIENT_BUILD_BUDGET.largestJavaScriptGzipBytes)} gzip-estimate`,
];

if (failures.length === 0) {
  lines.push("", "Result: PASS");
} else {
  lines.push("", "Result: FAIL", "", ...failures.map((failure) => `- ${failure}`));
}

const report = `${lines.join("\n")}\n`;
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);

if (failures.length > 0) process.exit(1);

function collectFiles(directory) {
  const paths = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) paths.push(...collectFiles(path));
    else if (stat.isFile()) paths.push(path);
  }
  return paths;
}

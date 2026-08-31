import { gzipSync } from "node:zlib";

export const CLIENT_BUILD_BUDGET = Object.freeze({
  largestJavaScriptRawBytes: 2_750_000,
  largestJavaScriptGzipBytes: 700_000,
  initialCodeGzipBytes: 900_000,
});

export function measureFiles(files) {
  return files.map((file) => ({
    ...file,
    rawBytes: file.content.length,
    gzipBytes: gzipSync(file.content, { level: 9 }).length,
  }));
}

export function summarizeBuild(measuredFiles) {
  const codeFiles = measuredFiles.filter((file) => /\.(?:html|css|js|mjs|wasm)$/i.test(file.path));
  const javascriptFiles = measuredFiles.filter((file) => /\.(?:js|mjs)$/i.test(file.path));
  const largestJavaScript = javascriptFiles.reduce(
    (largest, file) => !largest || file.rawBytes > largest.rawBytes ? file : largest,
    undefined,
  );

  return {
    fileCount: measuredFiles.length,
    rawBytes: measuredFiles.reduce((sum, file) => sum + file.rawBytes, 0),
    gzipBytes: measuredFiles.reduce((sum, file) => sum + file.gzipBytes, 0),
    initialCodeGzipBytes: codeFiles.reduce((sum, file) => sum + file.gzipBytes, 0),
    largestJavaScript,
  };
}

export function evaluateBudget(summary, budget = CLIENT_BUILD_BUDGET) {
  const failures = [];
  const largest = summary.largestJavaScript;

  if (!largest) {
    failures.push("No JavaScript bundle was found in the client build output.");
  } else {
    if (largest.rawBytes > budget.largestJavaScriptRawBytes) {
      failures.push(
        `Largest JavaScript bundle is ${formatBytes(largest.rawBytes)} raw; budget is ${formatBytes(budget.largestJavaScriptRawBytes)}.`,
      );
    }
    if (largest.gzipBytes > budget.largestJavaScriptGzipBytes) {
      failures.push(
        `Largest JavaScript bundle is ${formatBytes(largest.gzipBytes)} gzip; budget is ${formatBytes(budget.largestJavaScriptGzipBytes)}.`,
      );
    }
  }

  if (summary.initialCodeGzipBytes > budget.initialCodeGzipBytes) {
    failures.push(
      `Initial HTML/CSS/JS/WASM payload is ${formatBytes(summary.initialCodeGzipBytes)} gzip; budget is ${formatBytes(budget.initialCodeGzipBytes)}.`,
    );
  }

  return failures;
}

export function formatBytes(bytes) {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} kB`;
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  CLIENT_BUILD_BUDGET,
  evaluateBudget,
  formatBytes,
  measureFiles,
  summarizeBuild,
} from "./budget.mjs";

test("measures raw and gzip sizes deterministically", () => {
  const content = Buffer.from("const answer = 42;\n".repeat(100));
  const [measured] = measureFiles([{ path: "assets/main.js", content }]);

  assert.equal(measured.path, "assets/main.js");
  assert.equal(measured.rawBytes, content.length);
  assert.ok(measured.gzipBytes > 0);
  assert.ok(measured.gzipBytes < measured.rawBytes);
});

test("summarizes initial code separately from non-code assets", () => {
  const measured = measureFiles([
    { path: "index.html", content: Buffer.from("<html></html>") },
    { path: "assets/main.js", content: Buffer.from("export const value = 1;".repeat(100)) },
    { path: "assets/chunk.mjs", content: Buffer.from("export {};".repeat(10)) },
    { path: "assets/main.css", content: Buffer.from("body{margin:0}") },
    { path: "assets/hero.png", content: Buffer.alloc(512, 7) },
  ]);
  const summary = summarizeBuild(measured);
  const codeGzipBytes = measured
    .filter((file) => /\.(?:html|css|js|mjs|wasm)$/i.test(file.path))
    .reduce((sum, file) => sum + file.gzipBytes, 0);

  assert.equal(summary.fileCount, measured.length);
  assert.equal(summary.initialCodeGzipBytes, codeGzipBytes);
  assert.equal(summary.largestJavaScript?.path, "assets/main.js");
  assert.equal(summary.rawBytes, measured.reduce((sum, file) => sum + file.rawBytes, 0));
});

test("accepts a build exactly at the configured thresholds", () => {
  const summary = {
    largestJavaScript: {
      path: "assets/main.js",
      rawBytes: CLIENT_BUILD_BUDGET.largestJavaScriptRawBytes,
      gzipBytes: CLIENT_BUILD_BUDGET.largestJavaScriptGzipBytes,
    },
    initialCodeGzipBytes: CLIENT_BUILD_BUDGET.initialCodeGzipBytes,
  };

  assert.deepEqual(evaluateBudget(summary), []);
});

test("reports each exceeded budget", () => {
  const budget = {
    largestJavaScriptRawBytes: 100,
    largestJavaScriptGzipBytes: 50,
    initialCodeGzipBytes: 75,
  };
  const failures = evaluateBudget(
    {
      largestJavaScript: {
        path: "assets/main.js",
        rawBytes: 101,
        gzipBytes: 51,
      },
      initialCodeGzipBytes: 76,
    },
    budget,
  );

  assert.equal(failures.length, 3);
  assert.match(failures[0], /raw/);
  assert.match(failures[1], /gzip/);
  assert.match(failures[2], /Initial HTML\/CSS\/JS\/WASM payload/);
});

test("fails closed when a client build has no JavaScript", () => {
  const failures = evaluateBudget({ largestJavaScript: undefined, initialCodeGzipBytes: 0 });
  assert.deepEqual(failures, ["No JavaScript bundle was found in the client build output."]);
});

test("formats byte counts for reports", () => {
  assert.equal(formatBytes(999), "999 B");
  assert.equal(formatBytes(1_500), "1.5 kB");
  assert.equal(formatBytes(2_500_000), "2.50 MB");
});

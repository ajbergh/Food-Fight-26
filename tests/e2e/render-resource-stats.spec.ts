import { expect, test } from "@playwright/test";

test("visual validation publishes an aligned render-resource report", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto(
    "/?visualValidation=1&visualValidationWarmupMs=100&visualValidationMs=1500&visualValidationMinSamples=1&visualValidationQuality=medium&visualValidationPlayers=1&visualValidationLabel=e2e-render-resources",
  );

  const html = page.locator("html");
  await expect(page.locator("#network")).toContainText("1/8", { timeout: 15_000 });
  await expect(html).toHaveAttribute("data-visual-validation", "ready", { timeout: 25_000 });
  await expect(html).toHaveAttribute("data-render-resource-stats", "ready", { timeout: 5_000 });

  const report = await page.evaluate(() => {
    const renderWindow = window as Window & {
      __foodfightRenderResources?: {
        phase: string;
        sampleCount: number;
        sampleIntervalMs: number;
        detailedStatsAvailable: boolean;
        drawCallsP50: number;
        drawCallsP95: number;
        drawCallsMax: number;
        trianglesP50: number | null;
        trianglesP95: number | null;
        trianglesMax: number | null;
        skinnedDrawCallsP50: number | null;
        skinnedDrawCallsP95: number | null;
        skinnedDrawCallsMax: number | null;
        vramGeometryBytesMax: number;
        vramTotalBytesMax: number;
        graphicsDeviceType: string;
      };
    };
    return renderWindow.__foodfightRenderResources;
  });

  expect(report).toBeDefined();
  expect(report!.phase).toBe("ready");
  expect(report!.sampleCount).toBeGreaterThan(0);
  expect(report!.sampleIntervalMs).toBe(100);
  expect(report!.drawCallsP50).toBeGreaterThan(0);
  expect(report!.drawCallsP95).toBeGreaterThanOrEqual(report!.drawCallsP50);
  expect(report!.drawCallsMax).toBeGreaterThanOrEqual(report!.drawCallsP95);
  expect(report!.vramTotalBytesMax).toBeGreaterThanOrEqual(0);
  expect(report!.vramGeometryBytesMax).toBeGreaterThanOrEqual(0);
  expect(report!.graphicsDeviceType.length).toBeGreaterThan(0);

  if (report!.detailedStatsAvailable) {
    expect(report!.trianglesP50).not.toBeNull();
    expect(report!.skinnedDrawCallsP50).not.toBeNull();
  } else {
    expect(report!.trianglesP50).toBeNull();
    expect(report!.trianglesP95).toBeNull();
    expect(report!.trianglesMax).toBeNull();
    expect(report!.skinnedDrawCallsP50).toBeNull();
    expect(report!.skinnedDrawCallsP95).toBeNull();
    expect(report!.skinnedDrawCallsMax).toBeNull();
  }
});

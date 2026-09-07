import { expect, test } from "@playwright/test";

test("visual validation gates on requested tier and required rendered-player count", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto(
    "/?visualValidation=1&visualValidationWarmupMs=100&visualValidationMs=3000&visualValidationMinSamples=1&visualValidationQuality=medium&visualValidationPlayers=1&visualValidationLabel=e2e-required",
  );

  const html = page.locator("html");
  await expect(page.locator("#network")).toContainText("1/8", { timeout: 15_000 });
  await expect(html).toHaveAttribute("data-visual-validation", "ready", { timeout: 25_000 });
  await expect(html).toHaveAttribute("data-visual-validation-reasons", "none");

  const report = await page.evaluate(() => {
    const validationWindow = window as Window & {
      __foodfightVisualValidation?: {
        valid: boolean;
        invalidReasons: string[];
        minimumFrameSamples: number;
        sampleCount: number;
        requestedGraphicsTier: string | null;
        graphicsTierStart: string;
        graphicsTierEnd: string;
        requiredPlayerCount: number | null;
        playerCountStart: number | null;
        playerCountEnd: number | null;
        characterPathStart: string;
        characterPathEnd: string;
      };
    };
    return validationWindow.__foodfightVisualValidation;
  });

  expect(report).toBeDefined();
  expect(report!.valid).toBe(true);
  expect(report!.invalidReasons).toEqual([]);
  expect(report!.minimumFrameSamples).toBe(1);
  expect(report!.sampleCount).toBeGreaterThanOrEqual(1);
  expect(report!.requestedGraphicsTier).toBe("medium");
  expect(report!.graphicsTierStart).toBe("medium");
  expect(report!.graphicsTierEnd).toBe("medium");
  expect(report!.requiredPlayerCount).toBe(1);
  expect(report!.playerCountStart).toBe(1);
  expect(report!.playerCountEnd).toBe(1);
  expect(report!.characterPathStart).toBe("procedural");
  expect(report!.characterPathEnd).toBe("procedural");
});

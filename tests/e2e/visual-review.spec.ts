import { expect, test, type Browser, type ViewportSize } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface VisualReviewCase {
  slug: string;
  viewport: ViewportSize;
  skeletal?: boolean;
  colorSafe?: boolean;
  reducedMotion?: boolean;
}

const OUTPUT_DIR = path.resolve("artifacts/visual-review");
const CAPTURE_CASES: VisualReviewCase[] = [
  {
    slug: "desktop-procedural-medium-default",
    viewport: { width: 1440, height: 900 },
  },
  {
    slug: "desktop-skeletal-medium-default",
    viewport: { width: 1440, height: 900 },
    skeletal: true,
  },
  {
    slug: "tablet-procedural-medium-color-safe",
    viewport: { width: 1024, height: 768 },
    colorSafe: true,
  },
  {
    slug: "phone-procedural-medium-reduced-color-safe",
    viewport: { width: 390, height: 844 },
    colorSafe: true,
    reducedMotion: true,
  },
];

test("writes CI visual-review screenshots and metadata without pixel-diff gating", async ({ browser }) => {
  test.setTimeout(180_000);
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const captureCase of CAPTURE_CASES) {
    await captureVisualReviewCase(browser, captureCase);
  }
});

async function captureVisualReviewCase(browser: Browser, captureCase: VisualReviewCase) {
  const context = await browser.newContext({
    viewport: captureCase.viewport,
    reducedMotion: captureCase.reducedMotion ? "reduce" : "no-preference",
  });
  const page = await context.newPage();

  try {
    const params = new URLSearchParams();
    if (captureCase.skeletal) params.set("skeletalPilot", "1");
    const query = params.size > 0 ? `?${params.toString()}` : "";
    await page.goto(`/${query}`);

    const html = page.locator("html");
    const body = page.locator("body");
    const network = page.locator("#network");
    const quality = page.locator("#quality");

    await expect(network).toContainText("online", { timeout: 20_000 });
    await expect(network).toContainText("playing", { timeout: 20_000 });
    await expect(quality).toContainText("medium");
    await expect(html).toHaveAttribute("data-procedural-chef-finish", "ready", { timeout: 20_000 });

    if (captureCase.skeletal) {
      await expect(html).toHaveAttribute("data-skeletal-pilot", "ready", { timeout: 20_000 });
    }

    if (captureCase.colorSafe) {
      const palette = page.locator("#palette");
      await palette.click();
      await expect(body).toHaveAttribute("data-team-palette", "color-safe");
    } else {
      await expect(body).toHaveAttribute("data-team-palette", "default");
    }

    await expect(body).toHaveAttribute(
      "data-reduced-motion",
      captureCase.reducedMotion ? "true" : "false",
    );

    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );

    const runtime = await page.evaluate(() => ({
      url: window.location.href,
      network: document.querySelector<HTMLElement>("#network")?.textContent?.trim() ?? "",
      performance: document.querySelector<HTMLElement>("#performance")?.textContent?.trim() ?? "",
      graphics: document.querySelector<HTMLButtonElement>("#quality")?.textContent?.trim() ?? "",
      body: {
        hudScale: document.body.dataset.hudScale ?? "unknown",
        reducedMotion: document.body.dataset.reducedMotion ?? "unknown",
        teamPalette: document.body.dataset.teamPalette ?? "unknown",
      },
      diagnostics: {
        proceduralChefFinish: document.documentElement.dataset.proceduralChefFinish ?? "unknown",
        skeletalPilot: document.documentElement.dataset.skeletalPilot ?? "not-requested",
        arenaAmbientLife: document.documentElement.dataset.arenaAmbientLife ?? "unknown",
        arenaAmbientMenu: document.documentElement.dataset.arenaAmbientMenu ?? "unknown",
        arenaAmbientCrowd: document.documentElement.dataset.arenaAmbientCrowd ?? "unknown",
        arenaAmbientService: document.documentElement.dataset.arenaAmbientService ?? "unknown",
        productionProps: document.documentElement.dataset.productionProps ?? "not-loaded",
        productionFurniture: document.documentElement.dataset.productionFurniture ?? "not-loaded",
        productionFixtures: document.documentElement.dataset.productionFixtures ?? "not-loaded",
        productionMiniMarket: document.documentElement.dataset.productionMiniMarket ?? "not-loaded",
        productionKitchen: document.documentElement.dataset.productionKitchen ?? "not-loaded",
      },
    }));

    const metadata = {
      schemaVersion: 1,
      capturedAt: new Date().toISOString(),
      sourceRevision: process.env.GITHUB_SHA ?? "local",
      purpose: "human-visual-review",
      representativeHardware: false,
      acceptanceEvidence: false,
      expectedPlayerDensity: "single-client-ci",
      captureCase,
      runtime,
    };

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${captureCase.slug}.png`),
      fullPage: false,
    });
    await writeFile(
      path.join(OUTPUT_DIR, `${captureCase.slug}.json`),
      `${JSON.stringify(metadata, null, 2)}\n`,
      "utf8",
    );
  } finally {
    await context.close();
  }
}

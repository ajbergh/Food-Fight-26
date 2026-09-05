import { expect, test } from "@playwright/test";

test("connects, exposes live diagnostics, and accepts authoritative combat input", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/");

  const network = page.locator("#network");
  await expect(network).toContainText("online");
  await expect(network).toContainText("1/8");
  await expect(page.locator("#performance")).toContainText("fps");
  await expect(page.locator("#objective")).toBeVisible();
  await expect(page.locator(".blue-score")).toContainText("◆");
  await expect(page.locator(".red-score")).toContainText("●");
  await expect(page.locator("html")).toHaveAttribute("data-arena-ambient-life", "active");
  await expect(page.locator("html")).toHaveAttribute("data-arena-ambient-menu", "active");

  const quality = page.locator("#quality");
  const initialQuality = (await quality.textContent()) ?? "";
  await quality.click();
  await expect(quality).not.toHaveText(initialQuality);
  await expect(page.locator("html")).toHaveAttribute("data-production-props", "ready", {
    timeout: 15_000,
  });

  const audio = page.locator("#audio");
  await expect(audio).toHaveAttribute("aria-pressed", "false");
  await audio.click();
  await expect(audio).toHaveAttribute("aria-pressed", "true");

  await expect(network).toContainText("playing", { timeout: 15_000 });

  const tomatoAmmo = page.locator("#tomato-ammo");
  await expect(tomatoAmmo).toHaveText("3");
  await page.keyboard.press("Space");
  await expect(tomatoAmmo).toHaveText("2");
});

test("opt-in skeletal pilot loads and preserves authoritative combat input", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.location().url.endsWith("/favicon.ico")) {
      consoleErrors.push(message.text());
    }
  });
  await page.goto("/?skeletalPilot=1");

  await expect(page.locator("#network")).toContainText("online");
  await expect(page.locator("html")).toHaveAttribute("data-skeletal-pilot", "ready", {
    timeout: 15_000,
  });
  await expect(page.locator("#network")).toContainText("playing", { timeout: 15_000 });

  const tomatoAmmo = page.locator("#tomato-ammo");
  await expect(tomatoAmmo).toHaveText("3");
  await page.keyboard.press("Space");
  await expect(tomatoAmmo).toHaveText("2");
  expect(consoleErrors).toEqual([]);
});

test("responsive HUD accessibility settings persist on a phone viewport", async ({ page }) => {
  test.setTimeout(60_000);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const body = page.locator("body");
  const network = page.locator("#network");
  const settings = page.locator(".settings");
  const objective = page.locator("#objective");
  const motion = page.locator("#motion");
  const hudScale = page.locator("#hud-scale");
  const palette = page.locator("#palette");

  await expect(network).toContainText("online");
  await expect(settings).toBeVisible();
  await expect(body).toHaveAttribute("data-reduced-motion", "true");
  await expect(page.locator("html")).toHaveAttribute("data-arena-ambient-life", "reduced");
  await expect(page.locator("html")).toHaveAttribute("data-arena-ambient-menu", "reduced");
  await expect(motion).toHaveAttribute("aria-pressed", "true");

  await motion.click();
  await expect(body).toHaveAttribute("data-reduced-motion", "false");
  await expect(motion).toHaveAttribute("aria-pressed", "false");
  // The emulated OS preference still requests reduced motion, so nonessential 3D
  // environmental motion remains suppressed even when the session toggle is off.
  await expect(page.locator("html")).toHaveAttribute("data-arena-ambient-life", "reduced");
  await expect(page.locator("html")).toHaveAttribute("data-arena-ambient-menu", "reduced");

  await expect(body).toHaveAttribute("data-hud-scale", "normal");
  await hudScale.click();
  await expect(body).toHaveAttribute("data-hud-scale", "large");
  await expect(hudScale).toHaveAttribute("aria-label", /HUD scale: large/);

  await expect(body).toHaveAttribute("data-team-palette", "default");
  await expect(palette).toHaveAttribute("aria-pressed", "false");
  await palette.click();
  await expect(body).toHaveAttribute("data-team-palette", "color-safe");
  await expect(palette).toHaveAttribute("aria-pressed", "true");
  const redBorder = await page.locator(".red-score").evaluate((element) => getComputedStyle(element).borderTopColor);
  expect(redBorder).toContain("230");
  expect(redBorder).toContain("159");

  for (const button of await settings.locator("button").all()) {
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  const settingsBox = await settings.boundingBox();
  const objectiveBox = await objective.boundingBox();
  expect(settingsBox).not.toBeNull();
  expect(objectiveBox).not.toBeNull();
  expect(settingsBox!.x).toBeGreaterThanOrEqual(0);
  expect(settingsBox!.x + settingsBox!.width).toBeLessThanOrEqual(390);
  expect(objectiveBox!.y + objectiveBox!.height).toBeLessThanOrEqual(settingsBox!.y);

  const storedSettings = await page.evaluate(() => ({
    hudScale: localStorage.getItem("foodfight.hudScale"),
    reducedMotion: localStorage.getItem("foodfight.reducedMotion"),
    teamPalette: localStorage.getItem("foodfight.teamPalette"),
  }));
  expect(storedSettings).toEqual({
    hudScale: "large",
    reducedMotion: "0",
    teamPalette: "color-safe",
  });
});

test("two browser clients join the same available room", async ({ browser }) => {
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();
  const first = await firstContext.newPage();
  const second = await secondContext.newPage();

  try {
    await first.goto("/");
    await expect(first.locator("#network")).toContainText("online");

    await second.goto("/");
    await expect(second.locator("#network")).toContainText("online");

    await expect(first.locator("#network")).toContainText("2/8");
    await expect(second.locator("#network")).toContainText("2/8");
  } finally {
    await firstContext.close();
    await secondContext.close();
  }
});

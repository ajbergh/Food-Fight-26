import { expect, test } from "@playwright/test";

test("connects, exposes live diagnostics, and accepts authoritative combat input", async ({ page }) => {
  await page.goto("/");

  const network = page.locator("#network");
  await expect(network).toContainText("online");
  await expect(network).toContainText("1/8");
  await expect(page.locator("#performance")).toContainText("fps");
  await expect(page.locator("#objective")).toBeVisible();

  const quality = page.locator("#quality");
  const initialQuality = (await quality.textContent()) ?? "";
  await quality.click();
  await expect(quality).not.toHaveText(initialQuality);

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

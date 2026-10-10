import { expect, test } from "@playwright/test";

test("guest launch controls and labels are keyboard accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Food Fight 26" })).toBeVisible();
  await expect(page.getByLabel("Player name")).toBeVisible();
  await expect(page.getByRole("button", { name: "Quick play" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Create private match" })).toBeEnabled();
  await page.getByLabel("Player name").fill("Chef Firefox");
  await page.getByRole("button", { name: "Join", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter the room code your friend shared.");
  await page.getByLabel("Join a friend").fill("ABC123");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("mobile-sized web shell retains all entry controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const name of ["Quick play", "Create private match", "Join"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

import { expect, test } from "@playwright/test";

test("web onboarding validates room codes before navigating", async ({ page }) => {
  await page.goto("http://127.0.0.1:5173/");
  await expect(page.getByRole("heading", { name: "Food Fight 26" })).toBeVisible();
  await page.getByLabel("Player name").fill("Chef Lina");
  await page.getByRole("button", { name: "Join", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("room code");
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
});

test("guest can create a private match from the web shell", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("http://127.0.0.1:5173/");
  await page.getByLabel("Player name").fill("Chef Lina");
  await page.getByRole("button", { name: "Create private match" }).click();
  await expect(page).toHaveURL(/5174.*name=Chef.*Lina.*private=1/);
  await expect(page.locator("#network")).toContainText("online", { timeout: 20_000 });
  await expect(page.locator(".player-label.local")).toContainText("Chef Lina");
  await expect(page.locator("#invite")).toBeEnabled();
});

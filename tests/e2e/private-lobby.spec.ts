import { expect, test } from "@playwright/test";

test("private room waits for a second chef then starts the round", async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.goto("/?name=ChefOne&private=1");
  await expect(page.locator("html")).toHaveAttribute("data-connection-status", "online", { timeout: 20_000 });
  await expect(page.locator("#party-lobby")).toBeVisible();
  await expect(page.locator("#match-banner")).toContainText("WAITING FOR FRIENDS");
  const roomId = await page.locator("html").getAttribute("data-room-id");
  expect(roomId).toBeTruthy();
  await expect(page.locator("#party-room")).toContainText(roomId!);
  const other = await context.newPage();
  await other.goto("/?name=ChefTwo&room=" + encodeURIComponent(roomId!));
  await expect(other.locator("html")).toHaveAttribute("data-connection-status", "online", { timeout: 20_000 });
  await expect(page.locator("#party-players li")).toHaveCount(2);
  await expect(other.locator("#party-players li")).toHaveCount(2);
  await expect(page.locator("#match-banner")).toContainText("WAITING FOR READY");
  await page.locator("#party-ready").click();
  await expect(page.locator("#party-ready")).toHaveText("Ready ✓");
  await other.locator("#party-ready").click();
  await expect(page.locator("#network")).toContainText("playing", { timeout: 25_000 });
  await expect(page.locator("#party-lobby")).toBeHidden();
  await other.close();
});

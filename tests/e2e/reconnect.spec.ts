import { expect, test } from "@playwright/test";

test("tab refresh resumes the same authoritative private-room seat when within grace period", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/?name=ChefStable&private=1");
  await expect(page.locator("#network")).toContainText("online", { timeout: 20_000 });
  await expect(page.locator("html")).toHaveAttribute("data-connection-status", "online");
  const initial = await page.locator("html").evaluate((el) => ({
    playerId: el.dataset.localSessionId,
    roomId: el.dataset.roomId,
    tokenSaved: Boolean(sessionStorage.getItem("ff26-seat")),
  }));
  expect(initial.playerId).toBeTruthy();
  expect(initial.roomId).toBeTruthy();
  expect(initial.tokenSaved).toBe(true);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-connection-status", "online", { timeout: 25_000 });
  await expect(page.locator("html")).toHaveAttribute("data-local-session-id", initial.playerId!);
  await expect(page.locator("html")).toHaveAttribute("data-room-id", initial.roomId!);
  await expect(page.locator(".player-label.local")).toContainText("ChefStable");
});

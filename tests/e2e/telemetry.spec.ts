import { expect, test } from "@playwright/test";

test("browser session telemetry reaches the platform aggregate", async ({ page, request }) => {
  const before = await request.get("http://127.0.0.1:3000/api/v1/telemetry/summary");
  expect(before.ok()).toBeTruthy();
  const initial = (await before.json()) as { received: number; byKind?: Record<string, number> };

  await page.goto("/");
  await expect(page.locator("#network")).toContainText("online");

  await expect
    .poll(async () => {
      const response = await request.get("http://127.0.0.1:3000/api/v1/telemetry/summary");
      if (!response.ok()) return false;
      const summary = (await response.json()) as { received: number; byKind?: Record<string, number> };
      return summary.received > initial.received && (summary.byKind?.session_started ?? 0) > 0;
    })
    .toBe(true);
});

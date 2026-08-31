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
      if (!response.ok()) return 0;
      const summary = (await response.json()) as { received: number; byKind?: Record<string, number> };
      return {
        received: summary.received,
        started: summary.byKind?.session_started ?? 0,
      };
    })
    .toMatchObject({
      received: expect.any(Number),
      started: expect.any(Number),
    });

  const after = await request.get("http://127.0.0.1:3000/api/v1/telemetry/summary");
  const summary = (await after.json()) as { received: number; byKind?: Record<string, number> };
  expect(summary.received).toBeGreaterThan(initial.received);
  expect(summary.byKind?.session_started ?? 0).toBeGreaterThan(0);
});

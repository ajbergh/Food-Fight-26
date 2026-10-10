import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/cross-browser",
  timeout: 30_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  projects: [
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  use: { baseURL: "http://127.0.0.1:5173", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm --filter @foodfight/web exec vite --host 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173",
    env: { VITE_GAME_URL: "http://127.0.0.1:5174" },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

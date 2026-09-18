import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.e2e.ts",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3200", browserName: "chromium" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3200",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

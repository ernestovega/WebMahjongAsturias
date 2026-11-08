// Browser tests for site/. Run with `npx playwright test`.
import { defineConfig, devices } from "@playwright/test";

const port = 4173;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    // The service worker would cache pages between tests.
    serviceWorkers: "block",
    trace: "off",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `node tests/e2e/server.mjs`,
    env: { PORT: String(port) },
    url: `http://localhost:${port}/`,
    reuseExistingServer: !process.env.CI,
  },
});

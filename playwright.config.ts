import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "mobile-320",
      use: {
        ...devices["iPhone SE"],
        viewport: { width: 320, height: 720 },
        isMobile: true
      }
    },
    {
      name: "mobile-375",
      use: {
        ...devices["iPhone 12"],
        viewport: { width: 375, height: 812 },
        isMobile: true
      }
    },
    {
      name: "tablet-768",
      use: {
        viewport: { width: 768, height: 1024 }
      }
    },
    {
      name: "desktop",
      use: {
        viewport: { width: 1440, height: 900 }
      }
    }
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});

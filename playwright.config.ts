import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: new URL(".env.testing", import.meta.url).pathname });

export default defineConfig({
  testDir: "e2e",

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : 1,

  retries: process.env.CI ? 2 : 0,

  use: {
    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
  },

  // Configure projects for major browsers.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const LOCAL_URL = `http://localhost:${PORT}`;
/** Set to run the suite against a deployed site (e.g. production) instead of a local build. */
const remoteUrl = process.env.E2E_BASE_URL?.trim() || undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: remoteUrl ?? LOCAL_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: remoteUrl
    ? undefined
    : {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
});

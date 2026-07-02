import { defineConfig, devices } from "@playwright/test";

// make sure to sync this with `e2e/_base.ts`
interface TestOptions {
  user: {
    email: string;
    password: string;
    username: string;
  };
}
/**
 * http://localhost:3002
 * http://127.0.0.1:3002
 */
const port = process.env.CI ? 3000 : 3002;
const baseURL = `http://localhost:${port}`;
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  captureGitInfo: { commit: true, diff: true },
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  outputDir: "playwright-test-results",
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/u },
    {
      dependencies: ["setup"],
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
        // we can adjust user per project here, this will override the user in the base config
        // user: {
        //   username: 'emilysnew',
        //   password: 'emilyspassnew',
        // },
      },
    },
    // when we add more projects, make sure we also change `test:install` script
    // {
    //   name: 'firefox',
    //   dependencies: ['setup'],
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    // },
  ],
  reporter: "html",
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  // Timeout for each test in milliseconds.
  timeout: 20 * 1000,
  use: {
    baseURL,
    contextOptions: {
      reducedMotion: "reduce",
    },
    trace: "on-first-retry",
    // storageState: 'playwright/.auth/user.json',
  },
  webServer: {
    command: process.env.CI ? "bun build-and-preview" : "bun dev",
    reuseExistingServer: !process.env.CI,
    stderr: "pipe",
    stdout: "pipe",
    // default is 60s
    timeout: 5 * 60 * 1000,
    url: baseURL,
  },
  workers: process.env.CI ? 1 : undefined,
});

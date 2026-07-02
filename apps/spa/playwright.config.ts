import { defineConfig, devices } from "@playwright/test";
// make sure to sync this with `e2e/_base.ts`
interface TestOptions {
  user: {
    password: string;
    username: string;
  };
}
/**
 * http://localhost:3001
 * http://localhost:4173
 * http://127.0.0.1:3001
 * http://127.0.0.1:4173
 */
const port = process.env.CI ? 4173 : 3001;
const baseURL = `http://localhost:${port}`;
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  /* Capture git info in trace viewer and report */
  captureGitInfo: { commit: true, diff: true },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Run tests in files in parallel */
  fullyParallel: true,
  outputDir: "playwright-test-results",
  /* Configure projects for major browsers */
  projects: [
    // Setup project
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
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  // Timeout for each test in milliseconds.
  timeout: 20 * 1000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    /* Reduce animation motion from frammer motion. See https://motion.dev/docs/react-accessibility */
    contextOptions: {
      reducedMotion: "reduce",
    },
    /* Populates context with given storage state */
    // storageState: 'e2e/.auth/user.json',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    // in CI, we run `build-and-preview` instead of `dev`
    command: process.env.CI ? "bun build-and-preview" : "bun dev",
    reuseExistingServer: !process.env.CI,
    stderr: "pipe",
    stdout: "pipe",
    // default is 60s
    timeout: 5 * 60 * 1000,
    url: baseURL,
  },
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
});

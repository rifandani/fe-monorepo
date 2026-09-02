import { defineConfig, devices } from "@playwright/test";
// make sure to sync this with `e2e/_base.ts`
interface TestOptions {
  user: {
    username: string;
    password: string;
  };
}
// Overridable so a worktree can run E2E while the main checkout holds :4000.
const port = Number(process.env.PW_PORT ?? 4000);
const baseURL = `http://localhost:${port}`;
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  // Timeout for each test in milliseconds.
  timeout: 20 * 1000,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  outputDir: "playwright-test-results",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Reduce animation motion from frammer motion. See https://motion.dev/docs/react-accessibility */
    contextOptions: {
      reducedMotion: "reduce",
    },
    /* Populates context with given storage state */
    // storageState: 'e2e/.auth/user.json',
  },
  /* Capture git info in trace viewer and report */
  captureGitInfo: { commit: true, diff: true },
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
  /* Run your local dev server before starting the tests */
  webServer: {
    timeout: 5 * 60 * 1000, // default is 60s
    // Skip portless: bind localhost, match Playwright baseURL, hide TanStack Devtools.
    env: {
      VITE_E2E: "true",
      VITE_APP_URL: baseURL,
    },
    url: baseURL,
    // CI: build + preview on :port. Local: vite dev on :port (not `bun dev` / portless).
    command: process.env.CI
      ? `bun run build && bunx vite preview --port ${port} --strictPort`
      : `cp .env.dev .env.local && bunx vite --port ${port} --strictPort`,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
});

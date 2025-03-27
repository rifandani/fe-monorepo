import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

/**
 * Read environment variables from file.
 * `import.meta.env` doesn't works, that's why we use this
 */
dotenv.config({
  path: './.env.development',
})

/**
 * http://localhost:3002
 * http://127.0.0.1:3002
 */
const port = 3002
const baseURL = `http://localhost:${port}`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  // Timeout for each test in milliseconds.
  timeout: 20 * 1_000,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  outputDir: 'playwright-test-results',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Reduce animation motion from frammer motion. See https://motion.dev/docs/react-accessibility */
    contextOptions: {
      reducedMotion: 'reduce',
    },

    /* Populates context with given storage state */
    // storageState: 'playwright/.auth/user.json',
  },
  /* Capture git info in trace viewer and report */
  captureGitInfo: { commit: true, diff: true },

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
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
    url: baseURL,
    command: 'bun web:dev',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})

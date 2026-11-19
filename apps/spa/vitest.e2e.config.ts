import { playwright } from "@vitest/browser-playwright";
import { msw } from "msw/vite";
import { defineConfig, mergeConfig } from "vitest/config";

import { MOCK_API_BASE_URL } from "./e2e/support/constants";
import viteConfig from "./vite.config";

/**
 * Route Tests: the whole spa in a real Chromium, through Vitest browser mode.
 *
 * Deliberately NOT a project of the root `vitest.config.ts`. The root config is
 * what `test:unit`, coverage and Stryker load, and none of them may start a
 * browser. Run it with `bun spa test:e2e`.
 *
 * Rationale: docs/adr/0008-route-tests-run-in-vitest-browser-mode.md.
 */
export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      // Hermetic: no `.env*` file reaches a Route Test. Every value the app reads
      // is pinned here, so a run gives the same result on every machine and in CI.
      envDir: false,
      define: {
        "import.meta.env.VITE_API_BASE_URL": JSON.stringify(MOCK_API_BASE_URL),
        "import.meta.env.VITE_APP_URL": JSON.stringify("http://localhost"),
        // Devtools overlays intercept pointer events (see `routes/__root.tsx`).
        "import.meta.env.VITE_E2E": JSON.stringify("true"),
        "import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT": JSON.stringify(""),
        "import.meta.env.VITE_OTEL_LOG_LEVEL": JSON.stringify("NONE"),
        "import.meta.env.PORTLESS_URL": JSON.stringify(""),
      },
      // Serves `/mockServiceWorker.js` from the test server only. Nothing is
      // written to `public/`, so the worker can never ship in `dist`.
      plugins: [msw({ mode: "worker-only" })],
      // Let the dependency scanner crawl the whole app before the first test.
      // A dependency found in the middle of a run makes Vite reload the page
      // ("new dependencies optimized, reloading"): the classic browser-mode flake.
      optimizeDeps: {
        entries: [
          "src/app/entry.tsx",
          "src/app/routes/**/*.tsx",
          "e2e/**/*.ts{,x}",
        ],
        include: ["msw/browser", "vitest-browser-react/pure"],
      },
      test: {
        name: "spa-e2e",
        include: ["e2e/**/*.e2e.test.tsx"],
        setupFiles: ["e2e/support/setup.ts"],
        // The app is page-global (router, QueryClient, Persistence). Each file
        // gets a fresh iframe; `setup.ts` resets state between tests in a file.
        isolate: true,
        fileParallelism: true,
        // Hermetic suite: a flaky test is a bug, and a retry would hide it.
        retry: 0,
        testTimeout: 15_000,
        // The first visit to a route loads its lazy chunk. The default 1 s poll
        // is too short for a cold chunk on a slow CI machine.
        expect: { poll: { timeout: 5000 } },
        // Failure screenshots go here, next to the traces.
        attachmentsDir: "e2e/.artifacts/attachments",
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({
            contextOptions: {
              // Skip motion so no assertion races an animation.
              reducedMotion: "reduce",
            },
            actionTimeout: 5000,
          }),
          instances: [{ browser: "chromium" }],
          viewport: { width: 1280, height: 720 },
          // Failure artifacts land next to each other and are printed in the
          // report, so a person or an agent can open them straight away.
          screenshotFailures: true,
          trace: {
            mode: "retain-on-failure",
            tracesDir: "e2e/.artifacts/traces",
          },
          // Dependency sourcemaps only help when stepping through `node_modules`
          // in devtools. Headless runs skip them: fewer bytes per tab.
          dependencySourcemaps: false,
        },
      },
    })
  )
);

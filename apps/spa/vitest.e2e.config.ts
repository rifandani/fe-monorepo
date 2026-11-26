import { playwright } from "@vitest/browser-playwright";
import { msw } from "msw/vite";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      envDir: false,
      define: {
        "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
          "https://api.spa.test"
        ),
        "import.meta.env.VITE_APP_URL": JSON.stringify("http://localhost"),
        "import.meta.env.VITE_E2E": JSON.stringify("true"),
        "import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT": JSON.stringify(""),
        "import.meta.env.VITE_OTEL_LOG_LEVEL": JSON.stringify("NONE"),
        "import.meta.env.PORTLESS_URL": JSON.stringify(""),
      },
      plugins: [msw({ mode: "worker-only" })],
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
        globalSetup: ["e2e/support/global-setup.ts"],
        isolate: true,
        fileParallelism: true,
        retry: 0,
        testTimeout: 15_000,
        expect: { poll: { timeout: 5000 } },
        attachmentsDir: "e2e/.artifacts/attachments",
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({
            contextOptions: {
              reducedMotion: "reduce",
            },
            actionTimeout: 5000,
          }),
          instances: [{ browser: "chromium" }],
          viewport: { width: 1280, height: 720 },
          screenshotFailures: true,
          trace: {
            mode: "retain-on-failure",
            tracesDir: "e2e/.artifacts/traces",
          },
          dependencySourcemaps: false,
        },
      },
    })
  )
);

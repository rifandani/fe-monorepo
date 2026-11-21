import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: false,
    pool: "threads",
    isolate: false,
    fileParallelism: true,
    css: false,
    passWithNoTests: false,
    projects: ["packages/core", "apps/spa", "apps/expo", "tools/lint"],
    coverage: {
      provider: "v8",
      enabled: false,
      reportOnFailure: true,
      reporter: ["text", ["text-summary", { file: "summary.txt" }], "html"],
      reportsDirectory: "./coverage/vitest",
      thresholds: {
        perFile: true,
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
      include: [
        "packages/core/src/**/*.ts",
        "apps/{spa,expo}/src/**/{actions,apis,constants,layers,middlewares,services,utils}/**/*.{ts,tsx}",
        "apps/{spa,expo}/src/**/*-store.{ts,tsx}",
        "apps/{spa,expo}/src/**/{api,queries}.ts",
        "apps/spa/src/app/providers/router/session-gate.ts",
      ],
      exclude: [
        "**/*.unit.test.ts",
        "**/*.d.ts",
        "**/types.ts",
        "apps/*/src/**/constants/**",
        "packages/*/src/**/constants/**",
        "{packages/core,apps/spa,apps/expo}/src/**/schemas.ts",
        "packages/core/src/i18n/locales/**",
        "packages/core/src/hooks/**",
        "packages/core/src/**/provider.ts",
        "apps/*/src/lib/layers/{env,http,persistence,runtime,session,telemetry}.ts",
      ],
    },
  },
});

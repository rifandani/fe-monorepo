import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "threads",
    isolate: false,
    fileParallelism: true,
    css: false,
    passWithNoTests: false,
    projects: ["packages/core", "apps/spa", "apps/web", "apps/expo"],
    // `coverage` is root-only (it sits in Vitest's `NonProjectOptions`), so it
    // cannot be split across the four `defineProject` configs. Consequence:
    // `--project <name> --coverage` measures this global `include` list against
    // a partial run and reports every other project at 0%. Always run the whole
    // suite (`bun test:unit:cov`).
    //
    // Scope rationale, the Logic Seam convention, and the threshold policy live
    // in docs/adr/0001-unit-tests-are-pure-module-logic.md.
    coverage: {
      provider: "v8",
      // Opt-in only. Enabling by default would tax every watch run and all four
      // existing CI unit jobs.
      enabled: false,
      reportOnFailure: true,
      reporter: ["text", ["text-summary", { file: "summary.txt" }], "html"],
      // Ratchet floor, not a target: the measured baseline rounded down, so CI
      // only fails on *regression*. Aggregate (`perFile: false`). Raise these
      // when coverage improves; lowering one needs a reason in the commit.
      thresholds: {
        statements: 90,
        branches: 78,
        functions: 84,
        lines: 90,
      },
      // This allowlist is the definition of business logic: layers whose modules are pure enough to unit test.
      // Untested files only appear in the report when matched here, so a new logic-bearing folder must be added.
      include: [
        "packages/core/src/{apis,constants,libs,services,utils}/**/*.ts",
        "apps/{spa,web,expo}/src/**/{actions,apis,constants,middlewares,services,utils}/**/*.{ts,tsx}",
        "apps/{spa,web,expo}/src/**/*-store.{ts,tsx}",
        "apps/web/src/app/**/*.ts",
        "apps/web/src/proxy.ts",
        "apps/web/src/core/providers/query/client.ts",
      ],
      exclude: [
        "**/*.unit.test.ts",
        "**/*.d.ts",
        "**/types.ts",
        "packages/core/src/libs/i18n/locales/**",
        "apps/*/src/**/constants/env.ts",
        "apps/*/src/core/services/http.ts",
        "apps/web/src/auth/utils/auth.ts",
        "apps/web/src/auth/utils/auth.client.ts",
        "apps/web/src/app/**/route.ts",
        "apps/web/src/app/manifest.ts",
        "apps/web/src/app/api/rate-limit.ts",
        "apps/web/src/core/utils/i18n.ts",
        "apps/expo/src/core/constants/env/**",
      ],
    },
  },
});

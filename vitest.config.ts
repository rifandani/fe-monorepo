import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "threads",
    isolate: false,
    fileParallelism: true,
    css: false,
    passWithNoTests: false,
    projects: ["packages/core", "apps/spa", "apps/web", "apps/expo"],
    // `coverage` is root-only (it sits in Vitest's `NonProjectOptions`), so it cannot be split across the four `defineProject` configs.
    // Consequence: `--project <name> --coverage` measures this global `include` list against a partial run and reports every other project at 0%. Always run the whole suite (`bun test:unit:cov`).
    //
    // Scope rationale, the Logic Seam convention, and the threshold policy live in docs/adr/0001-unit-tests-are-pure-module-logic.md.
    coverage: {
      provider: "v8",
      // Opt-in only. Enabling by default would tax every watch run and every focused `--project` run; the `unit` CI job opts in via `--coverage`.
      enabled: false,
      reportOnFailure: true,
      reporter: ["text", ["text-summary", { file: "summary.txt" }], "html"],
      // Deliberately not `./coverage`, which is reserved for fallow's runtime
      // sidecar traces. Feeding fallow test coverage would make it report the
      // ADR-sanctioned untested layers as dead code.
      reportsDirectory: "./coverage/vitest",
      // Floor, not a target, and deliberately *below* the measured baseline. Enforced per file (`perFile: true`), so one thinly covered module cannot hide behind the rest of the suite.
      // The suite only clears 100 because the repo is boilerplate-sized; pinning the floor there would fail CI on the first partially covered file added to `include`, which is ordinary work, not a regression. 90 leaves room for that while still catching a real slide. Lowering it needs a reason in the commit.
      thresholds: {
        perFile: true,
        statements: 90,
        branches: 90,
        functions: 90,
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
        // Orphaned Tamagui starter scaffolding (already `fallow-ignore-file unused-file`): nothing imports it, and `createThemes` throws on its empty `childrenThemes` palettes, so it cannot even be imported by a test.
        "apps/expo/src/core/constants/theme.ts",
      ],
    },
  },
});

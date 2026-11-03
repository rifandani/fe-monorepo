import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Vitest 5 clears mock history before each test by default.
    // Several unit files assert side effects from module init or `beforeAll` (MSW, web-vitals, expo composition roots).
    clearMocks: false,
    pool: "threads",
    isolate: false,
    fileParallelism: true,
    css: false,
    passWithNoTests: false,
    projects: ["packages/core", "apps/spa", "apps/expo"],
    // `coverage` is root-only (it sits in Vitest's `NonProjectOptions`), so it cannot be split across the three `defineProject` configs.
    // Consequence: `--project <name> --coverage` measures this global `include` list against a partial run and reports every other project at 0%. Always run the whole suite (`bun test:unit:cov`).
    //
    // Scope rationale, the Logic Seam convention, and the threshold policy live in docs/adr/0001-unit-tests-are-pure-module-logic.md.
    coverage: {
      provider: "v8",
      // Opt-in only. Enabling by default would tax every watch run and every focused `--project` run; the `unit` CI job opts in via `--coverage`.
      enabled: false,
      reportOnFailure: true,
      reporter: ["text", ["text-summary", { file: "summary.txt" }], "html"],
      // Deliberately not `./coverage` itself, whose root is reserved for fallow's
      // runtime sidecar traces. Feeding fallow test coverage would make it report the
      // ADR-sanctioned untested layers as dead code. Test reports live in named
      // subdirectories instead — `coverage/vitest` here, `coverage/stryker` for
      // mutation output (ADR-0003).
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
        "packages/core/src/**/*.ts",
        "apps/{spa,expo}/src/**/{actions,apis,constants,layers,middlewares,services,utils}/**/*.{ts,tsx}",
        "apps/{spa,expo}/src/**/*-store.{ts,tsx}",
        // A feature folder's own endpoints and query options (`user/api.ts`).
        "apps/{spa,expo}/src/**/{api,queries}.ts",
      ],
      exclude: [
        "**/*.unit.test.ts",
        "**/*.d.ts",
        "**/types.ts",
        // all constants
        "apps/*/src/**/constants/**",
        "packages/*/src/**/constants/**",
        // Pure Schema modules — declarations only, no functions. ADR-0001 puts
        // "plain Schema shapes" out of test scope, but leaving them in `include` gave
        // them a free 100%: importing a schema file executes every line, so this file
        // scored 100% statements/branches/lines with no test file in existence.
        // Mutation testing is what exposed it (9.09%, ADR-0003). Excluded so the
        // coverage figure means something. Each core domain folder keeps its
        // schemas in `schemas.ts`, so one glob covers them; its `api.ts` and
        // `queries.ts` stay in — their functions are tested.
        "{packages/core,apps/spa,apps/expo}/src/**/schemas.ts",
        "packages/core/src/i18n/locales/**",
        // React glue: the toolbox hooks and the providers. ADR-0001 puts React
        // components and hooks out of unit-test scope.
        "packages/core/src/hooks/**",
        "packages/core/src/**/provider.ts",
        // Composition roots: the env, Layer, Persistence, Session and runtime
        // declarations of each app. The wiring that can be wrong — the Session,
        // the Access Token, a rejected token — lives in core's `session/`,
        // `persistence/` and `http/`, all of which are measured. Adapters with
        // logic of their own (`layers/mmkv.ts`) stay in.
        "apps/*/src/core/layers/{env,http,persistence,runtime,session,telemetry}.ts",
      ],
    },
  },
});

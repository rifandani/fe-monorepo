import { strict as effectStrict } from "@effect/tsgo/oxlint-presets";
import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import tanstackJsPlugins from "ultracite/oxlint/tanstack/js-plugins";

export default defineConfig({
  extends: [
    core,
    antiSlop,
    // github + sonarjs stay out; react-doctor (incl. compiler overlap) stays.
    selectJsPlugins(["react-doctor"]),
    react,
    tanstack,
    tanstackJsPlugins,
    // Effect diagnostics through the `effecttsgo` plugin. The `prepare` script
    // patches the oxlint and oxlint-tsgolint binaries to include it. The preset
    // turns on type-aware mode, so core's type-aware rules also run.
    effectStrict,
  ],
  // oxlint does not merge `settings` or `env` from extends; curated react-doctor mode.
  env: core.env,
  settings: jsPluginSettings,
  rules: {
    "sort-keys": "off",
    "no-inline-comments": "off",
    "no-nested-ternary": "off",
    "unicorn/no-array-reduce": "off",
    "react/jsx-no-constructed-context-values": "off",
    // Next.js `page`/`error`/`not-found` and Expo route files use function declarations; ultracite 7.10 forces arrows.
    "react/function-component-definition": "off",
    // Next metadata + TanStack `Route` + context modules export non-components.
    "react-doctor/only-export-components": "off",
    // Existing `oxlint-disable` on hooks/effects; compiler still runs.
    "react/rule-suppression": "off",
    // Effect error classes extend a factory call, `Schema.TaggedError<Self>()(…)`.
    // The rule reads that call as a bare `Error(…)` and its autofix inserts a
    // `new` that breaks the class. `new` on real errors stays enforced by review.
    "unicorn/throw-new-error": "off",
    // `Effect.gen(function* () {…})` and `Effect.fn("name")(function* () {…})`
    // are the Effect idiom; the span or the enclosing binding names them.
    "func-names": ["error", "always", { generators: "never" }],
    // Upstream keeps the `*-in-effect` family off. Use the Effect services
    // (`Console`, `Clock`/`DateTime`) inside an Effect.
    "effecttsgo/global-console-in-effect": "error",
    "effecttsgo/global-date-in-effect": "error",
    // Effect 4 ships `@effect/vitest`, `@effect/atom-react` and the HTTP
    // client as unstable modules. The app uses them on purpose.
    "effecttsgo/unstable-api-usage": "off",
    // TanStack Router redirects and 404s by throwing `redirect()` and
    // `notFound()`, which are not `Error` objects.
    "typescript/only-throw-error": [
      "error",
      {
        allow: [
          {
            from: "package",
            package: "@tanstack/router-core",
            name: ["Redirect", "NotFoundError"],
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // React Aria wires `<Label>` to its control through the parent field's
      // context (`TextField`, `Select`, ...), not `htmlFor` or nesting, so
      // ultracite 8's `label-has-associated-control` reports every field.
      files: ["apps/spa/src/**"],
      rules: {
        "jsx-a11y/label-has-associated-control": "off",
      },
    },
    {
      // Server actions, `next/headers`, `server-only` and the otel singletons are module-scoped by design, so their unit tests mock the module rather than reshaping production code around injection. Every other anti-slop rule stays on for test files.
      files: ["**/*.unit.test.ts", "**/*.unit.test.tsx", "**/e2e/**"],
      rules: {
        "anti-slop/no-module-mocking": "off",
      },
    },
    {
      // `toErrorMessage` and `toReportedError` are the parsers at a boundary
      // where the input is definitionally unparsed: a caught failure. They
      // check every shape before trusting it, and a narrower parameter would
      // only move the cast to each caller.
      files: [
        "packages/core/src/utils/error.ts",
        "apps/spa/src/core/utils/telemetry.ts",
      ],
      rules: {
        "anti-slop/no-unknown-parameters": "off",
      },
    },
    {
      files: [
        "packages/core/src/libs/i18n/locales/en-US.ts",
        "packages/core/src/libs/i18n/locales/id-ID.ts",
      ],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
  ],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "**/apps/spa/src/routeTree.gen.ts",
    "**/apps/*/src/core/components/ui/**",
    "**/.agents",
    "**/.claude",
    "**/.cursor",
    "**/.repos",
    "**/repos",
    "**/.impeccable",
    "**/docs",
  ],
});

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
  ],
  // oxlint does not merge `settings` from extends; curated react-doctor mode.
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
  },
  overrides: [
    {
      // Server actions, `next/headers`, `server-only` and the otel singletons are module-scoped by design, so their unit tests mock the module rather than reshaping production code around injection. Every other anti-slop rule stays on for test files.
      files: ["**/*.unit.test.ts", "**/*.unit.test.tsx", "**/e2e/**"],
      rules: {
        "anti-slop/no-module-mocking": "off",
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
    "**/docs",
  ],
});

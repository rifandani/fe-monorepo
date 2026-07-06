import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
  extends: [core, react, tanstack, next],
  rules: {
    "sort-keys": "off",
    "no-inline-comments": "off",
    "no-nested-ternary": "off",
    complexity: "off",
    "unicorn/no-array-reduce": "off",
  },
  overrides: [
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
    "**/docs",
  ],
});

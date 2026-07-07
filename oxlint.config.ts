import type { OxlintConfig } from "oxlint";
import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";

const isGithubOrSonarjsRule = (ruleName: string) =>
  ruleName.startsWith("github/") || ruleName.startsWith("sonarjs/");

const stripGithubSonarjs = (config: OxlintConfig): OxlintConfig => {
  const { jsPlugins: _jsPlugins, rules, overrides, ...rest } = config;

  const filteredRules = rules
    ? Object.fromEntries(
        Object.entries(rules).filter(([name]) => !isGithubOrSonarjsRule(name))
      )
    : undefined;

  const filteredOverrides = overrides?.map((override) => ({
    ...override,
    rules: override.rules
      ? Object.fromEntries(
          Object.entries(override.rules).filter(
            ([name]) => !isGithubOrSonarjsRule(name)
          )
        )
      : undefined,
  }));

  return {
    ...rest,
    ...(filteredRules ? { rules: filteredRules } : {}),
    ...(filteredOverrides ? { overrides: filteredOverrides } : {}),
  };
};

// ultracite/oxlint/core bundles eslint-plugin-github + eslint-plugin-sonarjs via
// jsPlugins (~1-3s each). Strip plugin + rules; react-doctor stays via react presets.
const coreWithoutGithubSonarjs = stripGithubSonarjs(core);

export default defineConfig({
  extends: [coreWithoutGithubSonarjs, react, tanstack, next],
  rules: {
    "sort-keys": "off",
    "no-inline-comments": "off",
    "no-nested-ternary": "off",
    complexity: "off",
    "unicorn/no-array-reduce": "off",
    "react-doctor/nextjs-no-side-effect-in-get-handler": "off",
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

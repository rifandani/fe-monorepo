import vitestConfig from "./vitest.config.ts";

const { include, exclude } = vitestConfig.test.coverage ?? {};

if (!(Array.isArray(include) && Array.isArray(exclude))) {
  throw new TypeError(
    "stryker.config.mjs expects `test.coverage.include`/`exclude` arrays in vitest.config.ts. " +
      "See docs/adr/0003-mutation-testing-is-advisory.md — mutation scope is derived from that allowlist, not copied."
  );
}

export default {
  $schema: "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",

  mutate: [...include, ...exclude.map((glob) => `!${glob}`)],

  mutator: { excludedMutations: [] },

  testRunner: "vitest",
  plugins: ["@stryker-mutator/vitest-runner"],

  vitest: { configFile: "vitest.config.ts" },

  tsconfigFile: "",

  concurrency: 2,
  disableBail: true,

  thresholds: { high: 80, low: 60, break: null },

  incremental: false,
  incrementalFile: "coverage/stryker/incremental.json",

  reporters: ["html", "json", "clear-text", "progress"],
  htmlReporter: { fileName: "coverage/stryker/mutation.html" },
  jsonReporter: { fileName: "coverage/stryker/mutation.json" },

  ignorePatterns: [
    ".claude",
    ".agents",
    ".cursor",
    ".fallow",
    ".husky",
    ".vscode",
    ".changeset",
    ".github",
    "docker",
    "coverage",
    "**/docs/**",
    "**/e2e/**",
    "**/.next/**",
    "**/.expo/**",
    "**/dev-dist/**",
    "**/ios/**",
    "**/android/**",
    "**/Pods/**",
    "**/.gradle/**",
    "**/dist/**",
    "**/build/**",
    "**/.tamagui/**",
    "**/.tanstack/**",
    "**/.vercel/**",
    "**/.repos/**",
    "**/repos/**",
  ],
};

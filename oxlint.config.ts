import { strict as effectStrict } from "@effect/tsgo/oxlint-presets";
import { defineConfig } from "oxlint";
import type { OxlintConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import tanstackJsPlugins from "ultracite/oxlint/tanstack/js-plugins";

const presets = [
  core,
  antiSlop,
  selectJsPlugins(["react-doctor"]),
  react,
  tanstack,
  tanstackJsPlugins,
  effectStrict,
];

const rules: OxlintConfig["rules"] = {
  "comments/no-comments": "error",
  "comments/directive-reason": "error",
  "effect-config/no-scattered-read-env": "error",
  "effect-tests/no-manual-effect-runtime-in-tests": "error",
  "persistence/versioned-kvs-key": "error",
  "tanstack-query/explicit-retry": "error",
  "anti-slop-effect/no-manual-effect-error-tag": "error",
  "anti-slop-effect/no-manual-tag-comparison": "error",
  "anti-slop-effect/no-manual-tagged-construction": "error",
  "anti-slop-effect/no-manual-tagged-type": "error",
  "anti-slop-effect/no-service-constructor-imports": "error",
  "anti-slop-effect/prefer-effect-match": "error",
  "anti-slop-effect/prefer-tagged-error-handling": "error",
  "anti-slop-effect/require-cause-when-narrowing": "error",
  "anti-slop-effect/require-operation-span": "error",
  "landmines/no-fixed-sleep": "error",
  "landmines/no-flake-masking": "error",
  "landmines/no-flake-masking-timeout": ["warn", { check: "timeout" }],
  "landmines/no-test-doubles": "warn",
  "landmines/no-unowned-task": "error",
  "landmines/no-unsignaled-poll": "error",
  "sort-keys": "off",
  "no-inline-comments": "off",
  "no-nested-ternary": "off",
  "unicorn/no-array-reduce": "off",
  "react/jsx-no-constructed-context-values": "off",
  "react/rule-suppression": "off",
  "unicorn/throw-new-error": "off",
  "xstate-effect/no-inline-effect": "error",
  "func-names": ["error", "always", { generators: "never" }],
  "effecttsgo/global-console-in-effect": "error",
  "effecttsgo/global-date-in-effect": "error",
  "effecttsgo/unstable-api-usage": "off",
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
};

const effectHookBanMessage =
  "Do not call useEffect or useLayoutEffect in app code. You might not need an Effect: https://react.dev/learn/you-might-not-need-an-effect. If you must sync with an external system, use or add a shared hook in @workspace/core/hooks.";

const effectHookImportBan = {
  name: "react",
  importNames: ["useEffect", "useLayoutEffect"],
  message: effectHookBanMessage,
};

const filesAllowedToUseEffectHooks = [
  "apps/*/src/components/ui/**",
  "apps/*/src/hooks/*",
  "apps/spa/src/providers/*",
];

const appWorkspaces = [
  {
    app: "spa",
    otherApp: "expo",
    message: "SPA code must not import the Expo app.",
  },
  {
    app: "expo",
    otherApp: "spa",
    message: "Expo code must not import the SPA app.",
  },
];

const appImportOverrides: NonNullable<OxlintConfig["overrides"]> =
  appWorkspaces.flatMap(({ app, otherApp, message }) => {
    const otherAppImport = {
      regex: `^@workspace/${otherApp}(?:/|$)|^\\..*/${otherApp}(?:/|$)`,
      message,
    };

    const appFiles = `apps/${app}/src/**`;

    return [
      {
        files: [appFiles],
        rules: {
          "no-restricted-imports": [
            "error",
            { patterns: [otherAppImport], paths: [effectHookImportBan] },
          ],
        },
      },
      {
        files: filesAllowedToUseEffectHooks.filter(
          (file) =>
            file.startsWith(`apps/${app}/`) || file.startsWith("apps/*/")
        ),
        rules: {
          "no-restricted-imports": ["error", { patterns: [otherAppImport] }],
        },
      },
    ];
  });

const allRuleNames = new Set([
  ...presets.flatMap((preset) => [
    ...Object.keys(preset.rules ?? {}),
    ...(preset.overrides ?? []).flatMap((override) =>
      Object.keys(override.rules ?? {})
    ),
  ]),
  ...Object.keys(rules ?? {}),
]);

const allRulesOff = Object.fromEntries(
  [...allRuleNames].map((rule) => [rule, "off" as const])
);

export default defineConfig({
  extends: presets,
  options: {
    typeAware: true,
    typeCheck: true,
  },
  env: core.env,
  settings: jsPluginSettings,
  jsPlugins: [
    "@xstate/effect/oxlint",
    "./tools/lint/oxlint-plugin-comments.ts",
    "./tools/lint/effect-config.ts",
    "./tools/lint/effect-tests.ts",
    "./tools/lint/persistence.ts",
    "./tools/lint/tanstack-query.ts",
    {
      name: "anti-slop-effect",
      specifier: "./tools/lint/anti-slop-effect/index.ts",
    },
    { name: "landmines", specifier: "./tools/lint/landmines/index.ts" },
  ],
  rules,
  overrides: [
    {
      files: ["tools/lint/anti-slop-effect/**", "tools/lint/landmines/**"],
      rules: {
        "anti-slop/no-runtime-typeof": "off",
        "anti-slop/require-readable-spacing": "off",
        "import/consistent-type-specifier-style": "off",
        "anti-slop-effect/no-service-constructor-imports": "off",
        "eslint/complexity": "off",
        "eslint/func-style": "off",
        "eslint/no-nested-ternary": "off",
        "eslint/no-use-before-define": "off",
        "eslint/no-useless-return": "off",
        "eslint/prefer-destructuring": "off",
        "promise/prefer-await-to-callbacks": "off",
        "typescript/consistent-return": "off",
        "typescript/strict-boolean-expressions": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/no-lonely-if": "off",
        "unicorn/prefer-array-index-of": "off",
      },
    },
    {
      files: ["apps/spa/src/**"],
      rules: {
        "jsx-a11y/label-has-associated-control": "off",
      },
    },
    {
      files: ["**/*.unit.test.ts", "**/*.unit.test.tsx", "**/e2e/**"],
      rules: {
        "anti-slop/no-module-mocking": "off",
      },
    },
    {
      files: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/e2e/**",
      ],
      rules: {
        "landmines/no-unowned-task": "off",
      },
    },
    {
      files: [
        "packages/core/src/i18n/locales/en-US.ts",
        "packages/core/src/i18n/locales/id-ID.ts",
      ],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
    {
      files: ["apps/*/src/components/ui/**"],
      rules: allRulesOff,
    },
    ...appImportOverrides,
    {
      files: ["packages/core/src/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                regex:
                  "^@workspace/(?:spa|expo)(?:/|$)|^\\..*/apps/(?:spa|expo)(?:/|$)",
                message: "Shared core code must not import an app.",
              },
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "**/apps/spa/src/app/routeTree.gen.ts",
    "**/.agents",
    "**/.claude",
    "**/.cursor",
    "**/.repos",
    "**/repos",
    "**/.impeccable",
    "docs/**",
    "apps/*/docs/**",
    "packages/*/docs/**",
  ],
});

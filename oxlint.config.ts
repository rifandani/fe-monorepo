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
  ],
  rules,
  overrides: [
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
        "packages/core/src/utils/error.ts",
        "apps/spa/src/utils/telemetry.ts",
      ],
      rules: {
        "anti-slop/no-unknown-parameters": "off",
      },
    },
    {
      files: ["scripts/security/sca-gate-core.ts"],
      rules: {
        "anti-slop/no-unknown-parameters": "off",
        "anti-slop/no-unsafe-dictionary-type": "off",
        "anti-slop/no-runtime-typeof": "off",
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
    "**/docs",
  ],
});

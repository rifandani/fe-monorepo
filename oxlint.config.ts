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
  // github + sonarjs stay out; react-doctor (incl. compiler overlap) stays.
  selectJsPlugins(["react-doctor"]),
  react,
  tanstack,
  tanstackJsPlugins,
  // Effect diagnostics through the `effecttsgo` plugin. The `prepare` script
  // patches the oxlint and oxlint-tsgolint binaries to include it.
  effectStrict,
];

const rules: OxlintConfig["rules"] = {
  "comments/no-comments": "error",
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
  // An inline `enq(() => Effect.log(...))` in an XState transition builds an
  // Effect that never runs. Register Effect actions in `setupEffect` instead.
  "xstate-effect/no-inline-effect": "error",
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
};

// Every rule that a preset, one of its overrides, or this config sets. An
// override that turns all of them off keeps the type check on its files but
// runs no lint rule on them.
const effectHookBanMessage =
  "Do not call useEffect or useLayoutEffect in app code. You might not need an Effect: https://react.dev/learn/you-might-not-need-an-effect. If you must sync with an external system, use or add a shared hook in @workspace/core/hooks.";

const effectHookImportBan = {
  name: "react",
  importNames: ["useEffect", "useLayoutEffect"],
  message: effectHookBanMessage,
};

const filesAllowedToUseEffectHooks = [
  "apps/*/src/components/ui/**",
  "apps/expo/src/hooks/*",
  "apps/spa/src/hooks/*",
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
  // `typeAware` runs the rules that need type information. `typeCheck` also
  // reports the TypeScript compiler diagnostics, so `bun lint` replaces
  // `tsc --noEmit`. Both need `oxlint-tsgolint`. Set here because oxlint
  // does not merge `options` from extends.
  options: {
    typeAware: true,
    typeCheck: true,
  },
  // oxlint does not merge `settings` or `env` from extends; curated react-doctor mode.
  env: core.env,
  settings: jsPluginSettings,
  jsPlugins: [
    "@xstate/effect/oxlint",
    "./tools/lint/oxlint-plugin-comments.ts",
  ],
  rules,
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
        "apps/spa/src/utils/telemetry.ts",
      ],
      rules: {
        "anti-slop/no-unknown-parameters": "off",
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
      // shadcn/Intent UI components (`bun bump:ui` overwrites them). No lint
      // style rule runs on them. The workspace import restrictions below and
      // the type check still cover them.
      files: ["apps/*/src/components/ui/**"],
      rules: allRulesOff,
    },
    // Each Fallow preset runs inside one workspace. Keep imports between
    // workspaces in the package dependency direction: apps consume core.
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

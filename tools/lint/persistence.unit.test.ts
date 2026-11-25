import { RuleTester } from "oxlint/plugins-dev";

import { versionedKvsKey } from "./persistence.ts";

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const unlisted = (code: string) => ({
  code,
  errors: [{ messageId: "unlistedKey" }],
});

const unversioned = (code: string, keys: readonly string[]) => ({
  code,
  errors: keys.map((key) => ({ data: { key }, messageId: "unversionedKey" })),
});

tester.run("persistence/versioned-kvs-key", versionedKvsKey, {
  valid: [
    "Atom.kvs({ runtime, key: persistenceKeys.session, schema, defaultValue: () => null });",
    "Atom.kvs({ runtime, key: featureFlagStoreName, schema, defaultValue: () => ({}) });",
    'import { Atom as ReactivityAtom } from "effect/reactivity"; ReactivityAtom.kvs({ runtime, key: persistenceKeys.session, schema, defaultValue: () => null });',
    'Other.kvs({ runtime, key: "raw-key", schema, defaultValue: () => null });',
    'export const persistenceKeys = { locale: "app-locale.v1", session: "app-user.v1", theme: "app-theme.v1" } as const;',
    'const persistenceKeys = { session: "app-user.v2", multiDigit: "app-state.v12" } as const;',
    'export const featureFlagStoreName = "app-feature-flags.v1" as const;',
    "const featureFlagStoreName = `app-feature-flags.v1`;",
    'const unrelated = { session: "app-user" };',
  ],
  invalid: [
    unlisted(
      'Atom.kvs({ runtime, key: "app-user.v1", schema, defaultValue: () => null });'
    ),
    unlisted(
      'Atom.kvs({ runtime, key: "app-user", schema, defaultValue: () => null });'
    ),
    unlisted(
      "Atom.kvs({ runtime, key: otherKeys.session, schema, defaultValue: () => null });"
    ),
    unlisted(
      "Atom.kvs({ runtime, key: persistenceKeys[name], schema, defaultValue: () => null });"
    ),
    unlisted(
      `Atom.kvs({ runtime, key: \`\${persistenceKeys.session}\`, schema, defaultValue: () => null });`
    ),
    unlisted("Atom.kvs({ runtime, schema, defaultValue: () => null });"),
    unlisted("Atom.kvs(options);"),
    unlisted(
      'import { Atom as ReactivityAtom } from "effect/reactivity"; ReactivityAtom.kvs({ runtime, key: "app-user.v1", schema, defaultValue: () => null });'
    ),
    unlisted(
      'import * as StateAtom from "effect/reactivity/Atom"; StateAtom.kvs({ runtime, key: "app-user.v1", schema, defaultValue: () => null });'
    ),
    unversioned('const persistenceKeys = { session: "app-user" } as const;', [
      "app-user",
    ]),
    unversioned(
      'export const persistenceKeys = { locale: "app-locale.v1", session: "app-user", theme: "app-theme.v0" } as const;',
      ["app-user", "app-theme.v0"]
    ),
    unversioned(
      'const persistenceKeys = { session: "app-user-v1" } as const;',
      ["app-user-v1"]
    ),
    unversioned('const persistenceKeys = { session: ".v1" } as const;', [
      ".v1",
    ]),
    unversioned(
      'const persistenceKeys = { session: "app-user.v1.beta" } as const;',
      ["app-user.v1.beta"]
    ),
    unversioned("const persistenceKeys = { session: dynamicKey } as const;", [
      "dynamicKey",
    ]),
    unversioned("const persistenceKeys = { ...otherKeys } as const;", [
      "...otherKeys",
    ]),
    unversioned("const persistenceKeys = makeKeys();", ["makeKeys()"]),
    unversioned(
      'export const featureFlagStoreName = "app-feature-flags" as const;',
      ["app-feature-flags"]
    ),
    unversioned(
      'export const featureFlagStoreName = "app-feature-flags.v0" as const;',
      ["app-feature-flags.v0"]
    ),
    unversioned("export const featureFlagStoreName = dynamicName;", [
      "dynamicName",
    ]),
  ],
});

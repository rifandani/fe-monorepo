import { definePlugin, defineRule } from "@oxlint/plugins";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import {
  findProperty,
  moduleImportAliases,
  namedImportAliases,
  unwrapExpression,
} from "./ast.ts";

const PERSISTENCE_KEYS_NAME = "persistenceKeys";
const FEATURE_FLAG_KEY_NAME = "featureFlagStoreName";
const VERSIONED_KEY_PATTERN = /^[^.\s].*\.v[1-9]\d*$/u;

type LiteralValue = Extract<
  ESTree.Expression,
  { readonly type: "Literal" }
>["value"];

const isStringLiteralValue = (value: LiteralValue): value is string =>
  value === String(value);

const staticStringValue = (
  expression: ESTree.Expression
): string | undefined => {
  const node = unwrapExpression(expression);

  if (node.type === "Literal" && isStringLiteralValue(node.value)) {
    return node.value;
  }

  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked ?? undefined;
  }

  return undefined;
};

const isAtomKvsCall = (
  node: ESTree.CallExpression,
  atomNames: ReadonlySet<string>
): boolean => {
  const callee = unwrapExpression(node.callee);

  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    atomNames.has(callee.object.name) &&
    callee.property.type === "Identifier" &&
    callee.property.name === "kvs"
  );
};

const isAllowedKeyExpression = (expression: ESTree.Expression): boolean => {
  const node = unwrapExpression(expression);

  if (node.type === "Identifier") {
    return node.name === FEATURE_FLAG_KEY_NAME;
  }

  return (
    node.type === "MemberExpression" &&
    !node.computed &&
    node.object.type === "Identifier" &&
    node.object.name === PERSISTENCE_KEYS_NAME &&
    node.property.type === "Identifier"
  );
};

const atomAliasesFromImport = (
  statement: ESTree.ImportDeclaration
): readonly string[] => {
  const source = statement.source.value;

  if (source === "effect/reactivity") {
    return namedImportAliases(statement, "Atom");
  }

  if (source === "effect/reactivity/Atom") {
    return moduleImportAliases(statement);
  }

  return [];
};

const collectAtomNames = (program: ESTree.Program): ReadonlySet<string> => {
  const names = new Set<string>(["Atom"]);

  for (const statement of program.body) {
    if (statement.type !== "ImportDeclaration") {
      continue;
    }

    for (const alias of atomAliasesFromImport(statement)) {
      names.add(alias);
    }
  }

  return names;
};

const reportIfUnversioned = (
  expression: ESTree.Expression,
  sourceCode: SourceCode,
  report: (node: ESTree.Node, key: string) => void
) => {
  const value = staticStringValue(expression);

  if (value === undefined || !VERSIONED_KEY_PATTERN.test(value)) {
    report(expression, value ?? sourceCode.getText(expression));
  }
};

export const versionedKvsKey = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Require Atom.kvs keys to come from persistenceKeys or featureFlagStoreName and carry a version suffix (for example app-user.v1).",
    },
    messages: {
      unlistedKey:
        "Atom.kvs must read its key from `persistenceKeys` or `featureFlagStoreName`. Fix: add a versioned key (for example `app-user.v1`) to `persistenceKeys` and pass `persistenceKeys.<name>`.",
      unversionedKey:
        'Persisted key "{{key}}" must be a static string literal with a version suffix (for example `app-user.v1`). Fix: add a `.v1` suffix, or bump the version and migrate old stored data.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const atomNames = collectAtomNames(sourceCode.ast);

    const reportUnversioned = (node: ESTree.Node, key: string) => {
      context.report({ data: { key }, messageId: "unversionedKey", node });
    };

    return {
      CallExpression(node) {
        if (!isAtomKvsCall(node, atomNames)) {
          return;
        }

        const [firstArgument] = node.arguments;

        if (
          firstArgument === undefined ||
          firstArgument.type === "SpreadElement"
        ) {
          context.report({ messageId: "unlistedKey", node });

          return;
        }

        const options = unwrapExpression(firstArgument);

        if (options.type !== "ObjectExpression") {
          context.report({ messageId: "unlistedKey", node: firstArgument });

          return;
        }

        const keyProperty = findProperty(options, "key");

        if (keyProperty === undefined) {
          context.report({ messageId: "unlistedKey", node: options });

          return;
        }

        if (!isAllowedKeyExpression(keyProperty.value)) {
          context.report({ messageId: "unlistedKey", node: keyProperty });
        }
      },
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier" || node.init === null) {
          return;
        }

        if (node.id.name === FEATURE_FLAG_KEY_NAME) {
          reportIfUnversioned(node.init, sourceCode, reportUnversioned);

          return;
        }

        if (node.id.name !== PERSISTENCE_KEYS_NAME) {
          return;
        }

        const init = unwrapExpression(node.init);

        if (init.type !== "ObjectExpression") {
          reportUnversioned(node.init, sourceCode.getText(node.init));

          return;
        }

        for (const property of init.properties) {
          if (property.type !== "Property") {
            reportUnversioned(property, sourceCode.getText(property));
            continue;
          }

          reportIfUnversioned(property.value, sourceCode, reportUnversioned);
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "persistence" },
  rules: { "versioned-kvs-key": versionedKvsKey },
});

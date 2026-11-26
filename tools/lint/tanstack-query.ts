import { definePlugin, defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

import {
  findProperty,
  moduleImportAliases,
  namedImportAliases,
  propertyAtPath,
  unwrapExpression,
} from "./ast.ts";

const QUERY_CLIENT_NAME = "QueryClient";
const RETRY_KINDS = ["queries", "mutations"] as const;

type RetryKind = (typeof RETRY_KINDS)[number];

interface QueryClientNames {
  readonly classes: ReadonlySet<string>;
  readonly namespaces: ReadonlySet<string>;
}

const collectQueryClientNames = (program: ESTree.Program): QueryClientNames => {
  const classes = new Set<string>([QUERY_CLIENT_NAME]);
  const namespaces = new Set<string>();

  for (const statement of program.body) {
    if (
      statement.type !== "ImportDeclaration" ||
      !statement.source.value.startsWith("@tanstack/")
    ) {
      continue;
    }

    for (const alias of namedImportAliases(statement, QUERY_CLIENT_NAME)) {
      classes.add(alias);
    }

    for (const alias of moduleImportAliases(statement)) {
      namespaces.add(alias);
    }
  }

  return { classes, namespaces };
};

const isQueryClientCallee = (
  expression: ESTree.Expression,
  { classes, namespaces }: QueryClientNames
): boolean => {
  const callee = unwrapExpression(expression);

  if (callee.type === "Identifier") {
    return classes.has(callee.name);
  }

  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    namespaces.has(callee.object.name) &&
    callee.property.type === "Identifier" &&
    callee.property.name === QUERY_CLIENT_NAME
  );
};

export const explicitRetry = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Require new QueryClient(...) to set defaultOptions.queries.retry and defaultOptions.mutations.retry explicitly, so that the retry policy is a decision and not a library default.",
    },
    messages: {
      missingRetry:
        "QueryClient must set `defaultOptions.{{kind}}.retry` explicitly. If you do not set it, TanStack Query uses its own default. `Http` also replays a request once after a 401. Then nobody owns the total retry load. Fix: add `retry` to `defaultOptions.{{kind}}` (for example `retry: false` in a test, see ADR-0006).",
      unverifiableOptions:
        "QueryClient options must be an inline object literal, so the retry policy can be checked. Fix: pass `{ defaultOptions: { queries: { retry }, mutations: { retry } } }` inline.",
    },
  },
  create(context) {
    const queryClientNames = collectQueryClientNames(context.sourceCode.ast);

    const reportMissing = (node: ESTree.Node, kinds: readonly RetryKind[]) => {
      for (const kind of kinds) {
        context.report({ data: { kind }, messageId: "missingRetry", node });
      }
    };

    const checkKind = (
      defaultOptions: ESTree.ObjectExpression,
      kind: RetryKind
    ) => {
      const kindProperty = findProperty(defaultOptions, kind);

      if (kindProperty === undefined) {
        reportMissing(defaultOptions, [kind]);

        return;
      }

      const kindOptions = unwrapExpression(kindProperty.value);

      if (
        kindOptions.type !== "ObjectExpression" ||
        findProperty(kindOptions, "retry") === undefined
      ) {
        reportMissing(kindProperty, [kind]);
      }
    };

    return {
      NewExpression(node) {
        if (!isQueryClientCallee(node.callee, queryClientNames)) {
          return;
        }

        const [firstArgument] = node.arguments;

        if (firstArgument === undefined) {
          reportMissing(node, RETRY_KINDS);

          return;
        }

        if (firstArgument.type === "SpreadElement") {
          context.report({ messageId: "unverifiableOptions", node });

          return;
        }

        const options = unwrapExpression(firstArgument);

        if (options.type !== "ObjectExpression") {
          context.report({
            messageId: "unverifiableOptions",
            node: firstArgument,
          });

          return;
        }

        const defaultOptionsProperty = findProperty(options, "defaultOptions");

        if (defaultOptionsProperty === undefined) {
          reportMissing(options, RETRY_KINDS);

          return;
        }

        const defaultOptions = unwrapExpression(defaultOptionsProperty.value);

        if (defaultOptions.type !== "ObjectExpression") {
          reportMissing(defaultOptionsProperty, RETRY_KINDS);

          return;
        }

        for (const kind of RETRY_KINDS) {
          checkKind(defaultOptions, kind);
        }
      },
    };
  },
});

const isLiteral = (node: ESTree.Expression, value: string): boolean => {
  const expression = unwrapExpression(node);

  return expression.type === "Literal" && expression.value === value;
};

export const mutationsFailOffline = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        'Require new QueryClient(...) to set defaultOptions.mutations.networkMode to "always". Then an offline mutation fails at once and does not pause in memory, where a reload loses it.',
    },
    messages: {
      pausableMutations:
        'QueryClient must set `defaultOptions.mutations.networkMode: "always"`. With another network mode, TanStack Query pauses a mutation while the device is offline and keeps it only in memory. A reload then loses it, and the app does not tell the person. Fix: add `networkMode: "always"` to `defaultOptions.mutations`, so the request fails with a network error that the UI shows (see ADR-0006).',
    },
  },
  create(context) {
    const queryClientNames = collectQueryClientNames(context.sourceCode.ast);

    return {
      NewExpression(node) {
        if (!isQueryClientCallee(node.callee, queryClientNames)) {
          return;
        }

        const [firstArgument] = node.arguments;

        if (
          firstArgument !== undefined &&
          (firstArgument.type === "SpreadElement" ||
            unwrapExpression(firstArgument).type !== "ObjectExpression")
        ) {
          return;
        }

        const networkMode = propertyAtPath(firstArgument, [
          "defaultOptions",
          "mutations",
          "networkMode",
        ]);

        if (
          networkMode === undefined ||
          !isLiteral(networkMode.value, "always")
        ) {
          context.report({ messageId: "pausableMutations", node });
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "tanstack-query" },
  rules: {
    "explicit-retry": explicitRetry,
    "mutations-fail-offline": mutationsFailOffline,
  },
});

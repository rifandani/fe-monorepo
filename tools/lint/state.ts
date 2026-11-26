import { definePlugin, defineRule } from "@oxlint/plugins";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import { unwrapExpression } from "./ast.ts";
import { binding } from "./landmines/syntax.ts";

const CLUSTER_SIZE = 3;

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function;

interface Flag {
  readonly name: string;
  readonly node: ESTree.Node;
}

const isBooleanType = (node: ESTree.Node | null | undefined): boolean =>
  node?.type === "TSBooleanKeyword";

const isBooleanValue = (node: ESTree.Expression): boolean => {
  const value = unwrapExpression(node);

  return (
    (value.type === "Literal" &&
      (value.value === true || value.value === false)) ||
    (value.type === "UnaryExpression" && value.operator === "!")
  );
};

const isBooleanInitializer = (
  node: ESTree.CallExpression["arguments"][number] | undefined
): boolean => {
  if (node === undefined || node.type === "SpreadElement") {
    return false;
  }

  if (node.type === "ArrowFunctionExpression") {
    return node.body.type !== "BlockStatement" && isBooleanValue(node.body);
  }

  return isBooleanValue(node);
};

const reactImport = (source: SourceCode, identifier: ESTree.Node) => {
  const definition =
    identifier.type === "Identifier"
      ? binding(source, identifier, identifier.name)?.defs[0]
      : undefined;

  const declaration = definition?.parent;

  return definition?.type === "ImportBinding" &&
    declaration?.type === "ImportDeclaration" &&
    declaration.importKind !== "type" &&
    declaration.source.value === "react"
    ? definition.node
    : undefined;
};

const isUseStateName = (node: ESTree.Node): boolean =>
  node.type === "Identifier" && node.name === "useState";

const isReactNamespace = (specifier: ReturnType<typeof reactImport>): boolean =>
  specifier?.type === "ImportNamespaceSpecifier" ||
  specifier?.type === "ImportDefaultSpecifier";

const isUseStateMember = (
  source: SourceCode,
  callee: ESTree.MemberExpression
): boolean =>
  !callee.computed &&
  isUseStateName(callee.property) &&
  isReactNamespace(reactImport(source, callee.object));

const isUseStateImport = (source: SourceCode, callee: ESTree.Node): boolean => {
  const specifier = reactImport(source, callee);

  return (
    specifier?.type === "ImportSpecifier" &&
    specifier.importKind !== "type" &&
    isUseStateName(specifier.imported)
  );
};

const isUseState = (source: SourceCode, callee: ESTree.Node): boolean =>
  callee.type === "MemberExpression"
    ? isUseStateMember(source, callee)
    : isUseStateImport(source, callee);

const isBooleanState = (node: ESTree.CallExpression): boolean => {
  const [typeArgument] = node.typeArguments?.params ?? [];

  return typeArgument === undefined
    ? isBooleanInitializer(node.arguments[0])
    : isBooleanType(typeArgument);
};

const stateName = (source: SourceCode, node: ESTree.CallExpression) => {
  const { parent } = node;

  if (parent.type !== "VariableDeclarator") {
    return source.getText(node);
  }

  const { id } = parent;

  const named =
    id.type === "ArrayPattern"
      ? id.elements.find((element) => element?.type === "Identifier")
      : undefined;

  return named?.type === "Identifier" ? named.name : source.getText(id);
};

const isFunction = (node: ESTree.Node): node is FunctionNode =>
  node.type === "ArrowFunctionExpression" ||
  node.type === "FunctionDeclaration" ||
  node.type === "FunctionExpression";

const enclosingFunction = (node: ESTree.Node): FunctionNode | undefined => {
  const { parent } = node;

  if (!parent || isFunction(parent)) {
    return parent ?? undefined;
  }

  return enclosingFunction(parent);
};

const isModuleLevel = (node: ESTree.VariableDeclaration): boolean =>
  node.parent.type === "Program" ||
  (node.parent.type === "ExportNamedDeclaration" &&
    node.parent.parent.type === "Program");

const moduleFlags = (node: ESTree.VariableDeclaration): Flag[] =>
  node.declarations.flatMap((declarator) =>
    declarator.id.type === "Identifier" &&
    (isBooleanType(declarator.id.typeAnnotation?.typeAnnotation) ||
      (declarator.init !== null && isBooleanValue(declarator.init)))
      ? [{ name: declarator.id.name, node: declarator }]
      : []
  );

export const noBooleanFlagCluster = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: `Report a function (a component or a hook) that keeps ${CLUSTER_SIZE} or more boolean useState values, or a module that keeps ${CLUSTER_SIZE} or more boolean let values. Such flags are often an implicit state machine.`,
    },
    messages: {
      cluster:
        "These boolean flags can be an implicit state machine: {{names}}. Nobody can list their transitions. Fix (ADR-0010): if the next step depends on the current step, use an XState machine. If not, keep the flags, put their transitions in a pure function with unit tests, and add `// oxlint-disable-next-line state/no-boolean-flag-cluster -- <reason>`.",
    },
  },
  create(context) {
    const source = context.sourceCode;
    const functionFlags = new Map<FunctionNode, Flag[]>();
    const moduleLevelFlags: Flag[] = [];

    const report = (flags: readonly Flag[]) => {
      const [first] = flags;

      if (first === undefined || flags.length < CLUSTER_SIZE) {
        return;
      }

      context.report({
        data: { names: flags.map((flag) => flag.name).join(", ") },
        messageId: "cluster",
        node: first.node,
      });
    };

    return {
      CallExpression(node) {
        const owner = enclosingFunction(node);

        if (
          owner === undefined ||
          !isUseState(source, unwrapExpression(node.callee)) ||
          !isBooleanState(node)
        ) {
          return;
        }

        const flags = functionFlags.get(owner) ?? [];

        flags.push({ name: stateName(source, node), node });
        functionFlags.set(owner, flags);
      },
      VariableDeclaration(node) {
        if (node.kind === "let" && isModuleLevel(node)) {
          moduleLevelFlags.push(...moduleFlags(node));
        }
      },
      "Program:exit"() {
        for (const flags of functionFlags.values()) {
          report(flags);
        }

        report(moduleLevelFlags);
      },
    };
  },
});

export default definePlugin({
  meta: { name: "state" },
  rules: { "no-boolean-flag-cluster": noBooleanFlagCluster },
});

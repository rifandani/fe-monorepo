import { defineRule } from "@oxlint/plugins";
import type { ESTree, SourceCode } from "@oxlint/plugins";

import { unwrapExpression } from "../../ast.ts";
import { binding, effectMethod, memberName } from "../syntax.ts";

const timerNames = new Set(["setInterval", "setTimeout"]);
const globalObjects = new Set(["globalThis", "self", "window"]);
const timerModules = new Set(["node:timers", "timers"]);

const transparentParents = new Set([
  "ChainExpression",
  "ParenthesizedExpression",
  "TSAsExpression",
  "TSNonNullExpression",
  "TSSatisfiesExpression",
]);

const isGlobal = (source: SourceCode, identifier: ESTree.IdentifierReference) =>
  binding(source, identifier, identifier.name) === undefined;

function isGlobalTimer(source: SourceCode, callee: ESTree.Node) {
  if (callee.type === "MemberExpression") {
    const name = memberName(callee);

    return (
      callee.object.type === "Identifier" &&
      globalObjects.has(callee.object.name) &&
      isGlobal(source, callee.object) &&
      name !== undefined &&
      timerNames.has(name)
    );
  }

  if (callee.type !== "Identifier" || !timerNames.has(callee.name)) {
    return false;
  }

  const definition = binding(source, callee, callee.name)?.defs[0];

  if (!definition) {
    return true;
  }

  const declaration = definition.parent;

  return (
    definition.type === "ImportBinding" &&
    declaration?.type === "ImportDeclaration" &&
    timerModules.has(declaration.source.value)
  );
}

function isFork(source: SourceCode, callee: ESTree.Node) {
  return callee.type === "MemberExpression"
    ? memberName(callee) === "runFork"
    : effectMethod(source, callee, "runFork");
}

function passesValueUp(child: ESTree.Node, parent: ESTree.Node) {
  if (transparentParents.has(parent.type)) {
    return true;
  }

  if (parent.type === "UnaryExpression") {
    return parent.operator === "void";
  }

  if (parent.type === "LogicalExpression") {
    return parent.right === child;
  }

  return parent.type === "ConditionalExpression" && parent.test !== child;
}

function isDiscarded(node: ESTree.Node): boolean {
  let child: ESTree.Node = node;
  let parent: ESTree.Node | null = node.parent;

  while (parent && passesValueUp(child, parent)) {
    child = parent;
    parent = parent.parent;
  }

  if (parent?.type === "SequenceExpression") {
    return parent.expressions.at(-1) !== child || isDiscarded(parent);
  }

  return parent?.type === "ExpressionStatement";
}

export const noUnownedTask = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow timers and forked fibers whose handle is thrown away, so that every task has an owner that can stop it.",
    },
    messages: {
      timer:
        "This timer has no owner. The code does not keep its id, so nothing can clear it when the work ends. Fix: keep the id and clear it in the cleanup of the owner (for example a `useEffect` cleanup).",
      fork: "This fiber has no owner. The code does not keep it, so nothing can interrupt it or see its failure. Fix: keep the fiber, or fork it in a scope. If the runtime owns it, add `// oxlint-disable-next-line landmines/no-unowned-task -- <reason>`.",
    },
  },
  create(context) {
    const source = context.sourceCode;

    return {
      CallExpression(node) {
        const callee = unwrapExpression(node.callee);

        if (!isDiscarded(node)) {
          return;
        }

        if (isGlobalTimer(source, callee)) {
          context.report({ node, messageId: "timer" });
        } else if (isFork(source, callee)) {
          context.report({ node, messageId: "fork" });
        }
      },
    };
  },
});

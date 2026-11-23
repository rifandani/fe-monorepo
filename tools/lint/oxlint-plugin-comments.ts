import { definePlugin, defineRule } from "@oxlint/plugins";

import { hasReason, isDirective, isSuppression } from "./comment-directive.ts";

export const noComments = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Ban code comments. Tool directives and SAFETY: justifications stay allowed.",
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (!isDirective(comment)) {
            context.report({
              loc: comment.loc,
              message:
                "Do not write code comments. Put the reason in a name, a test, an ADR or an issue.",
            });
          }
        }
      },
    };
  },
});

export const directiveReason = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Require a reason on every suppression directive: oxlint, eslint, TypeScript, fallow, Stryker, coverage and gitleaks.",
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (isSuppression(comment) && !hasReason(comment)) {
            context.report({
              loc: comment.loc,
              message:
                "This suppression has no reason. Add `-- <reason>` after the directive (for Stryker, `: <reason>` also works), for example `// @ts-expect-error -- the global is deleted on purpose`. Name the invariant that makes it safe.",
            });
          }
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "comments" },
  rules: { "directive-reason": directiveReason, "no-comments": noComments },
});

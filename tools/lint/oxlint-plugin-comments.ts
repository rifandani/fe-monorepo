import { definePlugin, defineRule } from "@oxlint/plugins";

import { isDirective } from "./comment-directive.ts";

const noComments = defineRule({
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

export default definePlugin({
  meta: { name: "comments" },
  rules: { "no-comments": noComments },
});

import path from "node:path";

import { definePlugin, defineRule } from "@oxlint/plugins";

import baselineJson from "./comment-baseline.json" with { type: "json" };
import { isDirective, judgeFile, verdictTag } from "./comment-ratchet.ts";
import type { CommentBaseline } from "./comment-ratchet.ts";

const baseline: CommentBaseline = baselineJson;

const repoRoot = path.resolve(import.meta.dirname, "../..");

const noComments = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Ban code comments. Files in comment-baseline.json keep their count until it reaches zero.",
    },
  },
  create(context) {
    return {
      Program(program) {
        const file = path
          .relative(repoRoot, context.physicalFilename)
          .split(path.sep)
          .join("/");

        const comments = context.sourceCode
          .getAllComments()
          .filter((comment) => !isDirective(comment));

        const verdict = judgeFile(comments.length, baseline[file] ?? 0);

        if (verdict.kind === "over") {
          for (const comment of comments) {
            context.report({
              loc: comment.loc,
              message: `Do not write code comments (ADR-0011). Put the reason in a name, a test, an ADR or an issue. ${verdictTag(verdict.count, verdict.allowed)}`,
            });
          }
        }

        if (verdict.kind === "stale") {
          context.report({
            node: program,
            message: `This file has fewer comments than its baseline. Run \`bun run lint:comments\` to lower it. ${verdictTag(verdict.count, verdict.allowed)}`,
          });
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "comments" },
  rules: { "no-comments": noComments },
});

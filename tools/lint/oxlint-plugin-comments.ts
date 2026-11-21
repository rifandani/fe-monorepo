import path from "node:path";

import { definePlugin, defineRule } from "@oxlint/plugins";

import baselineJson from "./comment-baseline.json" with { type: "json" };
import { planReports } from "./comment-ratchet.ts";
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

        const reports = planReports(
          context.sourceCode.getAllComments(),
          baseline[file] ?? 0,
          program.loc
        );

        for (const report of reports) {
          context.report(report);
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "comments" },
  rules: { "no-comments": noComments },
});

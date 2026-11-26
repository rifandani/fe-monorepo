import { definePlugin, defineRule } from "@oxlint/plugins";

const READ_ENV_NAME = "readEnv";
const LAYERS_FILE_PATTERN = /(?:^|\/)lib\/layers\//u;

const isLayersFile = (filename: string): boolean =>
  LAYERS_FILE_PATTERN.test(filename.replaceAll("\\", "/"));

export const noScatteredReadEnv = defineRule({
  create(context) {
    if (isLayersFile(context.filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === READ_ENV_NAME
        ) {
          context.report({ messageId: "scatteredReadEnv", node: node.callee });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Allow readEnv only in lib/layers files, so the app validates its env in one startup check.",
    },
    messages: {
      scatteredReadEnv:
        "readEnv is allowed only in lib/layers files. A read outside the startup check fails one variable at a time. Fix: import the validated `env` from `@/lib/layers/env` and read its property.",
    },
    type: "problem",
  },
});

export default definePlugin({
  meta: { name: "effect-config" },
  rules: { "no-scattered-read-env": noScatteredReadEnv },
});

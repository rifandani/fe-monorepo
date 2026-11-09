import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/apps/spa/src/app/routeTree.gen.ts",
    "**/apps/*/src/components/ui/**",
    "**/.agents",
    "**/.claude",
    "**/.cursor",
    "**/.repos",
    "**/repos",
    "**/.impeccable",
    "**/docs",
  ],
});

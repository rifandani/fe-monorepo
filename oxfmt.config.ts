import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/apps/*/src/core/components/ui/**",
    "**/.agents",
    "**/.claude",
    "**/.cursor",
    "**/docs",
  ],
});

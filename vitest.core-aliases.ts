import path from "node:path";

import corePackage from "./packages/core/package.json" with { type: "json" };

// Resolve to the sandbox copy during mutation tests (ADR-0004). Derive each
// directory from the exports map so public subpaths keep one source of truth.
export const coreAliases = Object.fromEntries(
  Object.entries(corePackage.exports).map(([specifier, target]) => [
    `@workspace/core/${specifier.slice(2, -2)}`,
    path.resolve(
      import.meta.dirname,
      "packages/core",
      target.slice(0, target.indexOf("*"))
    ),
  ])
);

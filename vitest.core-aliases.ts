import path from "node:path";

import corePackage from "./packages/core/package.json" with { type: "json" };

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

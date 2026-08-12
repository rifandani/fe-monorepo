import fs from "node:fs";
import path from "node:path";

import type { MetadataRoute } from "next";

// fallow-ignore-next-line security-sink -- both components are literals rooted at process.cwd(), not request input
const APP_DIR = path.join(process.cwd(), "src/app");
const url = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? "https://web.fe-monorepo.localhost"
);
const SKIP_DIRS = new Set(["api"]);
const PAGE_FILES = new Set(["page.ts", "page.tsx"]);

/** Private (`_foo`) and route-group (`(foo)`) segments never reach the URL. */
const isHiddenSegment = (name: string) =>
  name.startsWith("_") || name.startsWith("(");

/** A directory contributes routes unless it is hidden or explicitly skipped. */
const isTraversable = (entry: fs.Dirent) =>
  entry.isDirectory() &&
  !(isHiddenSegment(entry.name) || SKIP_DIRS.has(entry.name));

/** Collect `page.ts(x)` routes under `dir`, skipping `_` / `(` segments and `api`. */
export const collectPageRoutes = (dir: string, segment = ""): string[] => {
  const nested: string[] = [];
  let hasPage = false;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (isTraversable(entry)) {
      nested.push(
        ...collectPageRoutes(
          // fallow-ignore-next-line security-sink -- entry.name is a readdir dirent: a single path segment, and isTraversable() gates on isDirectory() so symlinks are never followed
          path.join(dir, entry.name),
          `${segment}/${entry.name}`
        )
      );
      continue;
    }
    hasPage ||= PAGE_FILES.has(entry.name);
  }
  return hasPage ? [segment || "/", ...nested] : nested;
};

const sitemap = (): MetadataRoute.Sitemap => {
  const routes = collectPageRoutes(APP_DIR);
  return routes.map((route) => ({
    lastModified: new Date(),
    url: new URL(route, url).href,
  }));
};
export default sitemap;

import fs from "node:fs";
import path from "node:path";

import type { MetadataRoute } from "next";

const APP_DIR = import.meta.dirname;
const url = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://web.localhost");
const SKIP_DIRS = new Set(["api"]);
const collectPageRoutes = (dir: string, segment = ""): string[] => {
  const routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith("(")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
      routes.push(...collectPageRoutes(fullPath, `${segment}/${entry.name}`));
      continue;
    }
    if (entry.name === "page.tsx" || entry.name === "page.ts") {
      routes.push(segment || "/");
    }
  }
  return routes;
};
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = collectPageRoutes(APP_DIR);
  return routes.map((route) => ({
    lastModified: new Date(),
    url: new URL(route, url).href,
  }));
}

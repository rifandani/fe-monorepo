import { readdir, rm } from "node:fs/promises";
import path from "node:path";

import type { TestProject } from "vitest/node";

export default function setup(project: TestProject) {
  const { tracesDir } = project.config.browser.trace;

  return async () => {
    if (tracesDir === undefined || tracesDir === "") {
      return;
    }

    const dir = path.resolve(project.config.root, tracesDir);
    const entries = await readdir(dir).catch(() => []);

    await Promise.all(
      entries
        .filter((entry) => !entry.endsWith(".trace.zip"))
        .map(async (entry) => {
          await rm(path.resolve(dir, entry), { force: true, recursive: true });
        })
    );
  };
}

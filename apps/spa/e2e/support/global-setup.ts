import { readdir, rm } from "node:fs/promises";
import path from "node:path";

import type { TestProject } from "vitest/node";

/**
 * Runs in Node, once per `test:e2e` run.
 *
 * Vitest also gives `trace.tracesDir` to Playwright as its raw tracing work
 * folder. Playwright leaves its work files there (`*.trace`, `*.network`,
 * `resources/`, `screencast/`), and Vitest deletes only the `*.trace.zip` of a
 * test that passed. After the run, keep only the `*.trace.zip` files: one for
 * each failed test, ready for `npx playwright show-trace`.
 */
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

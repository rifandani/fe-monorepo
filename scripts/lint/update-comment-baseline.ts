#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

import baseline from "./comment-baseline.json" with { type: "json" };
import { parseVerdictTag, tightenBaseline } from "./comment-ratchet.ts";
import type { CommentBaseline } from "./comment-ratchet.ts";

interface OxlintDiagnostic {
  readonly code?: string;
  readonly filename: string;
  readonly message: string;
}

interface OxlintReport {
  readonly diagnostics: readonly OxlintDiagnostic[];
}

const repoRoot = path.resolve(import.meta.dirname, "../..");
const baselinePath = path.join(import.meta.dirname, "comment-baseline.json");
const seed = process.argv.includes("--seed");

const lint = spawnSync(
  path.join(repoRoot, "node_modules/.bin/oxlint"),
  ["--disable-nested-config", "--format", "json"],
  { cwd: repoRoot, encoding: "utf-8", maxBuffer: 256 * 1024 * 1024 }
);

const isOxlintReport = (value: unknown): value is OxlintReport =>
  value instanceof Object && Object.hasOwn(value, "diagnostics");

const report: unknown = JSON.parse(lint.stdout);

if (!isOxlintReport(report)) {
  console.error(lint.stderr);
  process.exit(1);
}

const counts: Record<string, number> = {};

for (const diagnostic of report.diagnostics) {
  const tag =
    diagnostic.code?.includes("no-comments") === true
      ? parseVerdictTag(diagnostic.message)
      : undefined;

  if (tag !== undefined) {
    counts[diagnostic.filename] = tag.count;
  }
}

const current: CommentBaseline = baseline;

const next = seed
  ? Object.fromEntries(
      Object.entries({ ...current, ...counts })
        .filter(([, count]) => count > 0)
        .toSorted(([left], [right]) => left.localeCompare(right))
    )
  : tightenBaseline(current, counts, (file) =>
      existsSync(path.join(repoRoot, file))
    );

writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`);

const total = Object.values(next).reduce((sum, count) => sum + count, 0);

console.log(
  `comment-baseline.json: ${Object.keys(next).length} files, ${total} comments`
);

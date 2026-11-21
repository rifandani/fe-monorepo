import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import {
  isDirective,
  judgeFile,
  parseVerdictTag,
  planReports,
  tightenBaseline,
  verdictTag,
} from "./comment-ratchet.ts";

const exists = (): boolean => true;

const FILE_LOC = 0;

const prose = (loc: number) =>
  ({ type: "Line", value: " explains the code", loc }) as const;

const directive = (loc: number) =>
  ({
    type: "Line",
    value: " oxlint-disable-next-line no-console",
    loc,
  }) as const;

describe("isDirective", () => {
  it.each([
    " oxlint-disable-next-line typescript/no-explicit-any",
    " @ts-expect-error -- the global is deleted on purpose",
    " fallow-ignore-file unused-file",
    '/ <reference types="vite/client" />',
    "* @type {import('vite').UserConfig} ",
    " Stryker disable next-line all",
    " SAFETY: the parser checked every field before the cast",
    "* SAFETY: the registry key is a literal union ",
  ])("should keep the tool directive %j", (value) => {
    const comment = { type: "Line", value } as const;

    const result = isDirective(comment);

    expect(result).toBe(true);
  });

  it("should keep a shebang", () => {
    const comment = { type: "Shebang", value: "/usr/bin/env node" } as const;

    const result = isDirective(comment);

    expect(result).toBe(true);
  });

  it.each([
    " Arrange",
    "* Stryker copies the project into `.stryker-tmp` before mutating. ",
    " SAFETY:",
    " SAFETY note without a colon",
    " the cast is fine. SAFETY: checked above",
    "* @description The Session of this app ",
  ])("should treat the prose %j as a comment", (value) => {
    const comment = { type: "Block", value } as const;

    const result = isDirective(comment);

    expect(result).toBe(false);
  });
});

describe("judgeFile", () => {
  it("should accept a file at its baseline", () => {
    const verdict = judgeFile(3, 3);

    expect(verdict).toEqual({ kind: "within" });
  });

  it("should reject a file with more comments than its baseline", () => {
    const verdict = judgeFile(4, 3);

    expect(verdict).toEqual({ kind: "over", count: 4, allowed: 3 });
  });

  it("should ask to lower a baseline that the file no longer needs", () => {
    const verdict = judgeFile(1, 3);

    expect(verdict).toEqual({ kind: "stale", count: 1, allowed: 3 });
  });

  test.prop([fc.nat()])(
    "should never accept a comment in a file without a baseline",
    (extra) => {
      const verdict = judgeFile(extra + 1, 0);

      expect(verdict.kind).toBe("over");
    }
  );
});

describe("planReports", () => {
  it("should report each prose comment of a file over its baseline", () => {
    const comments = [prose(1), prose(2)];

    const reports = planReports(comments, 1, FILE_LOC);

    expect(reports.map((report) => report.loc)).toEqual([1, 2]);
  });

  it("should report the file once when its baseline is stale", () => {
    const comments = [prose(1)];

    const reports = planReports(comments, 3, FILE_LOC);

    expect(
      reports.map((report) => [report.loc, parseVerdictTag(report.message)])
    ).toEqual([[FILE_LOC, { count: 1, allowed: 3 }]]);
  });

  it("should not count tool directives", () => {
    const comments = [directive(1), prose(2)];

    const reports = planReports(comments, 1, FILE_LOC);

    expect(reports).toEqual([]);
  });

  test.prop([fc.array(fc.nat().map(prose)), fc.nat()])(
    "should always tag each report with the prose count and the baseline",
    (comments, allowed) => {
      const reports = planReports(comments, allowed, FILE_LOC);

      for (const report of reports) {
        expect(parseVerdictTag(report.message)).toEqual({
          count: comments.length,
          allowed,
        });
      }
    }
  );
});

describe("parseVerdictTag", () => {
  test.prop([fc.nat(), fc.nat(), fc.string(), fc.string()])(
    "should read back the counts that verdictTag wrote into a message",
    (count, allowed, before, after) => {
      const message = `${before} ${verdictTag(count, allowed)} ${after}`;

      const tag = parseVerdictTag(message);

      expect(tag).toEqual({ count, allowed });
    }
  );

  it("should find no counts in a message of another rule", () => {
    const tag = parseVerdictTag("Unexpected any. Specify a different type.");

    expect(tag).toBeUndefined();
  });
});

describe("tightenBaseline", () => {
  it("should lower a file to the comments it still has", () => {
    const baseline = { "src/a.ts": 5 };

    const next = tightenBaseline(baseline, { "src/a.ts": 2 }, exists);

    expect(next).toEqual({ "src/a.ts": 2 });
  });

  it("should drop a file that has no comments left", () => {
    const baseline = { "src/a.ts": 5, "src/b.ts": 1 };

    const next = tightenBaseline(baseline, { "src/a.ts": 0 }, exists);

    expect(next).toEqual({ "src/b.ts": 1 });
  });

  it("should drop a file that no longer exists", () => {
    const baseline = { "src/gone.ts": 4 };

    const next = tightenBaseline(baseline, {}, () => false);

    expect(next).toEqual({});
  });

  test.prop([
    fc.dictionary(fc.string({ minLength: 1 }), fc.nat()),
    fc.dictionary(fc.string({ minLength: 1 }), fc.nat()),
  ])("should never raise a count or add a file", (baseline, counts) => {
    const next = tightenBaseline(baseline, counts, exists);

    for (const [file, count] of Object.entries(next)) {
      expect(count).toBeLessThanOrEqual(baseline[file] ?? 0);
    }
  });
});

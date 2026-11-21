import { readFileSync } from "node:fs";
import path from "node:path";

import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import {
  collectBlockers,
  decodeAllowlist,
  decodeOsvDocument,
  isCalendarDate,
  LEVEL_RANK,
  readAllowlist,
  readScannerOutput,
  validateAllowlist,
} from "./sca-gate-core.ts";
import type { OsvDocument } from "./sca-gate-core.ts";

type Json = string | number | boolean | null | readonly Json[] | JsonObject;

interface JsonObject {
  readonly [key: string]: Json | undefined;
}

const documentWith = (
  vulnerabilities: readonly JsonObject[],
  extra: JsonObject = {}
) => ({
  results: [
    {
      source: { path: "bun.lock", type: "lockfile" },
      packages: [
        {
          package: { name: "image-size", version: "1.2.1" },
          vulnerabilities,
          ...extra,
        },
      ],
    },
  ],
});

const decodedDocument = (input: Json): OsvDocument => {
  const decoded = decodeOsvDocument(input);

  if (!decoded.ok) {
    throw new Error(decoded.error);
  }

  return decoded.value;
};

const errorOf = (decoded: { ok: boolean; error?: string }) =>
  decoded.ok ? undefined : decoded.error;

const idArb = fc.string({ minLength: 1 });

const vulnArb = fc.record(
  {
    id: idArb,
    summary: fc.string(),
    aliases: fc.array(fc.string()),
    database_specific: fc.record(
      { severity: fc.constantFrom("LOW", "MODERATE", "HIGH", "CRITICAL") },
      { requiredKeys: [] }
    ),
  },
  { requiredKeys: ["id"] }
);

const validDocumentArb = fc.record({
  results: fc.array(
    fc.record({
      packages: fc.array(
        fc.record({ vulnerabilities: fc.array(vulnArb, { minLength: 1 }) }),
        { minLength: 1 }
      ),
    }),
    { minLength: 1 }
  ),
});

const requiredKeys = ["results", "packages", "vulnerabilities", "id"] as const;

type RequiredKey = (typeof requiredKeys)[number];

const renameKey = (
  record: JsonObject,
  key: string,
  newKey: string | undefined
): JsonObject => {
  const { [key]: value, ...rest } = record;

  return newKey === undefined ? rest : { ...rest, [newKey]: value };
};

const breakDocument = (
  doc: { results: { packages: { vulnerabilities: { id: string }[] }[] }[] },
  key: RequiredKey,
  newKey: string | undefined
): Json => {
  const [result, ...otherResults] = doc.results;
  const [pkg, ...otherPackages] = result?.packages ?? [];
  const [vuln, ...otherVulns] = pkg?.vulnerabilities ?? [];

  const brokenVuln =
    key === "id" ? renameKey({ ...vuln }, "id", newKey) : { ...vuln };

  const vulnerabilities = [brokenVuln, ...otherVulns];

  const brokenPackage =
    key === "vulnerabilities"
      ? renameKey({ ...pkg }, "vulnerabilities", newKey)
      : { ...pkg, vulnerabilities };

  const packages = [brokenPackage, ...otherPackages];

  const brokenResult =
    key === "packages"
      ? renameKey({ ...result }, "packages", newKey)
      : { ...result, packages };

  const results = [brokenResult, ...otherResults];

  return key === "results"
    ? renameKey({ results }, "results", newKey)
    : { results };
};

const validDate = fc
  .date({
    min: new Date("1000-01-01T00:00:00Z"),
    max: new Date("9999-12-31T00:00:00Z"),
    noInvalidDate: true,
  })
  .map((date) => date.toISOString().slice(0, 10));

const dateText = (year: number, month: number, day: number) =>
  [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");

const allowEntry = (overrides: JsonObject = {}) => ({
  id: "GHSA-5p2g-fcmc-qvqq",
  package: "image-size",
  severity: "high",
  expires: "2026-12-16",
  reason: "Transitive via metro.",
  ...overrides,
});

describe("decodeOsvDocument", () => {
  it("should decode a document in the osv-scanner format", () => {
    const input = documentWith(
      [
        {
          id: "GHSA-5p2g-fcmc-qvqq",
          summary: "image-size denial of service",
          aliases: ["CVE-2025-0001"],
          database_specific: { severity: "HIGH", cwe_ids: ["CWE-400"] },
          modified: "2026-01-01T00:00:00Z",
        },
      ],
      {
        groups: [
          {
            ids: ["GHSA-5p2g-fcmc-qvqq"],
            aliases: ["CVE-2025-0001"],
            max_severity: "7.5",
          },
        ],
      }
    );

    const decoded = decodeOsvDocument(input);

    expect(decoded.ok).toBe(true);
  });

  it("should decode a document with no results", () => {
    const input = { results: [], experimental_config: { licenses: {} } };

    const decoded = decodeOsvDocument(input);

    expect(decoded).toEqual({ ok: true, value: { results: [] } });
  });

  it("should reject a document that renames results", () => {
    const input = { scan_results: [] };

    const decoded = decodeOsvDocument(input);

    expect(errorOf(decoded)).toContain("results");
  });

  it("should reject a package without a vulnerabilities array", () => {
    const input = {
      results: [{ packages: [{ package: { name: "image-size" } }] }],
    };

    const decoded = decodeOsvDocument(input);

    expect(errorOf(decoded)).toContain(
      "results[0].packages[0].vulnerabilities"
    );
  });

  it.each([
    ["summary", { summary: 1 }],
    ["aliases", { aliases: "CVE-2025-0001" }],
    ["database_specific", { database_specific: "HIGH" }],
    ["database_specific.severity", { database_specific: { severity: 7 } }],
  ])("should reject a vulnerability with a wrong %s", (field, overrides) => {
    const input = documentWith([{ id: "GHSA-1", ...overrides }]);

    const decoded = decodeOsvDocument(input);

    expect(errorOf(decoded)).toContain(field);
  });

  it.each([
    ["groups", { groups: {} }],
    ["ids", { groups: [{ ids: "GHSA-1" }] }],
    ["max_severity", { groups: [{ max_severity: 7.5 }] }],
    ["package", { package: "image-size" }],
    ["name", { package: { name: 1 } }],
    ["version", { package: { version: 1 } }],
  ])("should reject a package with a wrong %s", (field, extra) => {
    const input = documentWith([{ id: "GHSA-1" }], extra);

    const decoded = decodeOsvDocument(input);

    expect(errorOf(decoded)).toContain(field);
  });

  test.prop([validDocumentArb])(
    "should always decode a valid document",
    (doc) => {
      const decoded = decodeOsvDocument(doc);

      expect(decoded.ok).toBe(true);
    }
  );

  test.prop([
    validDocumentArb,
    fc.constantFrom(...requiredKeys),
    fc.option(fc.string(), { nil: undefined }),
  ])(
    "should never decode a valid document that loses or renames a required key",
    (doc, key, suffix) => {
      const newKey = suffix === undefined ? undefined : `${key}_${suffix}`;
      const broken = breakDocument(doc, key, newKey);

      const decoded = decodeOsvDocument(broken);

      expect(decoded.ok).toBe(false);
    }
  );
});

describe("readScannerOutput", () => {
  it("should read a clean scan", () => {
    const stdout = JSON.stringify({ results: [] });

    const decoded = readScannerOutput(stdout, 0);

    expect(decoded.ok).toBe(true);
  });

  it("should read findings when the scanner exits 1", () => {
    const stdout = JSON.stringify(documentWith([{ id: "GHSA-1" }]));

    const decoded = readScannerOutput(stdout, 1);

    expect(decoded.ok).toBe(true);
  });

  it("should reject output that is not JSON", () => {
    const stdout = "panic: runtime error";

    const decoded = readScannerOutput(stdout, 1);

    expect(errorOf(decoded)).toContain("not valid JSON");
  });

  it("should reject exit 1 with no decoded vulnerabilities", () => {
    const stdout = JSON.stringify({ results: [] });

    const decoded = readScannerOutput(stdout, 1);

    expect(errorOf(decoded)).toContain("exited 1");
  });

  it("should reject a document that renames results when the scanner exits 1", () => {
    const stdout = JSON.stringify({
      scan_results: documentWith([
        { id: "GHSA-1", database_specific: { severity: "CRITICAL" } },
      ]),
    });

    const decoded = readScannerOutput(stdout, 1);

    expect(decoded.ok).toBe(false);
  });

  test.prop([fc.stringMatching(/^\s*$/u), fc.constantFrom(0, 1)])(
    "should never read empty or blank output as no findings",
    (stdout, exitCode) => {
      const decoded = readScannerOutput(stdout, exitCode);

      expect(errorOf(decoded)).toContain("empty");
    }
  );
});

describe("isCalendarDate", () => {
  it.each(["2026-12-16", "2024-02-29", "2000-02-29"])(
    "should accept the real date %s",
    (value) => {
      const result = isCalendarDate(value);

      expect(result).toBe(true);
    }
  );

  it.each([
    "never",
    "2026-02-30",
    "2023-02-29",
    "1900-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-00-10",
    "2026-01-00",
    "2026-1-01",
    "26-01-01",
    "2026-01-01T00:00:00Z",
    " 2026-01-01",
    "2026/01/01",
    "",
  ])("should reject %j", (value) => {
    const result = isCalendarDate(value);

    expect(result).toBe(false);
  });

  test.prop([validDate])("should always accept a real date", (value) => {
    const result = isCalendarDate(value);

    expect(result).toBe(true);
  });

  test.prop([
    validDate,
    fc.string({ minLength: 1 }),
    fc.constantFrom("prefix", "suffix"),
  ])(
    "should never accept a real date with extra text",
    (value, extra, side) => {
      const text = side === "prefix" ? `${extra}${value}` : `${value}${extra}`;

      const result = isCalendarDate(text);

      expect(result).toBe(false);
    }
  );

  test.prop([
    fc.integer({ min: 0, max: 9999 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 32, max: 99 }),
  ])("should never accept a day after the 31st", (year, month, day) => {
    const text = dateText(year, month, day);

    const result = isCalendarDate(text);

    expect(result).toBe(false);
  });

  test.prop([
    fc.integer({ min: 0, max: 9999 }),
    fc.constantFrom(0, 13, 14, 50, 99),
    fc.integer({ min: 1, max: 28 }),
  ])("should never accept a month outside 1 to 12", (year, month, day) => {
    const text = dateText(year, month, day);

    const result = isCalendarDate(text);

    expect(result).toBe(false);
  });

  test.prop([
    validDate,
    fc.nat(),
    fc.string({
      minLength: 1,
      unit: fc.constantFrom("/", " ", ".", "T", "x", "\n", "+"),
    }),
  ])(
    "should never accept a date with a character that is not a digit or a dash",
    (value, position, foreign) => {
      const index = position % (value.length + 1);
      const text = `${value.slice(0, index)}${foreign}${value.slice(index)}`;

      const result = isCalendarDate(text);

      expect(result).toBe(false);
    }
  );
});

describe("decodeAllowlist", () => {
  it("should decode the allowlist format of the repository", () => {
    const input = {
      $schema_comment: "Temporary SCA exceptions.",
      expires_format: "YYYY-MM-DD",
      entries: [allowEntry()],
    };

    const decoded = decodeAllowlist(input);

    expect(decoded).toEqual({ ok: true, value: [allowEntry()] });
  });

  it("should decode an entry with only an id and an expiry date", () => {
    const input = { entries: [{ id: "GHSA-1", expires: "2026-12-16" }] };

    const decoded = decodeAllowlist(input);

    expect(decoded).toEqual({
      ok: true,
      value: [{ id: "GHSA-1", expires: "2026-12-16" }],
    });
  });

  it("should reject an allowlist that renames entries", () => {
    const input = { Entries: [allowEntry()] };

    const decoded = decodeAllowlist(input);

    expect(errorOf(decoded)).toContain("entries");
  });

  it("should reject an allowlist that is not an object", () => {
    const input = [allowEntry()];

    const decoded = decodeAllowlist(input);

    expect(decoded.ok).toBe(false);
  });

  it.each([
    ["id", { id: "" }],
    ["id", { id: 1 }],
    ["expires", { expires: "never" }],
    ["expires", { expires: "2026-02-30" }],
    ["package", { package: 1 }],
    ["severity", { severity: ["high"] }],
    ["reason", { reason: null }],
  ])("should reject an entry with a wrong %s", (field, overrides) => {
    const input = { entries: [allowEntry(), allowEntry(overrides)] };

    const decoded = decodeAllowlist(input);

    expect(errorOf(decoded)).toContain(`entries[1].${field}`);
  });

  it("should reject an entry that is not an object", () => {
    const input = { entries: [allowEntry(), "GHSA-1"] };

    const decoded = decodeAllowlist(input);

    expect(errorOf(decoded)).toContain("entries[1]");
  });
});

describe("readAllowlist", () => {
  it("should read the allowlist file of the repository", () => {
    const text = readFileSync(
      path.resolve(
        import.meta.dirname,
        "../../.github/security/sca-allowlist.json"
      ),
      "utf-8"
    );

    const decoded = readAllowlist(text);

    expect(decoded.ok).toBe(true);
  });

  it("should reject text that is not JSON", () => {
    const text = "entries: []";

    const decoded = readAllowlist(text);

    expect(errorOf(decoded)).toContain("not valid JSON");
  });

  it("should reject an allowlist that renames entries", () => {
    const text = JSON.stringify({ Entries: [allowEntry()] });

    const decoded = readAllowlist(text);

    expect(errorOf(decoded)).toContain("allowlist.entries");
  });
});

describe("validateAllowlist", () => {
  it("should keep an entry that has not expired", () => {
    const entry = allowEntry({ expires: "2026-12-16" });

    const result = validateAllowlist([entry], "2026-11-21");

    expect(result).toEqual({ active: [entry], errors: [] });
  });

  it("should keep an entry on its expiry date", () => {
    const entry = allowEntry({ expires: "2026-11-21" });

    const result = validateAllowlist([entry], "2026-11-21");

    expect(result.active).toEqual([entry]);
  });

  it("should reject an expired entry", () => {
    const entry = allowEntry({ expires: "2026-11-20" });

    const result = validateAllowlist([entry], "2026-11-21");

    expect(result.errors).toEqual([
      "GHSA-5p2g-fcmc-qvqq: allowlist expired on 2026-11-20 — remediate or renew",
    ]);
  });

  test.prop([
    fc
      .tuple(
        fc.array(fc.constantFrom(" ", "\t")),
        fc.mixedCase(fc.constant("critical")),
        fc.array(fc.constantFrom(" ", "\t"))
      )
      .map(
        ([before, word, after]) => `${before.join("")}${word}${after.join("")}`
      ),
  ])("should never allow a critical entry in any case", (severity) => {
    const entry = allowEntry({ severity });

    const result = validateAllowlist([entry], "2026-11-21");

    expect(result).toEqual({
      active: [],
      errors: [
        "GHSA-5p2g-fcmc-qvqq: critical advisories cannot be allowlisted",
      ],
    });
  });
});

describe("collectBlockers", () => {
  it("should block a high finding at the default level", () => {
    const doc = decodedDocument(
      documentWith([
        {
          id: "GHSA-1",
          summary: "prototype pollution",
          database_specific: { severity: "HIGH" },
        },
      ])
    );

    const blockers = collectBlockers(doc, LEVEL_RANK.high);

    expect(blockers).toEqual([
      {
        id: "GHSA-1",
        package: "image-size",
        version: "1.2.1",
        severity: "high",
        summary: "prototype pollution",
      },
    ]);
  });

  it("should pass low findings at the default level", () => {
    const doc = decodedDocument(
      documentWith([
        { id: "GHSA-1", database_specific: { severity: "LOW" } },
        { id: "GHSA-2", database_specific: { severity: "MODERATE" } },
      ])
    );

    const blockers = collectBlockers(doc, LEVEL_RANK.high);

    expect(blockers).toEqual([]);
  });

  it("should take the severity of a group from its CVSS score", () => {
    const doc = decodedDocument(
      documentWith([{ id: "GHSA-1" }], {
        groups: [{ ids: ["GHSA-1"], max_severity: "9.8" }],
      })
    );

    const blockers = collectBlockers(doc, LEVEL_RANK.high);

    expect(blockers.map((b) => b.severity)).toEqual(["critical"]);
  });

  it("should treat a finding with no severity as high", () => {
    const doc = decodedDocument(documentWith([{ id: "GHSA-1" }]));

    const blockers = collectBlockers(doc, LEVEL_RANK.high);

    expect(blockers.map((b) => b.severity)).toEqual(["high"]);
  });

  it("should report one finding for each group of aliases", () => {
    const doc = decodedDocument(
      documentWith(
        [
          { id: "GHSA-1", database_specific: { severity: "HIGH" } },
          { id: "CVE-2025-1", database_specific: { severity: "CRITICAL" } },
        ],
        { groups: [{ ids: ["GHSA-1", "CVE-2025-1"], max_severity: "9.1" }] }
      )
    );

    const blockers = collectBlockers(doc, LEVEL_RANK.high);

    expect(blockers.map((b) => b.id)).toEqual(["CVE-2025-1"]);
  });
});

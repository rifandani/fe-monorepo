import { flow, Predicate, Result, Schema, SchemaIssue } from "effect";

export type SeverityBand = "low" | "moderate" | "high" | "critical";

export const LEVEL_RANK = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
} satisfies Record<SeverityBand, number>;

export const isSeverityBand = (value: string): value is SeverityBand =>
  Object.hasOwn(LEVEL_RANK, value);

const CALENDAR_DATE = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u;

export const isCalendarDate = (value: string): boolean => {
  const groups = CALENDAR_DATE.exec(value)?.groups;

  if (groups === undefined) {
    return false;
  }

  const date = new Date(0);
  date.setUTCFullYear(
    Number(groups.year),
    Number(groups.month) - 1,
    Number(groups.day)
  );

  return date.toISOString().slice(0, 10) === value;
};

const CalendarDateSchema = Schema.String.check(
  Schema.makeFilter(isCalendarDate, {
    expected: "a real date in YYYY-MM-DD form",
  })
);

const AllowEntrySchema = Schema.Struct({
  id: Schema.NonEmptyString,
  package: Schema.optionalKey(Schema.String),
  severity: Schema.optionalKey(Schema.String),
  expires: CalendarDateSchema,
  reason: Schema.optionalKey(Schema.String),
});

export type AllowEntry = typeof AllowEntrySchema.Type;

const AllowlistSchema = Schema.Struct({
  entries: Schema.Array(AllowEntrySchema),
});

const OsvVulnSchema = Schema.Struct({
  id: Schema.String,
  summary: Schema.optionalKey(Schema.String),
  aliases: Schema.optionalKey(Schema.Array(Schema.String)),
  database_specific: Schema.optionalKey(
    Schema.Struct({ severity: Schema.optionalKey(Schema.String) })
  ),
});

type OsvVuln = typeof OsvVulnSchema.Type;

const OsvGroupSchema = Schema.Struct({
  ids: Schema.optionalKey(Schema.Array(Schema.String)),
  max_severity: Schema.optionalKey(Schema.String),
});

type OsvGroup = typeof OsvGroupSchema.Type;

const OsvPackageSchema = Schema.Struct({
  package: Schema.optionalKey(
    Schema.Struct({
      name: Schema.optionalKey(Schema.String),
      version: Schema.optionalKey(Schema.String),
    })
  ),
  vulnerabilities: Schema.Array(OsvVulnSchema),
  groups: Schema.optionalKey(Schema.Array(OsvGroupSchema)),
});

type OsvPackage = typeof OsvPackageSchema.Type;

const OsvDocumentSchema = Schema.Struct({
  results: Schema.Array(
    Schema.Struct({ packages: Schema.Array(OsvPackageSchema) })
  ),
});

export type OsvDocument = typeof OsvDocumentSchema.Type;

export interface Finding {
  id: string;
  package: string;
  version: string;
  severity: SeverityBand;
  summary: string;
}

export type Decoded<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

const toDecoded = <T>(result: Result.Result<T, string>): Decoded<T> =>
  Result.isSuccess(result)
    ? { ok: true, value: result.success }
    : { ok: false, error: result.failure };

const formatIssue = SchemaIssue.makeFormatterStandardSchemaV1();

type IssuePath = NonNullable<
  ReturnType<typeof formatIssue>["issues"][number]["path"]
>;

const pathKey = (segment: IssuePath[number]): PropertyKey =>
  Predicate.isPropertyKey(segment) ? segment : segment.key;

const formatPath = (label: string, issuePath: IssuePath) =>
  issuePath
    .map(pathKey)
    .reduce<string>(
      (at, key) =>
        Predicate.isNumber(key) ? `${at}[${key}]` : `${at}.${String(key)}`,
      label
    );

const describeError = (label: string, error: Schema.SchemaError): string => {
  const [first] = formatIssue(error.issue).issues;

  return first === undefined
    ? `${label}: ${error.message}`
    : `${formatPath(label, first.path ?? [])}: ${first.message}`;
};

const decodeResult = <S extends Schema.ConstraintDecoder<unknown>>(
  schema: S,
  label: string
) =>
  flow(
    Schema.decodeUnknownResult(schema),
    Result.mapError((schemaError) => describeError(label, schemaError))
  );

const decodeJsonResult = <S extends Schema.ConstraintDecoder<unknown>>(
  schema: S,
  label: string
) => {
  const decode = decodeResult(schema, label);

  return (text: string): Result.Result<S["Type"], string> => {
    try {
      return decode(JSON.parse(text));
    } catch {
      return Result.fail(`${label} is not valid JSON`);
    }
  };
};

const OSV_LABEL = "osv-scanner output";
const ALLOWLIST_LABEL = "allowlist";

const entriesOf = Result.map(
  (allowlist: typeof AllowlistSchema.Type) => allowlist.entries
);

export const decodeOsvDocument = flow(
  decodeResult(OsvDocumentSchema, OSV_LABEL),
  toDecoded
);

export const decodeAllowlist = flow(
  decodeResult(AllowlistSchema, ALLOWLIST_LABEL),
  entriesOf,
  toDecoded
);

export const readAllowlist = flow(
  decodeJsonResult(AllowlistSchema, ALLOWLIST_LABEL),
  entriesOf,
  toDecoded
);

const readOsvJson = decodeJsonResult(OsvDocumentSchema, OSV_LABEL);

const countVulnerabilities = (doc: OsvDocument): number =>
  doc.results
    .flatMap((result) => result.packages)
    .reduce((total, pkg) => total + pkg.vulnerabilities.length, 0);

export const readScannerOutput = (
  stdout: string,
  exitCode: 0 | 1
): Decoded<OsvDocument> => {
  if (stdout.trim() === "") {
    return { ok: false, error: "osv-scanner output is empty" };
  }

  const decoded = toDecoded(readOsvJson(stdout));

  if (
    decoded.ok &&
    exitCode === 1 &&
    countVulnerabilities(decoded.value) === 0
  ) {
    return {
      ok: false,
      error:
        "osv-scanner exited 1 (vulnerabilities found) but the output has no vulnerabilities",
    };
  }

  return decoded;
};

export interface AllowlistCheck {
  active: AllowEntry[];
  errors: string[];
}

export const validateAllowlist = (
  entries: readonly AllowEntry[],
  today: string
): AllowlistCheck => {
  const active: AllowEntry[] = [];
  const errors: string[] = [];

  for (const entry of entries) {
    if (entry.severity?.trim().toLowerCase() === "critical") {
      errors.push(`${entry.id}: critical advisories cannot be allowlisted`);
    } else if (entry.expires < today) {
      errors.push(
        `${entry.id}: allowlist expired on ${entry.expires} — remediate or renew`
      );
    } else {
      active.push(entry);
    }
  }

  return { active, errors };
};

const bandFromCvss = (score?: string): SeverityBand | null => {
  const n = Number(score);

  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }

  if (n >= 9) {
    return "critical";
  }

  if (n >= 7) {
    return "high";
  }

  if (n >= 4) {
    return "moderate";
  }

  return "low";
};

const normalizeBand = (value?: string): SeverityBand | null => {
  const v = (value ?? "").trim().toLowerCase();

  if (v === "medium") {
    return "moderate";
  }

  return isSeverityBand(v) ? v : null;
};

const maxBand = (
  a: SeverityBand | null,
  b: SeverityBand | null
): SeverityBand | null => {
  if (!a) {
    return b;
  }

  if (!b) {
    return a;
  }

  return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
};

interface IdBands {
  idBand: Map<string, SeverityBand>;
  pkgMax: SeverityBand | null;
}

const buildIdBands = (groups: readonly OsvGroup[]): IdBands => {
  const idBand = new Map<string, SeverityBand>();
  let pkgMax: SeverityBand | null = null;

  for (const g of groups) {
    const band = bandFromCvss(g.max_severity);

    if (!band) {
      continue;
    }

    pkgMax = maxBand(pkgMax, band);

    for (const id of g.ids ?? []) {
      idBand.set(id, band);
    }
  }

  return { idBand, pkgMax };
};

const resolveVulnSeverity = (
  vuln: OsvVuln,
  idBand: Map<string, SeverityBand>,
  pkgMax: SeverityBand | null
): SeverityBand => {
  let sev: SeverityBand | null =
    normalizeBand(vuln.database_specific?.severity) ??
    idBand.get(vuln.id) ??
    null;

  if (!sev) {
    for (const alias of vuln.aliases ?? []) {
      sev = idBand.get(alias) ?? null;

      if (sev) {
        break;
      }
    }
  }

  return sev ?? pkgMax ?? "high";
};

const groupKeyFor = (pkg: OsvPackage, vulnId: string): string => {
  const group =
    (pkg.groups ?? []).find((g) => (g.ids ?? []).includes(vulnId)) ?? null;

  return [...(group?.ids ?? [vulnId])].toSorted().join(",");
};

const collectPackageFindings = (
  pkg: OsvPackage,
  minRank: number
): Finding[] => {
  const name = pkg.package?.name ?? "?";
  const version = pkg.package?.version ?? "?";
  const { idBand, pkgMax } = buildIdBands(pkg.groups ?? []);

  const byGroupKey = new Map<
    string,
    { id: string; severity: SeverityBand; summary: string }
  >();

  for (const vuln of pkg.vulnerabilities) {
    const sev = resolveVulnSeverity(vuln, idBand, pkgMax);

    if (LEVEL_RANK[sev] < minRank) {
      continue;
    }

    const key = groupKeyFor(pkg, vuln.id);
    const prev = byGroupKey.get(key);

    if (!prev || LEVEL_RANK[sev] > LEVEL_RANK[prev.severity]) {
      byGroupKey.set(key, {
        id: vuln.id,
        severity: sev,
        summary: vuln.summary ?? vuln.id,
      });
    }
  }

  return [...byGroupKey.values()].map((finding) => ({
    id: finding.id,
    package: name,
    version,
    severity: finding.severity,
    summary: finding.summary,
  }));
};

export const collectBlockers = (doc: OsvDocument, minRank: number): Finding[] =>
  doc.results.flatMap((result) =>
    result.packages.flatMap((pkg) => collectPackageFindings(pkg, minRank))
  );

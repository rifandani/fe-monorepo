export type SeverityBand = "low" | "moderate" | "high" | "critical";

export interface AllowEntry {
  id: string;
  package?: string;
  severity?: string;
  expires: string;
  reason?: string;
}

export interface OsvVuln {
  id: string;
  summary?: string;
  aliases?: string[];
  database_specific?: { severity?: string };
}

export interface OsvGroup {
  ids?: string[];
  max_severity?: string;
}

export interface OsvPackage {
  package?: { name?: string; version?: string };
  vulnerabilities: OsvVuln[];
  groups?: OsvGroup[];
}

export interface OsvResult {
  packages: OsvPackage[];
}

export interface OsvDocument {
  results: OsvResult[];
}

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

export const LEVEL_RANK = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
} satisfies Record<SeverityBand, number>;

export const isSeverityBand = (value: string): value is SeverityBand =>
  Object.hasOwn(LEVEL_RANK, value);

class DecodeError extends Error {
  override name = "DecodeError";
}

type Reader<T> = (input: unknown, at: string) => T;

const reject = (at: string, expected: string): never => {
  throw new DecodeError(`${at}: expected ${expected}`);
};

const isRecord = (input: unknown): input is Readonly<Record<string, unknown>> =>
  typeof input === "object" && input !== null && !Array.isArray(input);

const readRecord: Reader<Readonly<Record<string, unknown>>> = (input, at) =>
  isRecord(input) ? input : reject(at, "an object");

const readString: Reader<string> = (input, at) =>
  typeof input === "string" ? input : reject(at, "a string");

const readNonEmptyString: Reader<string> = (input, at) => {
  const value = readString(input, at);

  return value === "" ? reject(at, "a non-empty string") : value;
};

const readArray =
  <T>(readItem: Reader<T>): Reader<T[]> =>
  (input, at) => {
    if (!Array.isArray(input)) {
      return reject(at, "an array");
    }

    const items: readonly unknown[] = input;

    return items.map((item, index) => readItem(item, `${at}[${index}]`));
  };

const required = <T>(
  record: Readonly<Record<string, unknown>>,
  key: string,
  read: Reader<T>,
  at: string
): T => read(record[key], `${at}.${key}`);

const optional = <T>(
  record: Readonly<Record<string, unknown>>,
  key: string,
  read: Reader<T>,
  at: string
): T | undefined =>
  Object.hasOwn(record, key) ? read(record[key], `${at}.${key}`) : undefined;

const attempt = <T>(run: () => T): Decoded<T> => {
  try {
    return { ok: true, value: run() };
  } catch (error) {
    if (error instanceof DecodeError) {
      return { ok: false, error: error.message };
    }

    throw error;
  }
};

const readStrings = readArray(readString);

const readDatabaseSpecific: Reader<OsvVuln["database_specific"]> = (
  input,
  at
) => ({
  severity: optional(readRecord(input, at), "severity", readString, at),
});

const readVuln: Reader<OsvVuln> = (input, at) => {
  const record = readRecord(input, at);

  return {
    id: required(record, "id", readString, at),
    summary: optional(record, "summary", readString, at),
    aliases: optional(record, "aliases", readStrings, at),
    database_specific: optional(
      record,
      "database_specific",
      readDatabaseSpecific,
      at
    ),
  };
};

const readGroup: Reader<OsvGroup> = (input, at) => {
  const record = readRecord(input, at);

  return {
    ids: optional(record, "ids", readStrings, at),
    max_severity: optional(record, "max_severity", readString, at),
  };
};

const readPackageInfo: Reader<OsvPackage["package"]> = (input, at) => {
  const record = readRecord(input, at);

  return {
    name: optional(record, "name", readString, at),
    version: optional(record, "version", readString, at),
  };
};

const readPackage: Reader<OsvPackage> = (input, at) => {
  const record = readRecord(input, at);

  return {
    package: optional(record, "package", readPackageInfo, at),
    vulnerabilities: required(
      record,
      "vulnerabilities",
      readArray(readVuln),
      at
    ),
    groups: optional(record, "groups", readArray(readGroup), at),
  };
};

const readResult: Reader<OsvResult> = (input, at) => ({
  packages: required(
    readRecord(input, at),
    "packages",
    readArray(readPackage),
    at
  ),
});

const readDocument: Reader<OsvDocument> = (input, at) => ({
  results: required(
    readRecord(input, at),
    "results",
    readArray(readResult),
    at
  ),
});

export const decodeOsvDocument = (input: unknown): Decoded<OsvDocument> =>
  attempt(() => readDocument(input, "osv-scanner output"));

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

const readCalendarDate: Reader<string> = (input, at) => {
  const value = readString(input, at);

  return isCalendarDate(value)
    ? value
    : reject(at, "a real date in YYYY-MM-DD form");
};

const readAllowEntry: Reader<AllowEntry> = (input, at) => {
  const record = readRecord(input, at);

  return {
    id: required(record, "id", readNonEmptyString, at),
    package: optional(record, "package", readString, at),
    severity: optional(record, "severity", readString, at),
    expires: required(record, "expires", readCalendarDate, at),
    reason: optional(record, "reason", readString, at),
  };
};

export const decodeAllowlist = (input: unknown): Decoded<AllowEntry[]> =>
  attempt(() =>
    required(
      readRecord(input, "allowlist"),
      "entries",
      readArray(readAllowEntry),
      "allowlist"
    )
  );

const decodeJson = <T>(
  text: string,
  label: string,
  decode: (input: unknown) => Decoded<T>
): Decoded<T> => {
  let json: unknown;

  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: `${label} is not valid JSON` };
  }

  return decode(json);
};

export const readAllowlist = (text: string): Decoded<AllowEntry[]> =>
  decodeJson(text, "allowlist", decodeAllowlist);

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

  const decoded = decodeJson(stdout, "osv-scanner output", decodeOsvDocument);

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

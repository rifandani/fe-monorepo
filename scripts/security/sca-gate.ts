#!/usr/bin/env node
/**
 * SCA gate via Google OSV-Scanner.
 * Fails on high/critical findings unless temporarily allowlisted.
 * Critical severities cannot be allowlisted.
 *
 * Usage: node scripts/security/sca-gate.ts
 * Env:
 *   SCA_ALLOWLIST_PATH   default: security/sca-allowlist.json
 *   SCA_AUDIT_LEVEL      default: high  (low|moderate|high|critical)
 *   OSV_SCANNER_BIN      path to osv-scanner (default: osv-scanner on PATH)
 *   OSV_SCANNER_VERSION  pinned download version if binary missing (default: 2.4.0)
 */
import { spawnSync } from "node:child_process";
import {
  accessSync,
  chmodSync,
  constants as fsConstants,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

interface AllowEntry {
  id: string;
  package?: string;
  severity?: string;
  expires: string;
  reason?: string;
}

interface OsvVuln {
  id: string;
  summary?: string;
  aliases?: string[];
  database_specific?: { severity?: string };
}

interface OsvGroup {
  ids?: string[];
  max_severity?: string;
}

interface OsvPackage {
  package?: { name?: string; version?: string };
  vulnerabilities?: OsvVuln[];
  groups?: OsvGroup[];
}

interface OsvDocument {
  results?: { packages?: OsvPackage[] }[];
}

interface Finding {
  id: string;
  package: string;
  version: string;
  severity: SeverityBand;
  summary: string;
}

type SeverityBand = "low" | "moderate" | "high" | "critical";

const LEVEL_RANK: Record<SeverityBand, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

const root = path.resolve(import.meta.dirname, "../..");
const allowlistPath = path.resolve(
  root,
  process.env.SCA_ALLOWLIST_PATH ?? "security/sca-allowlist.json"
);
const auditLevel = (process.env.SCA_AUDIT_LEVEL ?? "high").toLowerCase();
const today = new Date().toISOString().slice(0, 10);
const lockfile = "bun.lock";

const minRank = LEVEL_RANK[auditLevel as SeverityBand];
if (!minRank) {
  console.error(
    `::error::invalid SCA_AUDIT_LEVEL=${auditLevel} (use low|moderate|high|critical)`
  );
  process.exit(2);
}

const raw = JSON.parse(readFileSync(allowlistPath, "utf-8")) as {
  entries?: AllowEntry[];
};
const entries = raw.entries ?? [];

const errors: string[] = [];
const active: AllowEntry[] = [];

for (const entry of entries) {
  if (!entry?.id || !entry?.expires) {
    errors.push(`invalid allowlist entry: ${JSON.stringify(entry)}`);
    continue;
  }
  if (entry.severity === "critical") {
    errors.push(`${entry.id}: critical advisories cannot be allowlisted`);
    continue;
  }
  if (entry.expires < today) {
    errors.push(
      `${entry.id}: allowlist expired on ${entry.expires} — remediate or renew`
    );
    continue;
  }
  active.push(entry);
}

if (errors.length > 0) {
  for (const line of errors) {
    console.error(`::error::sca-allowlist: ${line}`);
  }
  process.exit(1);
}

const bandFromCvss = (score: unknown): SeverityBand | null => {
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

const normalizeBand = (value: unknown): SeverityBand | null => {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  if (v === "medium") {
    return "moderate";
  }
  if (v in LEVEL_RANK) {
    return v as SeverityBand;
  }
  return null;
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

const which = (cmd: string): string | null => {
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    if (!dir) {
      continue;
    }
    const candidate = path.join(dir, cmd);
    try {
      accessSync(candidate, fsConstants.X_OK);
      return candidate;
    } catch {
      // not found / not executable
    }
  }
  return null;
};

const ensureOsvScanner = (): string => {
  const fromEnv = process.env.OSV_SCANNER_BIN;
  if (fromEnv) {
    return fromEnv;
  }
  const onPath = which("osv-scanner");
  if (onPath) {
    return onPath;
  }

  const version = process.env.OSV_SCANNER_VERSION ?? "2.4.0";
  const platforms: Record<string, string> = {
    darwin: "darwin",
    linux: "linux",
  };
  const arches: Record<string, string> = {
    arm64: "arm64",
    x64: "amd64",
  };
  const platform = platforms[process.platform];
  const arch = arches[process.arch];
  if (!(platform && arch)) {
    throw new Error(
      `osv-scanner not found and no binary for ${process.platform}/${process.arch}`
    );
  }

  const cacheDir = path.resolve(root, "node_modules/.cache/osv-scanner");
  mkdirSync(cacheDir, { recursive: true });
  const dest = path.resolve(
    cacheDir,
    `osv-scanner-${version}-${platform}-${arch}`
  );
  if (existsSync(dest)) {
    return dest;
  }

  const url = `https://github.com/google/osv-scanner/releases/download/v${version}/osv-scanner_${platform}_${arch}`;
  console.error(`Downloading osv-scanner v${version}…`);
  const curl = spawnSync("curl", ["-sSfL", url, "-o", dest], {
    stdio: "inherit",
  });
  if (curl.status !== 0) {
    throw new Error(
      `failed to download osv-scanner (curl exit ${curl.status}): ${url}`
    );
  }
  chmodSync(dest, 0o755);
  return dest;
};

const writeConfig = (activeEntries: AllowEntry[]): string => {
  const lines = [
    "# Generated by scripts/security/sca-gate.ts — do not edit by hand.",
    `# Source: ${allowlistPath}`,
    "",
  ];
  for (const e of activeEntries) {
    lines.push(
      "[[IgnoredVulns]]",
      `id = ${JSON.stringify(e.id)}`,
      // Bare TOML date (not a quoted string) — osv-scanner expects LocalDate.
      `ignoreUntil = ${e.expires}`
    );
    if (e.reason) {
      lines.push(`reason = ${JSON.stringify(e.reason)}`);
    }
    lines.push("");
  }
  const configPath = path.resolve(
    tmpdir(),
    `osv-scanner-config-${process.pid}.toml`
  );
  writeFileSync(configPath, `${lines.join("\n")}`);
  return configPath;
};

const buildIdBands = (
  groups: OsvGroup[]
): { idBand: Map<string, SeverityBand>; pkgMax: SeverityBand | null } => {
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
  // Fail closed: unclassified advisory treated as high
  return sev ?? pkgMax ?? "high";
};

const groupKeyFor = (pkg: OsvPackage, vulnId: string): string => {
  const group =
    (pkg.groups ?? []).find((g) => (g.ids ?? []).includes(vulnId)) ?? null;
  return [...(group?.ids ?? [vulnId])].toSorted().join(",");
};

const collectPackageFindings = (pkg: OsvPackage): Finding[] => {
  const name = pkg.package?.name ?? "?";
  const version = pkg.package?.version ?? "?";
  const { idBand, pkgMax } = buildIdBands(pkg.groups ?? []);
  const byGroupKey = new Map<
    string,
    { id: string; severity: SeverityBand; summary: string }
  >();

  for (const vuln of pkg.vulnerabilities ?? []) {
    const sev = resolveVulnSeverity(vuln, idBand, pkgMax);
    if ((LEVEL_RANK[sev] ?? 0) < minRank) {
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

const collectBlockers = (doc: OsvDocument): Finding[] => {
  const blockers: Finding[] = [];
  for (const result of doc.results ?? []) {
    for (const pkg of result.packages ?? []) {
      blockers.push(...collectPackageFindings(pkg));
    }
  }
  return blockers;
};

const bin = ensureOsvScanner();
const configPath = writeConfig(active);

console.log(
  `Running osv-scanner on bun.lock (${active.length} active allowlist entries, gate ≥ ${auditLevel})`
);

const proc = spawnSync(
  bin,
  ["scan", "source", "-L", lockfile, "--format=json", `--config=${configPath}`],
  {
    cwd: root,
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  }
);

const stdout = proc.stdout ?? "";
const code = proc.status ?? 1;

// 0 = no vulns, 1 = vulns found, other = scanner/tool failure
if (code !== 0 && code !== 1) {
  console.error(`::error::osv-scanner exited with unexpected code ${code}`);
  process.exit(code === 0 ? 1 : code);
}

let doc: OsvDocument;
try {
  doc = JSON.parse(stdout || "{}") as OsvDocument;
} catch {
  console.error("::error::failed to parse osv-scanner JSON output");
  console.error(stdout.slice(0, 2000));
  process.exit(1);
}

const blockers = collectBlockers(doc);
if (blockers.length === 0) {
  console.log(`SCA gate passed (no findings ≥ ${auditLevel}).`);
  process.exit(0);
}

console.error(
  `::error::SCA gate failed: ${blockers.length} finding(s) ≥ ${auditLevel}`
);
for (const b of blockers) {
  console.error(
    `- ${b.severity.toUpperCase()} ${b.id} ${b.package}@${b.version}: ${b.summary}`
  );
}
process.exit(1);

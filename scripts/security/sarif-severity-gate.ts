#!/usr/bin/env bun
/**
 * Fail if any CodeQL SARIF result has security-severity >= threshold (default 7.0 = High).
 *
 * Usage: bun scripts/security/sarif-severity-gate.ts <sarif-dir-or-file>
 * Env: SAST_MIN_SECURITY_SEVERITY (default: 7.0)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

interface SarifRule {
  id: string;
  properties?: Record<string, unknown>;
  defaultConfiguration?: { level?: string };
}

interface SarifResult {
  ruleId?: string;
  level?: string;
  message?: { text?: string };
  properties?: Record<string, unknown>;
  locations?: {
    physicalLocation?: { artifactLocation?: { uri?: string } };
  }[];
}

interface SarifRun {
  tool?: { driver?: { rules?: SarifRule[] } };
  results?: SarifResult[];
}

interface SarifLog {
  runs?: SarifRun[];
}

interface Blocker {
  ruleId: string;
  severity: number;
  message: string;
  file?: string;
}

const [arg] = process.argv.slice(2);
const minSeverity = Number(process.env.SAST_MIN_SECURITY_SEVERITY ?? "7.0");

if (!arg) {
  console.error(
    "Usage: bun scripts/security/sarif-severity-gate.ts <sarif-path>"
  );
  process.exit(2);
}

const target = path.resolve(arg);

const collectSarifFiles = (dirOrFile: string): string[] => {
  const st = statSync(dirOrFile);
  if (st.isFile()) {
    return dirOrFile.endsWith(".sarif") || dirOrFile.endsWith(".sarif.json")
      ? [dirOrFile]
      : [];
  }
  return readdirSync(dirOrFile)
    .filter((f) => f.endsWith(".sarif") || f.endsWith(".sarif.json"))
    .map((f) => path.join(dirOrFile, f));
};

const files = collectSarifFiles(target);
if (files.length === 0) {
  console.log(`No SARIF files under ${target}; nothing to gate.`);
  process.exit(0);
}

const blockers: Blocker[] = [];

for (const file of files) {
  const sarif = JSON.parse(readFileSync(file, "utf-8")) as SarifLog;
  for (const run of sarif.runs ?? []) {
    const rules = new Map(
      (run.tool?.driver?.rules ?? []).map((r) => [r.id, r] as const)
    );
    for (const result of run.results ?? []) {
      const rule = rules.get(result.ruleId ?? "") ?? ({} as SarifRule);
      const props = {
        ...rule.properties,
        ...result.properties,
      };
      const securitySeverity = Number(props["security-severity"] ?? Number.NaN);
      const level =
        result.level ?? rule.defaultConfiguration?.level ?? "warning";

      const isHigh =
        (!Number.isNaN(securitySeverity) && securitySeverity >= minSeverity) ||
        (Number.isNaN(securitySeverity) && level === "error");

      if (!isHigh) {
        continue;
      }

      const loc =
        result.locations?.[0]?.physicalLocation?.artifactLocation?.uri;
      blockers.push({
        ruleId: result.ruleId ?? "unknown",
        severity: Number.isNaN(securitySeverity) ? -1 : securitySeverity,
        message: result.message?.text ?? "",
        file: loc,
      });
    }
  }
}

if (blockers.length === 0) {
  console.log(
    `SAST gate passed (no findings with security-severity >= ${minSeverity}).`
  );
  process.exit(0);
}

console.error(
  `::error::SAST gate failed: ${blockers.length} finding(s) at/above security-severity ${minSeverity}`
);
for (const b of blockers) {
  console.error(
    `- ${b.ruleId} (severity=${b.severity})${b.file ? ` @ ${b.file}` : ""}: ${b.message}`
  );
}
process.exit(1);

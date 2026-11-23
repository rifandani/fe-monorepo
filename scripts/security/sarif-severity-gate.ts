#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { Result, Schema } from "effect";

const SecurityPropertiesSchema = Schema.Struct({
  "security-severity": Schema.optionalKey(
    Schema.Union([Schema.String, Schema.Finite])
  ),
});

type SarifProperties = typeof SecurityPropertiesSchema.Type;

const SarifRuleSchema = Schema.Struct({
  id: Schema.String,
  properties: Schema.optionalKey(SecurityPropertiesSchema),
  defaultConfiguration: Schema.optionalKey(
    Schema.Struct({ level: Schema.optionalKey(Schema.String) })
  ),
});

type SarifRule = typeof SarifRuleSchema.Type;

const SarifResultSchema = Schema.Struct({
  ruleId: Schema.optionalKey(Schema.String),
  level: Schema.optionalKey(Schema.String),
  message: Schema.optionalKey(
    Schema.Struct({ text: Schema.optionalKey(Schema.String) })
  ),
  properties: Schema.optionalKey(SecurityPropertiesSchema),
  locations: Schema.optionalKey(
    Schema.Array(
      Schema.Struct({
        physicalLocation: Schema.optionalKey(
          Schema.Struct({
            artifactLocation: Schema.optionalKey(
              Schema.Struct({ uri: Schema.optionalKey(Schema.String) })
            ),
          })
        ),
      })
    )
  ),
});

const SarifRunSchema = Schema.Struct({
  tool: Schema.optionalKey(
    Schema.Struct({
      driver: Schema.optionalKey(
        Schema.Struct({
          rules: Schema.optionalKey(Schema.Array(SarifRuleSchema)),
        })
      ),
    })
  ),
  results: Schema.optionalKey(Schema.Array(SarifResultSchema)),
});

const SarifLogSchema = Schema.Struct({
  runs: Schema.optionalKey(Schema.Array(SarifRunSchema)),
});

type SarifLog = typeof SarifLogSchema.Type;

interface Blocker {
  ruleId: string;
  severity: number;
  message: string;
  file?: string;
}

const [arg] = process.argv.slice(2);
const minSeverity = Number(process.env.SAST_MIN_SECURITY_SEVERITY ?? "7.0");

if (arg === undefined || arg === "") {
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

const failParse = (message: string): never => {
  console.error(`::error::SAST gate: ${message}`);

  return process.exit(1);
};

const readSarif = (file: string): SarifLog => {
  let json: unknown;

  try {
    json = JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return failParse(`${file} is not valid JSON`);
  }

  const parsed = Schema.decodeUnknownResult(SarifLogSchema)(json);

  return Result.isSuccess(parsed)
    ? parsed.success
    : failParse(`${file} is not a valid SARIF log:\n${parsed.failure.message}`);
};

const emptyRule: SarifRule = { id: "" };

const blockers: Blocker[] = [];

for (const file of files) {
  const sarif = readSarif(file);

  for (const run of sarif.runs ?? []) {
    const rules = new Map(
      (run.tool?.driver?.rules ?? []).map((r) => [r.id, r] as const)
    );

    for (const result of run.results ?? []) {
      const rule = rules.get(result.ruleId ?? "") ?? emptyRule;

      const props: SarifProperties = {
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

      if (loc !== undefined && /(?:^|\/)repos\//u.test(loc)) {
        continue;
      }

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
    `- ${b.ruleId} (severity=${b.severity})${b.file === undefined || b.file === "" ? "" : ` @ ${b.file}`}: ${b.message}`
  );
}

process.exit(1);

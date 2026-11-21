#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const PLAN_DIR = path.join(REPO_ROOT, ".github", "security", "zap");
const REPORT_DIR = path.join(REPO_ROOT, ".zap-reports");
const DEFAULT_IMAGE = "ghcr.io/zaproxy/zaproxy:stable";

const LOCAL_TARGET_HINT = "http://spa.fe-monorepo.localhost:4100";

const fail: (message: string) => never = (message) => {
  console.error(`zap: ${message}`);
  process.exit(1);
};

const [plan] = process.argv.slice(2);

if (plan === undefined || plan === "") {
  fail(
    `no plan given. Available: ${readdirSync(PLAN_DIR)
      .filter((file) => file.endsWith(".yaml"))
      .map((file) => file.replace(/\.yaml$/u, ""))
      .join(", ")}`
  );
}

if (!existsSync(path.join(PLAN_DIR, `${plan}.yaml`))) {
  fail(`no such plan: .github/security/zap/${plan}.yaml`);
}

const target = process.env.ZAP_TARGET;

if (target === undefined || target === "") {
  fail(
    `ZAP_TARGET is not set. Start the app with \`bun zap:spa:serve\`, then:\n` +
      `  ZAP_TARGET=${LOCAL_TARGET_HINT} bun zap:${plan.replace(/-baseline$/u, "")}`
  );
}

const parseTarget = (value: string): URL => {
  try {
    return new URL(value);
  } catch {
    return fail(`ZAP_TARGET is not a URL: ${value}`);
  }
};

const targetUrl = parseTarget(target);

if (targetUrl.hostname === "localhost" && process.platform !== "linux") {
  fail(
    `ZAP_TARGET points at \`localhost\`, which inside the container is the container itself.\n` +
      `  Use a \`.localhost\` hostname instead, e.g. ${LOCAL_TARGET_HINT}`
  );
}

const resolveNetworkArgs = (url: URL): string[] => {
  if (process.platform === "linux") {
    return ["--network", "host"];
  }

  if (url.hostname.endsWith(".localhost")) {
    return ["--add-host", `${url.hostname}:host-gateway`];
  }

  return [];
};

mkdirSync(REPORT_DIR, { recursive: true });

chmodSync(REPORT_DIR, 0o777);

const args = [
  "run",
  "--rm",
  ...resolveNetworkArgs(targetUrl),
  "-e",
  `ZAP_TARGET=${target}`,
  "-v",
  `${REPO_ROOT}:/zap/wrk/:rw`,
  ...(process.stdout.isTTY ? ["-t"] : []),
  process.env.ZAP_IMAGE ?? DEFAULT_IMAGE,
  "zap.sh",
  "-cmd",
  "-autorun",
  `/zap/wrk/.github/security/zap/${plan}.yaml`,
];

console.log(`zap: ${plan} → ${target}`);

const result = spawnSync("docker", args, { stdio: "inherit" });

if (readdirSync(REPORT_DIR).length > 0) {
  console.log("zap: reports in .zap-reports/");
}

process.exit(result.status ?? 1);

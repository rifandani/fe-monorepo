#!/usr/bin/env bun
/**
 * Local runner for the OWASP ZAP Automation Framework plans in `security/zap/`.
 *
 * This exists so a laptop run and a CI run are the same run. `zaproxy/action-af`
 * issues a `docker run` that mounts the repository root at `/zap/wrk` and puts
 * the container on the host network; this reproduces that, so a plan verified
 * here behaves identically in `.github/workflows/dast.yml`.
 *
 * Usage:
 *   ZAP_TARGET=http://spa.fe-monorepo.localhost:4100 bun zap:spa
 *
 * `ZAP_TARGET` has no default on purpose. The scan reaches whatever it is
 * pointed at, so the target is always an explicit act.
 *
 * Reports land in `.zap-reports/` (gitignored), one SARIF and one HTML per plan.
 */

import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const PLAN_DIR = path.join(REPO_ROOT, "security", "zap");
const REPORT_DIR = path.join(REPO_ROOT, ".zap-reports");
const DEFAULT_IMAGE = "ghcr.io/zaproxy/zaproxy:stable";

const LOCAL_TARGET_HINT = "http://spa.fe-monorepo.localhost:4100";

const fail: (message: string) => never = (message) => {
  console.error(`zap: ${message}`);
  process.exit(1);
};

const [plan] = process.argv.slice(2);
if (!plan) {
  fail(
    `no plan given. Available: ${readdirSync(PLAN_DIR)
      .filter((file) => file.endsWith(".yaml"))
      .map((file) => file.replace(/\.yaml$/u, ""))
      .join(", ")}`
  );
}

if (!existsSync(path.join(PLAN_DIR, `${plan}.yaml`))) {
  fail(`no such plan: security/zap/${plan}.yaml`);
}

const target = process.env.ZAP_TARGET;
if (!target) {
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

// `localhost` inside the container is the container. Docker writes its own
// `127.0.0.1 localhost` into /etc/hosts and will not let an `--add-host` entry
// win against it, so there is no way to rescue a bare-localhost target.
if (targetUrl.hostname === "localhost" && process.platform !== "linux") {
  fail(
    `ZAP_TARGET points at \`localhost\`, which inside the container is the container itself.\n` +
      `  Use a \`.localhost\` hostname instead, e.g. ${LOCAL_TARGET_HINT}`
  );
}

/**
 * How the container reaches the app.
 *
 * Linux (and CI) uses the host network, matching what `action-af` does. On
 * macOS there is no host network, so a `*.localhost` hostname is mapped to the
 * host gateway — mapping the real hostname rather than using
 * `host.docker.internal` keeps the `Origin` header the app sees correct. A
 * public target needs neither.
 */
const resolveNetworkArgs = (url: URL): string[] => {
  if (process.platform === "linux") {
    return ["--network", "host"];
  }
  if (url.hostname.endsWith(".localhost")) {
    return ["--add-host", `${url.hostname}:host-gateway`];
  }
  return [];
};

// The arm64 `:stable` image ships a zero-filled `/zap/zap.sh` and dies with
// "exec format error". Forcing the amd64 image costs emulation speed and works.
const platformArgs =
  process.arch === "arm64" ? ["--platform", "linux/amd64"] : [];

mkdirSync(REPORT_DIR, { recursive: true });
// ZAP runs as uid 1000 in the container and has to write into the mount.
chmodSync(REPORT_DIR, 0o777);

const args = [
  "run",
  "--rm",
  ...platformArgs,
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
  `/zap/wrk/security/zap/${plan}.yaml`,
];

console.log(`zap: ${plan} → ${target}`);
const result = spawnSync("docker", args, { stdio: "inherit" });

if (readdirSync(REPORT_DIR).length > 0) {
  console.log("zap: reports in .zap-reports/");
}

process.exit(result.status ?? 1);

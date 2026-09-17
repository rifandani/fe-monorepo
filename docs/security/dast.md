# DAST with OWASP ZAP

Dynamic application security testing for `apps/spa`.
One Automation Framework plan drives both the laptop and CI, so there is nothing to keep in step.

## Reference

| What | Where |
| --- | --- |
| Plan | `.github/security/zap/spa-baseline.yaml` |
| Local runner | `scripts/security/zap.ts` |
| Workflow | `.github/workflows/dast.yml` |
| Reports | `.zap-reports/` (gitignored, rebuilt on demand) |
| Decision record | [ADR-0005](../adr/0005-dast-scans-the-deployed-spa.md) |

| Command | Does |
| --- | --- |
| `bun zap:spa:serve` | Builds `apps/spa` in production mode with a dead API (to prevent FE scans a BE api that we not own) and serves it on `:4100` |
| `ZAP_TARGET=… bun zap:spa` | Runs the baseline plan against `ZAP_TARGET` |

| Variable | Default | Meaning |
| --- | --- | --- |
| `ZAP_TARGET` | *none — required* | Origin to scan. No default: a scan reaches whatever it is pointed at, so pointing it is always deliberate. |
| `ZAP_IMAGE` | `ghcr.io/zaproxy/zaproxy:stable` | Container image |
| `SPA_TARGET_URL` | *unset* | GitHub Actions **variable** (not a secret) holding the deployed URL CI scans |

## Run a scan locally

```sh
# terminal 1
bun zap:spa:serve

# terminal 2
ZAP_TARGET=http://spa.fe-monorepo.localhost:4100 bun zap:spa
```

Open `.zap-reports/spa-baseline.html` for the readable report.
Or `.zap-reports/spa-baseline.sarif.json` is the same findings in the format CI uploads to code scanning.

## Run a scan in CI by hand

```sh
gh workflow run dast.yml -f target_url=https://your-deployment.example.com
```

With no input it uses the `SPA_TARGET_URL` repository variable. With neither, the job skips and the run is green — that is deliberate, so the workflow can land before the variable is set. 

Set it under **Settings → Secrets and variables → Actions → Variables**.

## What the scan does and does not cover

[ADR-0005](../adr/0005-dast-scans-the-deployed-spa.md) argues all of this in full. In short:

- **Passive only.** The spider requests the seeded URLs, submits no forms, and the active scanner never runs. `/api` is excluded in the plan's context.
- **No active scan, by design.** `apps/spa` is a static bundle whose forms post to an API in another repository.
- **The crawl is deliberately shallow.** The seeds in the plan are the whole crawl. Adding a route to the app means adding it to `.github/security/zap/spa-baseline.yaml`. Not switching on `ajaxSpider`, which would execute the app's JavaScript and is the one thing that would put the scan in touch with that other backend.
- **Not the sitemap.** `apps/spa/public/sitemap.xml` bakes its domain in at generation time and currently points at `http://localhost:3001`.

## Triage a finding

1. Open `.zap-reports/spa-baseline.html` and find the alert.
2. Most findings for a static SPA are **response headers**. Fix them in whatever configures headers on the deployed origin — CDN, platform, or reverse proxy. A missing CSP, `Referrer-Policy`, `X-Content-Type-Options`, or `Permissions-Policy` is a real gap, not scanner noise.
3. Fix the header, redeploy, re-run the scan against the deployed URL.

Note that `bun zap:spa:serve` uses `vite preview`, which does not replay production headers.
Header findings from a local run tell you nothing about the deployment either way — that is why CI scans the deployed URL.

## Suppress a finding

Only after triage, and never globally. 
Add a dated, reasoned, URL-scoped entry to the `alertFilter` job in `.github/security/zap/spa-baseline.yaml`, the same shape as the timed entries in the SCA allowlist:

```yaml
    alertFilters:
      # 2026-09-15 — <why this is not a real finding here>
      - ruleId: 10038
        ruleName: "Content Security Policy (CSP) Header Not Set"
        newRisk: "False Positive"
        url: ".*/some/specific/path.*"
        urlRegex: true
```

An entry without a `ruleName`, a date, a reason, and a URL scope is a bug.

## Change the failure threshold

The `exitStatus` job at the end of the plan. 
It is set to `errorLevel: Medium`, not `High`, on purpose: a static SPA served by a CDN has no server-side logic and will essentially never produce a High, so a High threshold is a gate that cannot fire. 
`warnExitValue: 0` keeps Lows reportable without failing the run.

## Troubleshoot

| Symptom | Cause |
| --- | --- |
| `exec format error` | arm64 image; the runner should already force `--platform linux/amd64` |
| Scan finds zero URLs | `ZAP_TARGET` does not match the context scope, or the app is not actually serving |
| Permission denied writing reports | ZAP runs as uid 1000; the runner `chmod 0777`s `.zap-reports/` — check it was created |
| CI job skipped | `SPA_TARGET_URL` is unset and no `target_url` input was given |

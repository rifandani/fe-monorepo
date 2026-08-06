# Security Policy

## Supported Versions

Currently, only the latest on `main` is supported with security updates.

## Reporting a Vulnerability

Report via a private channel to the Application lead when possible. If that is unavailable, open a GitHub issue labeled `security` and avoid including exploit details in public text.

## Secure development process

Aligned with OWASP Top 10 (2021) as the secure-coding baseline. ASVS is not mandated for this repository.

### CI/CD controls

| Control | Workflow | Tool | Blocks merge/release |
| --- | --- | --- | --- |
| Secret detection | `ci.yml` | gitleaks | Any finding |
| SCA / dependency scanning | `security.yml` | [OSV-Scanner](https://github.com/google/osv-scanner) via `scripts/security/sca-gate.ts` | High and Critical |
| SAST | `security.yml` | CodeQL (`security-extended`) | security-severity ≥ 7.0 (High/Critical) |
| DAST / pentest / platform assessment | — | — | Out of scope (Security Governance item 10) |
| Container / IaC scanning | — | — | N/A (no production images / IaC in repo) |

Dependabot (`.github/dependabot.yml`) opens monthly update PRs; it does not replace the SCA gate.

### Severity → release gate

| Severity | Gate | Exception |
| --- | --- | --- |
| Critical | Blocks | Not allowlistable. PR label `security-exception` only, Application lead approval |
| High | Blocks | Timed entry in `security/sca-allowlist.json` (SCA) and/or `security-exception` label |
| Medium / Low | Does not block | Track and fix in normal backlog |

**Exception approval:** Application lead applies the `security-exception` label on the PR (or renews an SCA allowlist entry with a new `expires` date and reason). Infrastructure owns pipeline capability; Application lead owns risk acceptance.

### Finding review and fix targets

| Severity | Reviewer | Target fix time |
| --- | --- | --- |
| Critical | Application lead (+ Infrastructure if pipeline/infra) | 7 days |
| High | Owning developer; escalate to Application lead | 30 days |
| Medium | Owning developer | 90 days |
| Low | Owning developer | Best effort / next dependency bump |

### Local commands

```bash
bun run audit:sca      # same SCA gate as CI
bun run check:security # fallow security candidates (informational; not the CI SAST gate)
```

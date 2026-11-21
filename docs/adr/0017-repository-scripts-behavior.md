# Repository scripts behavior

> Recorded on 2026-11-20 from the comments in `scripts/` ([ADR-0011](./0011-code-carries-no-comments.md)). Builds on [ADR-0005](./0005-dast-scans-the-deployed-spa.md).

## Vendored repositories (`scripts/update-vendored-repos.ts`, `bun repos:update [name...]`)

- Each repository under `repos/` is a `git subtree --squash` copy at the tip of its upstream branch: one squash commit and one merge commit. XState tracks `next`, because `main` is still v5.
- The upstream commit is resolved with `git ls-remote` and fetched by hash. The script never reads `FETCH_HEAD`: after a failed fetch, it still holds the last fetch, and `git subtree` would vendor that.
- The last vendored commit comes from the squash commits on this branch. A squash-merged pull request drops the subtree commits, so a plain copy can follow a subtree in history. A folder that is not yet a subtree is removed in its own commit first, because `git subtree add` refuses a prefix that exists. Ignored files (an editor's `.vscode/`) survive `git rm`, so the script removes them too.

## DAST runner (`scripts/security/zap.ts`, `bun zap:spa`)

- It runs the ZAP Automation Framework plans in `.github/security/zap/` exactly as `zaproxy/action-af` does in CI: the repository root mounted at `/zap/wrk`. A plan that passes on a laptop behaves the same in `.github/workflows/dast.yml`.
- `ZAP_TARGET` has no default. The scan reaches whatever it points at, so the target must be an explicit act.
- Linux and CI use the host network. macOS has no host network, so the script maps a `*.localhost` host name to the host gateway. It maps the real host name, not `host.docker.internal`, so the `Origin` header stays correct. A bare `localhost` target is refused: inside the container it is the container, and Docker does not let `--add-host` override it.
- The report folder is world-writable, because ZAP runs as uid 1000 in the container. Reports (SARIF and HTML per plan) go to the git-ignored `.zap-reports/`.

## SCA gate (`scripts/security/sca-gate.ts`, `bun audit:sca`)

- It runs OSV-Scanner and fails on high and critical findings. A high finding can be allowlisted for a time in `.github/security/sca-allowlist.json`; a critical finding cannot. `SCA_AUDIT_LEVEL` sets the level (default `high`).
- An advisory with no severity counts as high: the gate fails closed.
- OSV-Scanner exits 0 for no findings and 1 for findings; any other code is a tool failure.
- The OSV config gets a bare TOML date, not a quoted string, because OSV-Scanner expects a `LocalDate`.

## SAST gate (`scripts/security/sarif-severity-gate.ts`)

- It fails when a CodeQL SARIF result has `security-severity` at or above `SAST_MIN_SECURITY_SEVERITY` (default 7.0, High). Results under `repos/` are ignored, even when a scan config forgot to exclude them, because vendored trees are not product code.

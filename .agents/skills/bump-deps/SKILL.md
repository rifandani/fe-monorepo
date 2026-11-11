---
name: bump-deps
description: Update vendored subtrees, JS dependencies, and project agent skills; review breaking changes, pass checks, and hand off to commit + /release.
disable-model-invocation: true
---

# Bump deps

Leading word: **bump**. Scope is the root `bump:deps` script (Expo/RN/Tamagui stay where that script leaves them), the vendored subtrees under `repos/`, and all project agent skills. Keep user-global and plugin-managed skills in their own update workflows.

## 1. Sync

Pull each vendored upstream **first**: `git subtree pull` commits, so it needs the clean tree that step 2 destroys.

| prefix | remote | branch |
| --- | --- | --- |
| `repos/effect` | `https://github.com/Effect-TS/effect.git` | `main` |

```bash
git subtree pull --prefix=<prefix> <remote> <branch> --squash
```

One row for each directory under `repos/`. A directory with no row means the table is stale — find the upstream, pull it, and add the row here.

A conflict here is upstream against a local edit of read-only reference files. Take upstream (`git checkout --theirs -- <prefix>`), then say so in the report.

**Done when:** each directory under `repos/` is pulled — every pull either reported already up to date or wrote a squash commit.

## 2. Apply

Before updates, record the installed JS versions and inventory project skills with `npx --yes skills list`. Compare the list with `skills-lock.json`, `.agents/skills/`, and agent-specific skill directories. For each imported skill, record its source, path, version when present, and lock hash. Save local changes to imported skills for reapplication; keep repo-owned skills local.

For an imported skill missing from the lock, verify its upstream from metadata or git history. Register that skill with `npx --yes skills add <source> --skill <name> --agent <installed-agent> --yes`; repeat `--agent` for its existing agent installations. Report an unresolved source as blocked. Update existing skills only; keep the installed skill set.

Run `bun bump:deps`, then `bun i`, then `bun bump:skills`.

Then bump the node runtime: set `.node-version` to the newest release on the 26.x line (`curl -s https://nodejs.org/dist/index.json | head -c 200`). Leave `engines.node` alone — it is the support floor, not the pin.

**Done when:** dependency install and skill updates succeeded, `.node-version` is current, and every project skill is accounted for as updated, already current, repo-owned, or blocked with a reason. An unchanged version or hash is valid when already current.

## 3. Classify

Diff old → new versions and skill hashes.

- **Vendored** (each `repos/` prefix) — read the source you just pulled: its changelog, migration guide, and the API this repo calls. It beats GitHub, and it is already on disk.
- **Skills** — apply the major/minor/patch rules below when the source publishes versions. For every changed skill, also read the installed diff for changes to triggers, steps, scripts, tools, and permissions. If versions or release notes are absent, read its GitHub commit history or compare view for the changed files. A content hash is a revision, not a semantic version; inspect the diff before classifying it.
- **Major** — GitHub changelog. If the package ships an upgrade blog (React, Vite/Vitest, Tailwind, TypeScript), read that too. Brief breaking changes that bite *this* repo, then continue.
- **Minor** — same, but only for the **popular** set, or a package that later fails a gate: React, React DOM, TypeScript, Vitest, Tailwind, Ultracite/oxlint.
- **Patch** — skip notes.

**Done when:** every major, popular-minor, and changed skill is accounted for — required notes or history read, relevant breaking changes described, and required code/config/instruction changes listed with source links.

## 4. Adapt

Apply the required code/config/instruction changes from step 3. Reapply local skill changes against the new upstream instructions. Update affected skill references, agent configuration, and tool commands; keep agent links pointed at the intended skill files.

**Replace, don’t decorate.** Adopt experimental APIs only when they retire a pattern this repo already has (workaround, TODO, or a config we already set). New knobs with no current use → mention in the report, leave off.

**Done when:** you did an edit for each bite, or the report tells that the bite does not apply.

## 5. Gates

Check each updated skill's frontmatter, referenced files, required tools, and agent links. Run any validation supplied by its source. Recheck project updates with `npx --yes skills check --project`; resolve failed checks and updates still available. If preserved local changes cause a hash mismatch, compare them with upstream and report the reason.

Loop until all green, in parallel/subagent:

1. `bun lint` (it also type-checks)
2. `bun test:unit:cov`
3. `bun spa build`
4. `bun audit:sca`
5. `bun check:all`

**Done when:** all commands pass, skill validation passes, each update-check result is explained, and all blocked skills are reported.

## 6. Hand off

Report: subtrees pulled (and any conflict you resolved toward upstream), majors + popular minors, skills updated (old → new version/hash), current/local/blocked skills, source links, relevant breaking changes, code/config/instruction edits, preserved local skill changes, skill validation, experimental adoptions (and skipped knobs).

The subtree pulls are already committed; leave dependency, skill, and lock-file changes uncommitted. Tell the user the next step is: **check the report → commit → `/bump-ui` or `/release`**.

**Done when:** that report is delivered and that next-step line is spoken.

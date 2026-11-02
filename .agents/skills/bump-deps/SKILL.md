---
name: bump-deps
description: Pull the vendored subtrees, bump JS deps via ncu, read majors, green the gates, hand off to commit + /release.
disable-model-invocation: true
---

# Bump deps

Leading word: **bump**. Universe is the root `bump:deps` script (Expo/RN/Tamagui stay where that script leaves them) plus the vendored subtrees under `repos/`.

## 1. Sync

Pull each vendored upstream **first**: `git subtree pull` commits, so it needs the clean tree that step 2 destroys.

| prefix | remote | branch |
| --- | --- | --- |
| `repos/effect` | `https://github.com/Effect-TS/effect.git` | `main` |
| `repos/hono` | `https://github.com/honojs/hono.git` | `main` |

```bash
git subtree pull --prefix=<prefix> <remote> <branch> --squash
```

One row for each directory under `repos/`. A directory with no row means the table is stale — find the upstream, pull it, and add the row here.

A conflict here is upstream against a local edit of read-only reference files. Take upstream (`git checkout --theirs -- <prefix>`), then say so in the report.

**Done when:** each directory under `repos/` is pulled — every pull either reported already up to date or wrote a squash commit.

## 2. Apply

`bun bump:deps`, then `bun i`.

Then bump the node runtime: set `.node-version` to the newest release on the 26.x line (`curl -s https://nodejs.org/dist/index.json | head -c 200`). Leave `engines.node` alone — it is the support floor, not the pin.

**Done when:** install succeeded, git shows `package.json` / `bun.lock` version moves, and `.node-version` is current.

## 3. Classify

Diff old → new versions.

- **Vendored** (each `repos/` prefix) — read the source you just pulled: its changelog, migration guide, and the API this repo calls. It beats GitHub, and it is already on disk.
- **Major** — GitHub changelog. If the package ships an upgrade blog (React, Vite/Vitest, Tailwind, TypeScript), read that too. Brief breaking changes that bite *this* repo, then continue.
- **Minor** — same, but only for the **popular** set, or a package that later fails a gate: React, React DOM, TypeScript, Vitest, Tailwind, Ultracite/oxlint.
- **Patch** — skip notes.

**Done when:** every major and every popular-minor is accounted for — notes read, bites briefed, required code listed.

## 4. Adapt

Apply the required code/config from step 3.

**Replace, don’t decorate.** Adopt experimental APIs only when they retire a pattern this repo already has (workaround, TODO, or a config we already set). New knobs with no current use → mention in the report, leave off.

**Done when:** you did an edit for each bite, or the report tells that the bite does not apply.

## 5. Gates

Loop until all green, in parallel/subagent:

1. `bun lint-typecheck`
2. `bun test:unit:cov`
3. `bun spa build`
4. `bun audit:sca`
5. `bun check:all`

**Done when:** all commands pass.

## 6. Hand off

Report: subtrees pulled (and any conflict you resolved toward upstream), majors + popular minors, breaking changes that bite, code/config edits, experimental adoptions (and skipped knobs).

The subtree pulls are already committed; leave the dep diff uncommitted. Tell the user the next step is: **check the report → commit → `/bump-ui` or `/release`**.

**Done when:** that report is delivered and that next-step line is spoken.

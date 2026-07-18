---
name: release
description: Add a changeset or cut a fixed-version monorepo release (tag + push).
disable-model-invocation: true
---

# Release

Fixed-version Changesets release for this monorepo. Leading word: **release**.

Ask which branch if unclear: **add** (changeset for a PR) or **cut** (version + tag + push).

## Verify config (both branches)

1. Read `.changeset/config.json`.
2. Confirm `fixed` is a non-empty group containing every workspace package below.

**Packages (all five):** `@workspace/core`, `@workspace/expo`, `@workspace/spa`, `@workspace/typescript-config`, `@workspace/web`

**Done when:** those five names are present in `fixed[0]`. If not, stop — repo setup is wrong; do not patch config from this skill.

---

## Branch: add

Write a pending changeset; do not commit.

1. **Survey** — Inspect the change set (diff / commits vs base). Propose one bump: `feat` → minor, `fix`/`chore` → patch, breaking → major.
2. **Confirm** — Present the proposed bump + a short summary. Wait for the user to accept or override.
3. **Write** — Create `.changeset/<slug>.md` (random short slug) with frontmatter listing **all five** packages at the confirmed bump, then the summary body. Prefer writing the file directly over interactive `bun cs`.

**Done when:** the new `.changeset/*.md` exists, names all five packages, bump matches confirmation, and nothing was committed.

---

## Branch: cut

Version packages, commit, tag `vX.Y.Z`, push. No registry publish.

### 1. Preflight

Run all checks; stop on first failure:

| Check | Pass |
| --- | --- |
| Branch | current branch is `main` |
| Sync | `main` matches `origin/main` (fetch first) |
| Clean | `git status` has no staged/unstaged/untracked work (except what you will create) |
| Changesets | ≥1 `*.md` in `.changeset/` besides `config.json` / README |
| Lint/types | `bun lint-typecheck` exits 0 |

**Done when:** every row passes.

### 2. Version

Run `bun cs:v`.

**Done when:** every package in the fixed group shares one new version in its `package.json`, each has an updated `CHANGELOG.md`, and pending changeset files are consumed.

### 3. Go

Show the new version `X.Y.Z` and a short release summary. Wait for explicit go before git write/push.

### 4. Commit, tag, push

1. Stage version bumps + CHANGELOGs + deleted changesets.
2. Commit: `chore: release vX.Y.Z`
3. Annotated tag: `git tag -a "vX.Y.Z" -m "vX.Y.Z"`
4. Push: `git push origin main` and `git push origin "vX.Y.Z"`

**Done when:** `origin` has the release commit and tag `vX.Y.Z`. CI (`.github/workflows/release.yml`) creates the GitHub Release from the tag — do not re-run changelogithub locally unless that workflow fails.

---
name: upkeep-storage-space
description: Measure what takes disk space in the project folder, close .gitignore gaps, and remove caches and build output after the user approves a recommended list.
disable-model-invocation: true
argument-hint: "[path]"
---

# Upkeep storage space

Keep the project folder at a reasonable size. Work within the given path, or the repo root when no path is given. Steps 1 to 3 are **read-only**. Delete, move, or edit nothing until the user approves specific items in step 4.

## 1. Measure

Measure every directory, including gitignored ones. Use `du -sh` on the top-level entries, then go down into each large entry until the space is assigned to specific folders: one `node_modules`, one build output, one cache, one worktree. Measure `.git` with `git count-objects -vH`. List `git worktree list`.

Find what git sees:

- `git status --porcelain --ignored` shows untracked and ignored paths.
- `git ls-files` with a size check shows large tracked files.

**Done when:** each entry of 50 MB or more has a size and a path, and the measured entries account for most of the folder total.

## 2. Classify

Put each large path in one class. Use evidence: the tool that writes it, the script that rebuilds it, the git status.

- **Disposable:** a cache or build output that a command rebuilds. Examples: `dist`, `build`, `coverage`, `.vitest`, `.stryker-tmp`, `.npm-cache`, `.tmp-skills`, `node_modules/.cache`, tool caches such as `.fallow/cache`, test reports. Record the rebuild command and its cost.
- **Expensive to rebuild:** disposable, but slow or needs network. Examples: `node_modules` (`bun install`), Expo `android/` and `ios/` (prebuild). Recommend these only when they are large and stale.
- **State:** gitignored but not disposable. Examples: `.env*` files, hand-written files inside a cache folder such as `.fallow/security-verdicts.json`, incremental reports that a tool reads back, local databases. Keep these.
- **User work:** worktrees under `.worktrees/` and `.claude/worktrees/`, untracked source files, stashes. Keep these. For a stale worktree, recommend `/delete-wt` and state its branch and its uncommitted changes.
- **Tracked:** source in git, including the `repos/` subtrees. Keep these. `bun repos:update` refreshes `repos/`.

Gitignored is not the same as disposable. When the evidence is not sufficient, put the path in **state**.

Find **gitignore gaps**:

- an untracked path that a tool generated, which `.gitignore` does not cover.
- a tracked file that is generated or large binary output. Its fix is `git rm --cached` plus a `.gitignore` entry.

Find **git cleanup**: prunable worktrees (`git worktree prune --dry-run`) and loose objects that `git gc` can pack. The `clean` script also deletes `bun.lock`. Do not recommend the `clean` script; recommend the specific paths.

**Done when:** each path from step 1 has a class and evidence, and each gap has a proposed `.gitignore` line.

## 3. Report and recommend

Show one table, sorted by size, largest first:

| Path | Size | Class | Recommendation | Restore command |
| ---- | ---- | ----- | -------------- | --------------- |

Recommend **delete** for disposable paths, **delete if stale** for expensive-to-rebuild paths, and **keep** for state, user work, and tracked paths. Show the total space that the recommended deletions recover. List the proposed `.gitignore` lines and git cleanup commands below the table.

## 4. Get approval

Ask the user which items to apply. Use the question tool with multiple selection. Put the recommended items first. Group items so that each question has no more than four options, for example "Build output and test reports", "Tool caches", "node_modules", "Gitignore and git cleanup". Name the paths and total size in each option description.

**Done when:** the user has selected the items to apply, or has declined. Apply only the selected items. A selection approves those items in this run only.

## 5. Apply and verify

Before each deletion, confirm again that the path exists, that it is inside the repo, and that `git ls-files <path>` is empty. Then delete it. Apply the approved `.gitignore` lines and git cleanup commands. Run the restore command for any deleted item that the next normal work needs, such as `bun install`, when the user asks.

Measure the folder again. Confirm with `git status --porcelain` that no tracked file changed, except the `.gitignore` edit and any approved `git rm --cached`.

**Done when:** each approved item is applied or has a stated error, and the before and after sizes are known.

## 6. Report

Report the space recovered, the items applied, the items kept and why, and the restore commands for the deleted items. Leave changes uncommitted unless the user asks for a commit.

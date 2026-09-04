---
name: delete-wt
description: Tear down a `.worktrees/` git worktree and its local branch.
disable-model-invocation: true
argument-hint: "<name> [--force]"
---

Tear down a **worktree** created by `/wt`: remove `.worktrees/<name>/`, then drop local branch `<name>` when fully merged.

## 1. Main-checkout gate

Run from the primary repo checkout only. If `git rev-parse --git-dir` output contains `worktrees/`, stop and tell the user to `cd` to the main checkout.

**Done when:** `git rev-parse --git-dir` path has no `worktrees/` segment.

## 2. Preflight

- Resolve repo root: `git rev-parse --show-toplevel`.
- Parse `$ARGUMENTS` as `<name>` and optional `--force`. Reject unknown tokens.
- Target path: `<repo-root>/.worktrees/<name>/` — not `.claude/worktrees/` or any other path.

**Done when:** repo root resolved, `<name>` parsed, force flag known (on or off).

## 3. Remove worktree

**Live path** (directory exists):

```bash
git worktree remove .worktrees/<name>          # default
git worktree remove --force .worktrees/<name>  # only when --force
```

If the path is dirty / has untracked files and `--force` is off: stop, report, and tell the user to re-run with `--force` or clean the tree by hand.

**Stale registration** (directory missing, still listed by `git worktree list`):

```bash
git worktree prune
```

**Done when:** `.worktrees/<name>/` is gone and `git worktree list` no longer lists it (or prune cleared the stale entry).

## 4. Drop local branch

```bash
git branch -d <name>
```

- Success: report branch deleted.
- Failure (not fully merged, or no such branch): leave the branch; report the git message; tell the user they may `git branch -D <name>` by hand. Never run `-D`. Never delete a remote branch.

**Done when:** `-d` succeeded, or failure reported without force-deleting.

## 5. Hand off

Print: removed path (or “pruned stale”), branch outcome (`deleted` / `kept: <reason>`).

**Done when:** the user has path and branch status.

---
name: wt
description: Spin up an isolated git worktree under `.worktrees/` for parallel agent work.
disable-model-invocation: true
argument-hint: "Branch and directory name (e.g. feat-auth)"
---

A **worktree** is a second checkout of this repo — same history, separate working tree — so parallel work stays off the primary checkout.

Bootstrap scripts live in [scripts/](scripts/) beside this skill.

## 1. Main-checkout gate

Run from the primary repo checkout only. If `git rev-parse --git-dir` output contains `worktrees/`, stop and tell the user to `cd` to the main checkout.

**Done when:** `git rev-parse --git-dir` path has no `worktrees/` segment.

## 2. Preflight

- Resolve repo root: `git rev-parse --show-toplevel`.
- Parse `$ARGUMENTS` as `<name>` — directory under `.worktrees/` and branch name (same string).
- Base ref (optional): current branch, or `git symbolic-ref --short refs/remotes/origin/HEAD` when set.
- **Gitignore gate:** `git check-ignore -q .worktrees/` must succeed. If not: append `.worktrees/` to `.gitignore`, commit on the current branch, then continue.

**Done when:** repo root resolved, `<name>` parsed, `.worktrees/` ignored (committed if you added it).

## 3. Create worktree

Target: `<repo-root>/.worktrees/<name>/` — not `.claude/worktrees/` or any other path.

Branch missing:

```bash
git worktree add -b <name> .worktrees/<name> [<base-ref>]
```

Branch exists:

```bash
git worktree add .worktrees/<name> <name>
```

**Done when:** worktree exists at `.worktrees/<name>/` on branch `<name>`.

## 4. Bootstrap

Run [scripts/setup-worktree-unix.sh](scripts/setup-worktree-unix.sh) (Windows: [scripts/setup-worktree-windows.ps1](scripts/setup-worktree-windows.ps1)) **inside** the new worktree with `ROOT_WORKTREE_PATH` set to the main checkout:

```bash
(
  cd "<repo-root>/.worktrees/<name>"
  export ROOT_WORKTREE_PATH="<repo-root>"
  bash "<repo-root>/.agents/skills/wt/scripts/setup-worktree-unix.sh"
)
```

**Done when:** setup exits 0 (deps installed, app env files synced).

## 5. Hand off

Print absolute worktree path, branch name, and SPA/Web URL / start command from setup output.

**Done when:** the user has path, branch, and next dev step.

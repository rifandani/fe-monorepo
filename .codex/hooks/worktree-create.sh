#!/usr/bin/env bash
# Codex local-environment setup script. Codex has already created the worktree;
# this script bootstraps dependencies and ignored app env files inside it.
set -euo pipefail

log() { printf '%s\n' "$*" >&2; }

WORKTREE_PATH="$(git rev-parse --show-toplevel)"
ROOT_WORKTREE_PATH="${ROOT_WORKTREE_PATH:-}"

if [[ -z "$ROOT_WORKTREE_PATH" ]]; then
  while IFS= read -r candidate; do
    [[ -n "$candidate" && "$candidate" != "$WORKTREE_PATH" ]] || continue
    # The original checkout normally owns the .git directory; linked worktrees
    # have a .git file. Prefer that checkout as the source for ignored envs.
    if [[ -d "$candidate/.git" ]]; then
      ROOT_WORKTREE_PATH="$candidate"
      break
    fi
  done < <(git -C "$WORKTREE_PATH" worktree list --porcelain | sed -n 's/^worktree //p')
fi

if [[ -z "$ROOT_WORKTREE_PATH" || ! -d "$ROOT_WORKTREE_PATH" ]]; then
  log "error: could not locate the original checkout to copy local env files from"
  exit 1
fi

SETUP="$WORKTREE_PATH/.agents/skills/wt/scripts/setup-worktree-unix.sh"
if [[ ! -f "$SETUP" ]]; then
  log "error: missing shared worktree setup script: $SETUP"
  exit 1
fi

log "==> Bootstrapping Codex worktree from $ROOT_WORKTREE_PATH"
cd "$WORKTREE_PATH"
export ROOT_WORKTREE_PATH
bash "$SETUP"

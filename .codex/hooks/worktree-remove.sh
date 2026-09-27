#!/usr/bin/env bash
set -euo pipefail

# Codex does not expose a WorktreeRemove hook event. This script is an explicit
# manual cleanup utility; use Codex's worktree UI for Codex-managed worktrees so
# the app can preserve its recovery snapshot.
usage() {
  cat >&2 <<'USAGE'
Usage: bash .codex/hooks/worktree-remove.sh <worktree-path> [--force]

Remove a registered Git worktree belonging to the current repository.
Dirty worktrees are refused unless --force is provided.
USAGE
  exit 2
}

[[ $# -ge 1 && $# -le 2 ]] || usage
TARGET_INPUT=$1
FORCE=false
if [[ $# -eq 2 ]]; then
  [[ $2 == --force ]] || usage
  FORCE=true
fi

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Error: run this script from inside a Git repository." >&2
  exit 1
}
REPO_ROOT=$(cd "$REPO_ROOT" && pwd -P)

[[ -d $TARGET_INPUT ]] || {
  echo "Error: worktree path does not exist: $TARGET_INPUT" >&2
  exit 1
}
WORKTREE_PATH=$(cd "$TARGET_INPUT" && pwd -P)
[[ $WORKTREE_PATH != "$REPO_ROOT" ]] || {
  echo "Error: refusing to remove the current repository checkout." >&2
  exit 1
}

REGISTERED=false
while IFS= read -r line; do
  case $line in
    'worktree '*)
      registered_path=${line#worktree }
      registered_path=$(cd "$registered_path" 2>/dev/null && pwd -P) || continue
      if [[ $registered_path == "$WORKTREE_PATH" ]]; then
        REGISTERED=true
        break
      fi
      ;;
  esac
done < <(git -C "$REPO_ROOT" worktree list --porcelain)

[[ $REGISTERED == true ]] || {
  echo "Error: path is not a registered worktree of $REPO_ROOT: $WORKTREE_PATH" >&2
  exit 1
}

if [[ $FORCE == true ]]; then
  git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_PATH"
else
  git -C "$REPO_ROOT" worktree remove "$WORKTREE_PATH"
fi
git -C "$REPO_ROOT" worktree prune
printf 'Removed worktree: %s\n' "$WORKTREE_PATH"

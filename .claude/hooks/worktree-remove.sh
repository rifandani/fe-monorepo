#!/usr/bin/env bash
# Claude Code WorktreeRemove hook (pairs with WorktreeCreate).
# https://code.claude.com/docs/en/hooks#worktreeremove
set -euo pipefail

log() { printf '%s\n' "$*" >&2; }

INPUT="$(cat)"
if command -v jq >/dev/null 2>&1; then
  WORKTREE_PATH="$(printf '%s' "$INPUT" | jq -r '.worktree_path // empty')"
else
  WORKTREE_PATH="$(printf '%s' "$INPUT" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{try{console.log(JSON.parse(d).worktree_path||"")}catch{process.exit(1)}}')"
fi

if [[ -z "$WORKTREE_PATH" || "$WORKTREE_PATH" == "null" ]]; then
  log "WorktreeRemove: no worktree_path; nothing to do"
  exit 0
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
# Only remove paths under this repo's .claude/worktrees/
case "$WORKTREE_PATH" in
  "${REPO_ROOT}/.claude/worktrees/"*) ;;
  *)
    log "WorktreeRemove: refusing path outside .claude/worktrees/: $WORKTREE_PATH"
    exit 0
    ;;
esac

if [[ ! -e "$WORKTREE_PATH" ]]; then
  log "WorktreeRemove: already gone: $WORKTREE_PATH"
  exit 0
fi

log "==> Removing worktree $WORKTREE_PATH"
git -C "$REPO_ROOT" worktree remove --force "$WORKTREE_PATH" >&2 || {
  # Fallback if git metadata already detached
  rm -rf "$WORKTREE_PATH"
  git -C "$REPO_ROOT" worktree prune >&2 || true
}

exit 0

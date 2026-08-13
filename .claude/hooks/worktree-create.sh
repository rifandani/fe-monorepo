#!/usr/bin/env bash
# Claude Code WorktreeCreate hook.
# Replaces default `git worktree` creation so we can install deps + sync envs
# (same as Cursor `.cursor/worktrees.json` → setup-worktree-unix.sh).
#
# Contract: JSON on stdin with `.name`; absolute worktree path on stdout only.
# All other output → stderr. Non-zero exit aborts creation.
# https://code.claude.com/docs/en/hooks#worktreecreate
set -euo pipefail

log() { printf '%s\n' "$*" >&2; }

INPUT="$(cat)"
if command -v jq >/dev/null 2>&1; then
  NAME="$(printf '%s' "$INPUT" | jq -r '.name // empty')"
else
  NAME="$(printf '%s' "$INPUT" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{try{console.log(JSON.parse(d).name||"")}catch{process.exit(1)}}')"
fi

if [[ -z "${NAME}" || "${NAME}" == "null" ]]; then
  log "error: WorktreeCreate input missing .name"
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
WORKTREES_DIR="${REPO_ROOT}/.claude/worktrees"
WORKTREE_PATH="${WORKTREES_DIR}/${NAME}"
BRANCH="worktree-${NAME}"
SETUP="${REPO_ROOT}/.cursor/setup-worktree-unix.sh" # claude code only support bash (not powershell)

mkdir -p "$WORKTREES_DIR"

run_setup() {
  if [[ ! -x "$SETUP" && ! -f "$SETUP" ]]; then
    log "error: missing $SETUP"
    exit 1
  fi
  log "==> Running shared worktree setup"
  (
    cd "$WORKTREE_PATH"
    export ROOT_WORKTREE_PATH="$REPO_ROOT"
    bash "$SETUP"
  ) >&2
}

if [[ -e "$WORKTREE_PATH" ]]; then
  log "Reusing existing worktree: $WORKTREE_PATH"
  if [[ ! -d "$WORKTREE_PATH/node_modules" ]]; then
    run_setup
  fi
  printf '%s\n' "$WORKTREE_PATH"
  exit 0
fi

# Match Claude Code "fresh" default: branch from origin/HEAD when available.
BASE_REF="$(git -C "$REPO_ROOT" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)"
log "==> Creating worktree ${NAME} (branch ${BRANCH})"
if [[ -n "$BASE_REF" ]]; then
  git -C "$REPO_ROOT" worktree add -b "$BRANCH" "$WORKTREE_PATH" "$BASE_REF" >&2
else
  git -C "$REPO_ROOT" worktree add -b "$BRANCH" "$WORKTREE_PATH" >&2
fi

run_setup

printf '%s\n' "$WORKTREE_PATH"

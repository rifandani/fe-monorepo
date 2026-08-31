#!/usr/bin/env bash
# Worktree bootstrap for SPA + web + expo + portless (`/wt` skill).
# Runs inside the new worktree. ROOT_WORKTREE_PATH = main checkout.
set -euo pipefail

ROOT="${ROOT_WORKTREE_PATH:?ROOT_WORKTREE_PATH is required}"

# Matches portless.json / `bun spa` / `bun web` (`portless run --name *.fe-monorepo`).
SPA_PORTLESS_NAME="spa.fe-monorepo"
WEB_PORTLESS_NAME="web.fe-monorepo"

echo "==> Installing workspace dependencies"
bun install --frozen-lockfile

sync_app_envs() {
  local app_dir="$1"
  shift
  local files=("$@")
  mkdir -p "$app_dir"

  local copied=0
  local f src
  for f in "${files[@]}"; do
    src="$ROOT/$app_dir/$f"
    if [[ -f "$src" ]]; then
      cp "$src" "$app_dir/$f"
      echo "    copied $app_dir/$f"
      copied=$((copied + 1))
    fi
  done

  local env_name target example
  for env_name in dev prod; do
    target="$app_dir/.env.$env_name"
    example="$app_dir/.env.$env_name.example"
    if [[ ! -f "$target" && -f "$example" ]]; then
      cp "$example" "$target"
      echo "    seeded $app_dir/.env.$env_name from example"
      copied=$((copied + 1))
    fi
  done

  # expo only ships .env.local(.example)
  local local_target="$app_dir/.env.local"
  local local_example="$app_dir/.env.local.example"
  if [[ ! -f "$local_target" && -f "$local_example" ]]; then
    cp "$local_example" "$local_target"
    echo "    seeded $app_dir/.env.local from example"
    copied=$((copied + 1))
  fi

  if [[ "$copied" -eq 0 ]]; then
    echo "    warning: no env files found in $ROOT/$app_dir (copy *.example manually)"
  fi
}

echo "==> Syncing app env files from main checkout"
sync_app_envs apps/spa .env.dev .env.prod .env.local
sync_app_envs apps/web .env.dev .env.prod .env.local
sync_app_envs apps/expo .env.local

echo "==> Checking portless (required for bun spa / bun web)"
if ! command -v portless >/dev/null 2>&1; then
  echo "error: portless not on PATH. Install once on the machine:"
  echo "  npm install -g portless"
  echo "  # or: bun add -g portless"
  exit 1
fi

# `portless run` prefixes linked worktrees: https://<branch>.spa.fe-monorepo.localhost
spa_url="$(portless get "$SPA_PORTLESS_NAME" 2>/dev/null || true)"
if [[ -z "$spa_url" ]]; then
  spa_url="https://${SPA_PORTLESS_NAME}.localhost"
fi
web_url="$(portless get "$WEB_PORTLESS_NAME" 2>/dev/null || true)"
if [[ -z "$web_url" ]]; then
  web_url="https://${WEB_PORTLESS_NAME}.localhost"
fi

echo ""
echo "Worktree setup complete."
echo "  SPA URL:  $spa_url"
echo "  Web URL:  $web_url"
echo "  Start:    bun spa   # or: bun web / bun expo"
echo ""

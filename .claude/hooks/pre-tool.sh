#!/usr/bin/env bash
# Pre-tool hook: block dangerous commands
# Reads tool input from stdin as JSON

set -euo pipefail

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | sed 's/"command":"//;s/"$//' || true)

if [ -z "$COMMAND" ]; then
  exit 0
fi

BLOCKED_PATTERNS=(
  "rm -rf ~"
  "rm -rf /"
  "rm -rf /*"
  "git push --force main"
  "git push --force master"
  "git push --force-with-lease main"
  "git push --force-with-lease master"
  "DROP TABLE"
  "DROP DATABASE"
  "pkill -9"
  "killall -9"
  "chmod -R 777 /"
  ":(){ :|:& };:"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiF "$pattern"; then
    echo "BLOCKED: Command matches dangerous pattern: $pattern" >&2
    exit 2
  fi
done

exit 0

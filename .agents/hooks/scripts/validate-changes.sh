#!/usr/bin/env bash
# Stop: Run validation commands based on files accumulated during this agent session.
# Rules (from AGENTS.md):
#   - Any file changed  → pnpm lint
#   - packages/** changed → pnpm typecheck + pnpm build
#   - docs/**     changed → pnpm typecheck + pnpm docs:build

STATE_FILE="/tmp/.pikacss-session-modified-files"

# No tracked changes — nothing to do
if [[ ! -f "$STATE_FILE" ]] || [[ ! -s "$STATE_FILE" ]]; then
  exit 0
fi

WORKSPACE_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$WORKSPACE_DIR"

# Determine which areas were touched
in_packages=false
in_docs=false

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  # Normalize: strip workspace prefix so paths are relative
  stripped="${file#"$WORKSPACE_DIR/"}"
  [[ "$stripped" == packages/* ]] && in_packages=true
  [[ "$stripped" == docs/* ]]     && in_docs=true
done < "$STATE_FILE"

# Clear state file before running (avoid re-triggering on next Stop)
rm -f "$STATE_FILE"

errors=""
did_typecheck=false

# Always run lint
echo "==> pnpm lint" >&2
if ! lint_out=$(pnpm lint 2>&1); then
  errors+="[pnpm lint FAILED]
${lint_out}

"
fi

# packages/ validation
if [[ "$in_packages" == true ]]; then
  echo "==> pnpm typecheck" >&2
  if ! tc_out=$(pnpm typecheck 2>&1); then
    errors+="[pnpm typecheck FAILED]
${tc_out}

"
  fi
  did_typecheck=true

  echo "==> pnpm build" >&2
  if ! build_out=$(pnpm build 2>&1); then
    errors+="[pnpm build FAILED]
${build_out}

"
  fi
fi

# docs/ validation
if [[ "$in_docs" == true ]]; then
  if [[ "$did_typecheck" == false ]]; then
    echo "==> pnpm typecheck" >&2
    if ! tc_out=$(pnpm typecheck 2>&1); then
      errors+="[pnpm typecheck FAILED]
${tc_out}

"
    fi
  fi

  echo "==> pnpm docs:build" >&2
  if ! docs_out=$(pnpm docs:build 2>&1); then
    errors+="[pnpm docs:build FAILED]
${docs_out}

"
  fi
fi

if [[ -n "$errors" ]]; then
  msg="Validation failed for recent changes. Fix these issues before finishing:

${errors}"
  json_msg=$(printf '%s' "$msg" | python3 -c 'import sys, json; print(json.dumps(sys.stdin.read()))')
  printf '{"continue": true, "systemMessage": %s}\n' "$json_msg"
  exit 2
fi

exit 0

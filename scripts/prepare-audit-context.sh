#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
AUDIT_DIR="${REPO_ROOT}/.audit"

usage() {
  cat <<'EOF'
Usage: ./scripts/prepare-audit-context.sh <sourceCode|tests|documentation|documentationTranslation>
EOF
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

PHASE="$1"
COMMON_IGNORE="**/node_modules/**,docs/.vitepress/**,docs/**/*.svg,docs/public/**,docs/.examples/**,**/dist/**,**/coverage/**,packages/core/src/csstype.ts"
BASE_ARGS=(
  --style plain
  --compress
  --remove-empty-lines
  --top-files-len 10
  --no-security-check
)

case "${PHASE}" in
  sourceCode)
    OUTPUT_PATH="${AUDIT_DIR}/source-code-context.txt"
    INCLUDE_PATTERNS="packages/*/src/**/*.ts"
    IGNORE_PATTERNS="${COMMON_IGNORE},**/*.test.ts,**/*.spec.ts,packages/*/tests/**/*,docs/**/*,demo/**/*"
    ;;
  tests)
    OUTPUT_PATH="${AUDIT_DIR}/tests-context.txt"
    INCLUDE_PATTERNS="packages/*/tests/**/*,packages/*/src/**/*.test.ts,packages/*/src/**/*.spec.ts"
    IGNORE_PATTERNS="${COMMON_IGNORE},docs/**,demo/**"
    ;;
  documentation)
    OUTPUT_PATH="${AUDIT_DIR}/documentation-context.txt"
    INCLUDE_PATTERNS="docs/**/*.md"
    IGNORE_PATTERNS="${COMMON_IGNORE},docs/zh-TW/**/*"
    ;;
  documentationTranslation)
    OUTPUT_PATH="${AUDIT_DIR}/documentation-translation-context.txt"
    INCLUDE_PATTERNS="docs/zh-TW/**/*.md"
    IGNORE_PATTERNS="${COMMON_IGNORE}"
    ;;
  *)
    usage
    exit 1
    ;;
esac

mkdir -p "${AUDIT_DIR}"

run_repomix() {
  local temp_dir

  temp_dir="$(mktemp -d)"
  trap 'rm -rf "${temp_dir}"' RETURN

  cd "${temp_dir}"

  if [[ -x "${REPO_ROOT}/node_modules/.bin/repomix" ]]; then
    "${REPO_ROOT}/node_modules/.bin/repomix" "${REPO_ROOT}" "${BASE_ARGS[@]}" "$@"
  else
    pnpm dlx repomix "${REPO_ROOT}" "${BASE_ARGS[@]}" "$@"
  fi
}

run_repomix \
  --output "${OUTPUT_PATH}" \
  --ignore "${IGNORE_PATTERNS}" \
  --include "${INCLUDE_PATTERNS}"

printf '%s\n' "${OUTPUT_PATH}"
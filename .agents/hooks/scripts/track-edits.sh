#!/usr/bin/env bash
# PostToolUse: Append file paths modified by agent editing tools to session state file.
# Runs after every tool call; exits early if the tool is not a file-editing one.

STATE_FILE="/tmp/.pikacss-session-modified-files"

input=$(cat)

tool_name=$(printf '%s' "$input" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_name', ''))
except Exception:
    print('')
" 2>/dev/null)

case "$tool_name" in
  replace_string_in_file | create_file | edit_notebook_file)
    file_path=$(printf '%s' "$input" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('filePath', ''))
except Exception:
    print('')
" 2>/dev/null)
    if [[ -n "$file_path" ]]; then
      echo "$file_path" >> "$STATE_FILE"
    fi
    ;;
  multi_replace_string_in_file)
    printf '%s' "$input" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    for r in d.get('tool_input', {}).get('replacements', []):
        fp = r.get('filePath', '')
        if fp:
            print(fp)
except Exception:
    pass
" 2>/dev/null >> "$STATE_FILE"
    ;;
esac

exit 0

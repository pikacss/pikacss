---
description: "Multi-round analysis and refactoring of uncommitted changes in the PikaCSS monorepo — dispatches parallel subagents for deep analysis, issue triage, and incremental refactoring"
agent: "agent"
argument-hint: "Optional focus area or constraint (e.g., 'performance only', 'core package', 'keep public API stable')"
---

You are performing multi-round analysis and refactoring of uncommitted changes in the PikaCSS monorepo.
Refer to [AGENTS.md](../../AGENTS.md) for project conventions, package structure, and code style requirements.

Constraints that must be followed throughout this entire session:
- **Maximize subagent usage**: Every analysis task, every per-file inspection, every per-package work unit MUST be dispatched via `runSubagent`. Never read multiple files or perform analysis inline when it can be delegated.
- **Parallel dispatch**: Independent subagents must be launched in parallel, not sequentially.
- **No scope creep**: Only refactor code touched by uncommitted changes. Do not rewrite unrelated files.
- If the user provided `$input`, treat it as an explicit constraint (e.g., scope, type of refactoring, or API stability requirement).

---

## Round 0 — Snapshot Uncommitted Changes

Use #runSubagent to snapshot the current working-tree state (read-only):

> **Subagent Task — Snapshot**
>
> Working directory: `/Users/deviltea/Documents/Programming/pikacss`
>
> 1. Run `git status --short` to list all changed files
> 2. Run `git diff HEAD` (staged + unstaged combined) to get the full unified diff
> 3. For each changed file identified, report:
>    - **file**: Relative path
>    - **package**: Owning package (e.g., `core`, `integration`, `plugin-icons`)
>    - **change type**: `modified` | `added` | `deleted` | `renamed`
>    - **diff summary**: Brief description of what was added, removed, or changed (3–5 lines max per file)
>
> Return the complete snapshot as structured text. Do NOT modify any files.

After receiving the snapshot, build a `manage_todo_list` plan for the rounds below, then present the full file list to the user and ask: **"Does this look correct? Any files to exclude or any specific refactoring constraints?"** Wait for confirmation before proceeding.

---

## Round 1 — Deep Per-File Analysis

Dispatch one #runSubagent per changed file (run all in parallel):

> **Subagent Task — Analyse `<file>`**
>
> File: `<file>` (in `/Users/deviltea/Documents/Programming/pikacss`)
>
> 1. Read the full content of `<file>`
> 2. Read the diff for this file from Round 0 snapshot
> 3. Analyse the change with respect to PikaCSS conventions (from `AGENTS.md`):
>    - TypeScript strict-mode compliance (no implicit `any`, correct return types)
>    - ES Modules usage (no `require`, no `default` exports where `named` is preferred)
>    - Logic correctness: edge cases, off-by-one, missing null/undefined guards at **system boundaries only**
>    - Naming consistency with neighbouring code
>    - Complexity: unnecessarily complex constructs that could be simplified
>    - Duplication: code that already exists in a shared utility
>    - Security: OWASP Top 10 issues (injection, broken access control, etc.)
>    - Test coverage: does the change have a co-located `*.test.ts`?
> 4. Produce an **issue list** for this file, each entry containing:
>    - `severity`: `critical` | `major` | `minor` | `nit`
>    - `category`: one of the categories above
>    - `location`: line range or function name
>    - `description`: concise description of the issue
>    - `suggestion`: concrete fix (code snippet preferred)
>
> Return the issue list. Do NOT modify any files.

Collect all per-file issue lists. Summarize them grouped by **severity**, then by **package**. Present to the user. Ask: **"Should I proceed with automatic fixes? Any issues to skip?"** Wait for confirmation.

---

## Round 2 — Automated Fixes

Based on confirmed issues from Round 1, group them by file and dispatch one #runSubagent per file that has at least one `critical` or `major` issue (run all in parallel):

> **Subagent Task — Fix `<file>`**
>
> File: `<file>` (in `/Users/deviltea/Documents/Programming/pikacss`)
>
> Issues to fix (from Round 1 analysis):
> ```
> <issue list for this file>
> ```
>
> User constraints: `$input` (if provided)
>
> 1. Read the current content of `<file>`
> 2. Apply fixes for ALL listed issues in a single pass using `multi_replace_string_in_file`
>    - Apply `critical` issues first, then `major`
>    - For each fix, include at least 3 lines of unchanged context before and after
>    - Do NOT restructure code beyond what is required to fix the listed issues
>    - Do NOT rename symbols unless the issue explicitly requires it
>    - Do NOT add comments unless logic becomes non-obvious after the fix
> 3. After applying fixes, re-read the file and verify each fix was applied correctly
>
> Return a summary of applied fixes (issue ID → applied change description). Do NOT run tests.

After all fix subagents complete, compile the full list of applied changes and present it.

---

## Round 3 — Consistency & Cross-File Sweep

Dispatch one #runSubagent per affected **package** (run all in parallel):

> **Subagent Task — Cross-file consistency sweep for `<package>`**
>
> Package: `<package>` in `/Users/deviltea/Documents/Programming/pikacss/packages/<package>/src`
>
> Changed files in this package: `<list of changed files>`
>
> 1. For each changed file, check whether its public API surface (exported types, function signatures) is consistent with:
>    - Its co-located `*.test.ts` (test imports must still resolve)
>    - `src/index.ts` (re-exported symbols must still match)
>    - Any sibling files that import from it (run a grep for the module path)
> 2. Identify any **consistency issues** introduced by the Round 2 fixes:
>    - Broken imports
>    - Stale type assertions in tests
>    - Mismatched exports
> 3. Apply corrective edits using `multi_replace_string_in_file` to resolve consistency issues
> 4. Run `pnpm vitest run --project <package>` and confirm all tests pass
>    - If tests fail, read the failure, apply targeted fixes, and re-run once
>    - If tests still fail after one retry, report the failure and do NOT apply further changes
>
> Return:
> - List of consistency fixes applied
> - Test result: `passed` | `failed (see details)`

After all sweep subagents complete, collect test results. If any package reports `failed`, display the failure details and ask the user how to proceed before continuing.

---

## Round 4 — `minor` & `nit` Issues (Optional)

Ask the user: **"Round 1 also found minor/nit issues. Would you like me to address them now?"**

If the user confirms, dispatch one #runSubagent per file with minor/nit issues (run all in parallel):

> **Subagent Task — Minor fixes for `<file>`**
>
> File: `<file>`
>
> Minor/nit issues: `<issue list>`
>
> Apply only style, naming, and clarity improvements as listed. Do not change logic.
> Use `multi_replace_string_in_file`. Re-read file after applying to verify correctness.
>
> Return: list of applied nit fixes.

---

## Round 5 — Final Verification

After all previous rounds complete:

1. Use #runSubagent to run a final type-check and test pass:

> **Subagent Task — Final verification**
>
> 1. Run `pnpm typecheck` and capture output
> 2. Run `pnpm test` and capture output
> 3. Run `git diff --stat HEAD` to confirm only expected files were modified
> 4. Return:
>    - typecheck result: `passed` | `failed (errors: <N>)`
>    - test result: `passed` | `failed (failures: <N>)`
>    - changed file count (must match Round 0 snapshot ± files that needed consistency fixes)

2. Present the final verification report.
3. If everything passes, summarize all changes made across all rounds (grouped by file).
4. If anything fails, list what requires manual attention and stop — do NOT attempt further automated fixes.

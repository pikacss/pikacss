---
description: "Full audit: detect and fix every misalignment between docs, tests, and source code (PikaCSS monorepo)"
agent: "agent"
argument-hint: "Optionally scope to a package or area (e.g., 'core', 'plugin-icons'), leave blank for full audit"
---

You are the **Alignment Orchestrator** for the PikaCSS monorepo. Your sole responsibility is to ensure that `docs/` and co-located `*.test.ts` files are perfectly synchronized with the source of truth in `packages/*/src/`.

Refer to [AGENTS.md](../../AGENTS.md) for full project conventions before proceeding.

**Scope**: `$input` (full audit if blank)

> **CRITICAL — Delegation Rule**: The Orchestrator **must not** perform any analysis, file editing, or test execution directly. Every unit of work (analysis, fix, validation) **must** be delegated to a #runSubagent call. The Orchestrator's only permitted actions are: dispatching subagents, persisting task files, updating the todo list, and presenting the final report.

---

## Phase 1 — Refresh Context & Audit

### 1.1 — Refresh repomix snapshot

Dispatch a #runSubagent to run the following command **from the repository root** (`/Users/deviltea/Documents/Programming/pikacss`) to regenerate `docs/public/repomix.txt`:

```sh
cd /Users/deviltea/Documents/Programming/pikacss && pnpm exec repomix
```

Wait for the subagent to confirm success before proceeding.

> The snapshot covers `packages/*/src/**/*` (including `*.test.ts`) and `docs/**/*.md`. The `docs/zh-TW/` mirror and `docs/.examples/` are intentionally **excluded** from repomix — read those files directly when needed.

### 1.2 — Detect existing tasks

Before running the Analyzer, check if `.planning/subagent_tasks/` already contains `*.task.md` files from a previous interrupted run. If so, **skip to Phase 2** and resume from those tasks.

### 1.3 — Dispatch Analyzer subagent

Dispatch a #runSubagent with the following instructions:

> **Subagent Task — Analyzer** (read-only, no file modifications)
>
> **Constraint**: Read **only** `docs/public/repomix.txt`. Do **not** open any other file. All analysis must be derived exclusively from the repomix snapshot.
>
> 1. Read `docs/public/repomix.txt` **in a single read operation** — load the entire file at once. Do **not** split it into multiple reads.
> 2. If a scope was provided (`$input`), focus analysis on that package or area; otherwise audit the full repo.
> 3. Reason in one pass over the complete snapshot. Identify every alignment gap solely from what is present (or absent) in the snapshot. There are two kinds of gaps:
>    - **Existence gap**: `src/` has a public API, module, or feature but the corresponding `docs/` page or `*.test.ts` file **does not exist at all**.
>    - **Correctness gap**: The corresponding file exists but its content **contradicts or is incomplete** relative to what `src/` currently implements.
>
> **Gap categories to scan for:**
>
> | Category | Description |
> |---|---|
> | `missing-test` | `src/` has a public API, behavior, or edge case with **no corresponding `*.test.ts` file or no test coverage** for it |
> | `outdated-test` | A `*.test.ts` exists but its assertions contradict current `src/` (wrong signatures, removed options, changed behavior) |
> | `missing-docs` | `src/` has a function, config option, or behavior with **no corresponding `docs/` page or section** covering it |
> | `outdated-docs` | A `docs/` page exists but a description, API signature, table row, or code example no longer matches `src/` |
>
> **For each gap, output a block in exactly this format (one block per gap):**
>
> ```plaintext
> --- TASK START ---
> ID: task-001
> TITLE: <concise description of the gap>
> TYPE: missing-test | outdated-test | missing-docs | outdated-docs
> SRC FILES: <relative path(s) from repo root, comma-separated>
> TARGET FILES: <relative path(s) to the test or doc file(s) that need creating or updating; use "<new file path>" if it does not exist yet>
> MISMATCH:
>   What src does: <exact behavior, signature, or option>
>   What target says: <what is currently written, or "file does not exist" if absent>
> REQUIREMENTS:
>   <specific, actionable instructions — e.g., "Create packages/core/src/foo.test.ts with tests for X", or "Add section for resolveXxx to docs/guide/configuration.md">
> CODE SNIPPET:
>   <the verbatim src code that the test/doc must conform to>
> --- TASK END ---
> ```
>
> Output **only** task blocks — no introductory text, no summaries. If no gaps exist, output `NO GAPS FOUND`.

### 1.4 — Persist tasks

For each task block returned from the Analyzer:

1. Create `.planning/subagent_tasks/<task-id>.task.md` with the full task content.
2. Register every task in the `manage_todo_list` tool (status: `not-started`).

If the Analyzer returned `NO GAPS FOUND`, skip to Phase 3.

---

## Phase 2 — Execute Fixes

Process tasks in parallel batches of up to **3 at a time**.

For each batch:

1. Mark the selected tasks as `in-progress` in the todo list.
2. Dispatch one #runSubagent per task with these instructions:

> **Subagent Task — Executor**
>
> 1. Read your task file: `.planning/subagent_tasks/<task-id>.task.md`.
> 2. Read [AGENTS.md](../../AGENTS.md) — pay special attention to the *Testing Conventions* and *Documentation Conventions* sections.
>
> **For `missing-test`:**
>
> - The test file may not exist yet — create it at the co-located path: `packages/<pkg>/src/foo.ts` → `packages/<pkg>/src/foo.test.ts`
> - Use `describe` / `it` / `expect` from `vitest`; cover the public API, happy paths, and relevant edge cases
> - After all edits, run `pnpm vitest run --project <package>` and confirm all tests pass
>
> **For `outdated-test`:**
>
> - Update existing assertions to align with current `src/` behavior
> - Do **not** delete passing tests unrelated to this task
> - After all edits, run `pnpm vitest run --project <package>` and confirm all tests pass
>
> **For `missing-docs`:**
>
> - The docs page may not exist yet — create it at the path specified in `TARGET FILES`, following the VitePress document structure in [AGENTS.md](../../AGENTS.md)
> - All code examples **must** live in `docs/.examples/<category>/` and be referenced via `<<< @/.examples/<category>/<file>` — never embed code directly in `.md` files
> - New pages must include: H1 title, brief introduction, usage example, and a `## Next` section
> - If a corresponding `docs/zh-TW/<path>.md` should exist, create it too with an equivalent Traditional Chinese version
>
> **For `outdated-docs`:**
>
> - Update the target `.md` page in `docs/`
> - All code examples **must** live in `docs/.examples/<category>/` and be referenced via `<<< @/.examples/<category>/<file>` — never embed code directly in `.md` files
> - Preserve VitePress containers (`::: tip`, `::: warning`, etc.) and the `## Next` section
> - If the corresponding `docs/zh-TW/<path>.md` exists, apply an equivalent update to it
>
> **After completing the task:**
>
> 1. Append the following section to your `.task.md` file:
>
>    ```markdown
>    ## Result
>
>    - Status: ✅ Done | ❌ Failed
>    - Files Modified: <list>
>    - Verification: <e.g. "pnpm vitest run --project core: all passed", "typecheck: clean">
>    - Notes: <any caveats or follow-up needed>
>    ```
>
> 2. Report back to the orchestrator with **only**: `Done: <task-id>` or `Failed: <task-id> — <one-line reason>`.

3. After each batch completes:
   - Mark successful tasks as `completed` in the todo list.
   - Re-queue failed tasks as `not-started` for retry; if a task fails twice, leave it flagged and move on.

---

## Phase 3 — Validate & Report

### 3.1 — Re-verification

Repeat Phase 1.1 and 1.3 by dispatching the same repomix-refresh subagent followed by a fresh Analyzer subagent (full pass). If new task blocks are returned, create task files and return to Phase 2.

### 3.2 — Final report

Once the Analyzer returns `NO GAPS FOUND`:

1. Read `.planning/subagent_tasks/*.task.md` (each contains a `## Result` section).
2. Dispatch a #runSubagent to run the full test suite from the repo root and confirm nothing regressed:

   ```sh
   cd /Users/deviltea/Documents/Programming/pikacss && pnpm test
   ```

3. Present the following report:

   ````markdown
   # Alignment Report

   ## Summary
   - Tasks completed: N
   - Tasks failed: N
   - Test files updated: (list)
   - Doc pages updated: (list)

   ## Changes Made

   ### Tests
   - ...

   ### Documentation
   - ...

   ## Verification
   - [ ] All tests passing (`pnpm test`)
   - [ ] No TypeScript errors (`pnpm typecheck`)
   - [ ] No lint errors (`pnpm lint`)
   ````

4. Ask the user if they want to clean up `.planning/subagent_tasks/`.

---

## Operational Rules

| Rule | Detail |
|---|---|
| **Source of truth** | `packages/*/src/` is authoritative. Tests and docs must conform to it, never the reverse. |
| **No fabrication** | Only fix real, evidence-based gaps found in repomix. Never invent APIs or behaviors. |
| **zh-TW scope** | Only update `docs/zh-TW/` pages that already exist; do not create new zh-TW pages. |
| **Examples directory** | `docs/.examples/` is excluded from repomix — read those files directly with file tools when needed. |
| **Language** | All task files, result sections, and reports must be written in English. |
| **Token efficiency** | Executor subagents return only a status code; all technical details stay in `.task.md` files. |

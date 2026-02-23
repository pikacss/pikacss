---
description: "After updating source code, inventory changes and synchronize corresponding tests and documentation (PikaCSS monorepo)"
agent: "agent"
argument-hint: "Describe the changed package or feature (e.g., 'core engine resolver'), leave blank for auto-detection"
---

You are maintaining the PikaCSS monorepo. Refer to [AGENTS.md](../../AGENTS.md) to understand project conventions.

---

## Step 1 — Inventory Changes

Use #runSubagent to execute the following analysis task (read-only, no modifications):

> **Subagent Task**: Analyze the latest changes in the PikaCSS monorepo at `/Users/deviltea/Documents/Programming/pikacss`.
>
> 1. Read `.github/.sync-state.json` to get the `lastSyncCommit` value
> 2. Run `git diff --name-only <lastSyncCommit>..HEAD` to get files changed since last sync (or `git diff --name-only HEAD` if `lastSyncCommit` is empty)
> 3. Read each modified file
> 2. If the user provided a description input (`$input`), focus the scope around that description
> 3. For each changed file, report:
>    - **package**: The owning package (`core` / `integration` / `unplugin` / `plugin-*`, etc.)
>    - **changed file**: Complete relative path
>    - **change summary**: Behavior and public API additions / modifications / removals
>    - **affected test file**: Co-located `*.test.ts` file (`src/foo.ts` → `src/foo.test.ts`)
>    - **affected docs**: Pages in `docs/` that are affected (including `docs/zh-TW/` mirror pages)
>
> Return results as a structured list in the following format:
>
> ```
> Package: core
> Changed: packages/core/src/internal/engine.ts
> Summary: Added resolveXxx function, modified createEngine return type
> Test file: packages/core/src/internal/engine.test.ts
> Docs: docs/guide/configuration.md, docs/zh-TW/guide/configuration.md
> ```

After receiving the inventory results, confirm the scope with the user before proceeding to the next steps.

---

## Step 2 — Update Tests (one subagent per affected package, run in parallel)

Based on the inventory results from Step 1, dispatch one #runSubagent for **each affected package** and run in parallel:

> **Subagent Task (per `<package>`):**
>
> 1. Read the modified source file: `<changed file>`
> 2. Read the corresponding test file: `<affected test file>` (create new if it doesn't exist)
> 3. Reference existing test conventions (e.g., [packages/core/src/internal/engine.test.ts](../../packages/core/src/internal/engine.test.ts))
> 4. Based on `<change summary>`, execute:
>    - New API → Add corresponding `describe` / `it` test cases, including happy path and edge cases
>    - Modified behavior → Update existing test assertions to ensure semantics align with new behavior
>    - Removed API → Remove corresponding tests (only if behavior is **intentionally removed**)
> 5. After applying all changes, run `pnpm vitest run --project <package>` to confirm all tests pass
>
> Notes:
> - Use `describe` / `it` / `expect` from `vitest`
> - Do not delete existing tests that are still passing

---

## Step 3 — Update Documentation (one subagent per affected doc page, run in parallel)

Based on the inventory results from Step 1, dispatch one #runSubagent for **each affected documentation page** and run in parallel:

> **Subagent Task (per `<doc page>`):**
>
> 1. Read the target documentation page: `docs/<path>.md`
> 2. Read the Documentation Conventions section in `AGENTS.md` to confirm VitePress guidelines
> 3. Based on `<change summary>`, execute:
>    - Update API descriptions, configuration option tables, example descriptions
>    - If code examples need updates: First update example files in `docs/.examples/<category>/<file>`, then ensure the `<<<` reference paths are correct
>    - **Do not** directly embed code snippets in `.md` files (must use `<<<` to reference `.examples/`)
> 4. If the corresponding `docs/zh-TW/<path>.md` exists, synchronize the Traditional Chinese version
>
> Notes:
> - Preserve VitePress containers (`::: tip` / `::: warning`, etc.)
> - Must keep the `## Next` navigation section at the end
> - All identifiers and package names must be wrapped in backticks

---

## Step 4 — Final Verification

After all subagents complete:

1. Run `pnpm vitest run --project <affected packages>` to confirm all tests pass
2. If there are public type changes, run `pnpm typecheck`
3. Get the current HEAD commit hash: `git rev-parse HEAD`
4. Update `.github/.sync-state.json` with:
   - `lastSyncCommit`: The commit hash from step 3
   - `lastSyncTimestamp`: Current timestamp (ISO 8601 format)
5. Summary report:
   - Which tests were updated (list of new / modified `it(...)`)
   - Which documentation pages were updated
   - Any items requiring manual review

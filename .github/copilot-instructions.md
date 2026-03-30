# Copilot Instructions — PikaCSS

Read `AGENTS.md` for repository routing, workflow boundaries, and validation policy.

## Core Rules

- Prefer minimal, targeted changes over broad refactors.
- Use package-scoped validation during development unless the task truly needs repository-wide confidence.
- Rebuild upstream packages before validating downstream consumers when behavior crosses package boundaries.
- Update tests, docs, and public-export JSDoc when public behavior or contracts change.
- Keep code, comments, prompts, templates, and default docs content in English.
- Keep the conversation language aligned with the user's chosen language and locale.
- Ask follow-up questions instead of guessing when ambiguity affects architecture, scope, safety, or acceptance criteria.

## File Safety

- Do not edit generated outputs in `dist/` or `coverage/`.
- Do not manually edit generated `pika.gen.*` files.
- Do not manually write or edit generated API reference pages (`docs/api/*.md` except `index.md`). Use `gen-api-docs` to regenerate them.
- Do not modify `docs/.examples/_utils/pika-example.ts`. It uses the integration-layer pipeline and must not be replaced with direct engine calls.
- Do not import from `@pikacss/core` in `.pikain.ts` example files. They must use bare `pika()` calls like real user code.
- In `tests`, `docs`, and `src` directories, do not reference absolute file system paths.

## Validation

- Run the smallest credible validation for the changed area before handoff.
- Avoid workspace-wide `pnpm build` during iterative development.

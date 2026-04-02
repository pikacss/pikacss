# AGENTS.md — PikaCSS

PikaCSS is an instant on-demand atomic CSS-in-JS engine. This file is the canonical always-on instruction source for agents working in the repository.

Keep repository-wide rules here. The workspace-level [.github/copilot-instructions.md](.github/copilot-instructions.md) file exists only as a thin compatibility forwarder for tools that expect that fixed path.

## Control Plane

Use this file as the repository-level control plane for Copilot customization.

- Keep always-on repository rules, routing guidance, and cross-skill boundaries here.
- Keep workflow-specific detail inside the relevant skill.
- Keep review-only criteria inside dedicated review agents.
- Treat prompt-adjacent runtime packages as reusable primitives, not as the identity of a skill.

## Repo Facts

| | |
|---|---|
| Language | TypeScript (strict, ES modules) |
| Package manager | pnpm 10.x |
| Build | tsdown (ESM + CJS + DTS) |
| Test | Vitest v4+ with `@vitest/coverage-v8` |
| Lint | ESLint via `@deviltea/eslint-config` |
| Docs | VitePress (`docs/`) |

## Setup And Commands

Requires Node.js >= 20 and pnpm 10.x.

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm --filter @pikacss/<package> test
pnpm --filter @pikacss/<package> typecheck
pnpm --filter @pikacss/<package> build
pnpm --filter @pikacss/docs typecheck
pnpm docs:dev
pnpm newpkg
pnpm newplugin
pnpm maintain-docs:analyze
pnpm maintain-docs:gen-api
pnpm maintain-jsdocs:scaffold --packages <name>...
pnpm maintain-jsdocs:lint [--packages <name>...]
```

Use package-scoped commands during iterative development. Root-level `vitest --project` filtering is not the canonical package validation path in this repo.

## Package Graph

```plaintext
core  (no internal deps)
  └── integration
        └── unplugin
              └── nuxt

plugin-*  →  depend on core
```

Each package uses `src/index.ts` as the entry point, keeps tests co-located with source files, and carries local `tsconfig`, `tsdown`, and `vitest` config files.

## Request Routing

- Repository orientation, contributor setup, scaffolding, package graph, and PR readiness: handle directly from this file. Do not rely on a separate `contribute` skill.
- Docs pages, READMEs, API reference drift, docs examples, or zh-TW sync: use the `maintain-docs` skill directly from the main agent, then hand completed work to `maintain-docs-review`.
- Exported-surface JSDoc maintenance: use the `maintain-jsdocs` workflow skill. It runs a streamlined scan-fill-apply-validate flow without intermediate templates or multi-agent review rounds.
- Unit or integration test creation, refinement, coverage work, or downstream validation: use the `maintain-tests` skill directly from the main agent, then hand completed work to `maintain-tests-review`.
- Consumer installation, application configuration, troubleshooting, examples for using PikaCSS in a project, and authoring or modifying plugin implementation, hook usage, config augmentation, and plugin tests: use the `pikacss-use` domain skill directly from the main agent. It does not have a dedicated paired custom agent.

## Composition Rules

- Choose one primary skill or workflow for a request.
- Add a secondary skill only when the task genuinely spans two domains.
- Use the single `pikacss-use` skill for both consuming and authoring plugins.
- Treat `maintain-jsdocs` as a workflow skill with an implementation agent. The review agent is optional and not part of the default flow.
- Treat `maintain-docs` and `maintain-tests` as main-agent execution skills that keep paired review agents only.
- Use `pikacss-use` as skill-only domain guidance in the main conversation unless a dedicated agent is added later.
- After heavy workflow changes, hand off to the matching review agent instead of embedding review policy into implementation steps.
- If a paired implementation agent exists for the selected workflow, use it for execution and reserve the review agent for findings.

## Review And Agent Boundaries

- `maintain-docs` is executed directly by the main agent. `maintain-docs-review` reviews docs work after implementation stabilizes.
- `maintain-jsdocs` is the implementation agent for the scan-fill-apply-validate JSDoc workflow.
- `maintain-jsdocs-review` is an optional quality reviewer, not part of the default workflow. Use only when explicitly requested.
- `maintain-tests` is executed directly by the main agent. `maintain-tests-review` reviews test changes after implementation stabilizes.
- `pikacss-use` is a skill-only domain guide covering both consumer usage and plugin authoring. It has no paired `.agent.md` file at this time.

## Global Rules

- Prefer minimal, targeted changes over broad refactors.
- Use package-scoped validation during development. Do not default to workspace-wide commands unless the task requires repo-wide verification.
- If a task changes an upstream package, rebuild that upstream package before validating downstream consumers.
- Run the smallest credible validation for the changed area before handoff. Update tests and docs when behavior or public API changes.
- Maintain JSDoc on public exports when public API behavior or signatures change.
- Use `defineEnginePlugin`, `defineEngineConfig`, and related identity helpers when they provide the canonical project pattern.
- Keep all code, comments, default docs content, prompts, and templates in English.
- Keep the conversation language aligned with the user's chosen language and locale.
- Ask follow-up questions instead of guessing when ambiguity affects architecture, scope, safety, or acceptance criteria.
- In `tests`, `docs`, and `src` directories, do not reference absolute file system paths.

## Final Validation

- During iterative work, validate only the touched package or docs workspace.
- Before suggesting a contribution is ready for handoff, run the smallest credible final gate for the affected area.
- Use repository-wide `pnpm lint`, `pnpm test`, and `pnpm typecheck` only when the task truly warrants a repo-wide confidence pass.

## Forbidden Actions

- Do not edit generated outputs in `dist/` or `coverage/`.
- Do not manually edit generated `pika.gen.*` files.
- Do not manually write or edit generated API reference pages (`docs/api/*.md` except `index.md`). Always use `gen-api-docs` to regenerate them from source.
- Do not modify `docs/.examples/_utils/pika-example.ts`. It uses `createCtx` from `@pikacss/integration` to simulate the real build pipeline. Replacing it with `createEngine`/`engine.use()` bypasses the transform/extract flow and breaks all examples.
- Do not import from `@pikacss/core` in `.pikain.ts` files. Pikain files must use bare `pika()` calls exactly as real users write them.
- Do not run workspace-wide `pnpm build` during iterative development.
- Do not guess through unclear requirements when a short follow-up question would remove risk.

# AGENTS.md — PikaCSS

PikaCSS is an instant on-demand Atomic CSS-in-JS engine. Monorepo managed with pnpm workspaces.

| | |
|---|---|
| Language | TypeScript (strict, ES modules) |
| Package manager | pnpm 10.x |
| Build | tsdown (ESM + CJS + DTS) |
| Test | Vitest v4+ with `@vitest/coverage-v8` |
| Lint | ESLint via `@deviltea/eslint-config` |
| Docs | VitePress (`docs/`) |

## Commands

```bash
pnpm install                           # install all dependencies
pnpm vitest run --project <name>       # test a single package (preferred)
pnpm test                              # run all tests
pnpm typecheck                         # type-check all packages
pnpm lint                              # ESLint auto-fix
pnpm newpkg                            # scaffold a new package
pnpm newplugin                         # scaffold a new plugin
pnpm docs:dev                          # VitePress dev server
```

## Development Workflow

**IMPORTANT: Never run `pnpm build` during iterative development.** Use `pnpm vitest run --project <name>` and `pnpm typecheck` instead.

**IMPORTANT: After modifying `core`, ALWAYS verify ALL downstream packages:**

```bash
pnpm vitest run --project integration
pnpm vitest run --project unplugin
# also run plugin packages if they are affected
```

Pre-commit: `lint-staged` auto-runs ESLint on staged files via `simple-git-hooks`. Always run `pnpm lint` and `pnpm test` before committing.

## Package Dependency Graph

```plaintext
core  (no internal deps)
  └── integration
        └── unplugin
              └── nuxt

plugin-icons, plugin-reset, plugin-typography  →  depend on core
```

Each package: `src/index.ts` entry · co-located tests (`src/foo.ts` → `src/foo.test.ts`) · `tsconfig.json` + `tsdown.config.ts` + `vitest.config.ts`.

## Code Conventions

- ES modules only — never `require()`
- TypeScript strict — no `any` unless unavoidable
- Named exports preferred over default exports
- Use `defineConfig` / `defineProject` helpers for config files
- No comments or docstrings added to unchanged code
- All content (code, comments, default docs, commits) in **English**
- Conversation language should remain consistent with the user's choice, including specific variants (e.g. Simplified Chinese vs. Traditional Chinese (Taiwan))
- When in doubt or anything feels unclear, ask questions instead of guessing; use the ask‑questions mechanism to get my input.
- In `tests`, `docs`, and `src` directories, do **not** reference absolute file system paths.

## Key APIs

Non-obvious patterns specific to this codebase:

| API | Purpose |
|-----|---------|
| `defineEnginePlugin()` | Create engine plugins |
| `defineEngineConfig()` | Engine configuration |
| `defineStyleDefinition()` | Type-safe style objects |
| `createCtx()` | Build integration context |
| `unpluginFactory` | Build tool plugin factory |

Config auto-detected as: `pika.config.{js,ts,mjs,mts,cjs,cts}`

## Forbidden Actions

- Do NOT edit files in `dist/` or `coverage/` — generated, never edited manually
- Do NOT run `pnpm build` during development — use `vitest run` + `typecheck`
- Do NOT write code inline in docs markdown — use VitePress `<<<` snippet imports from `docs/.examples/`

## Documentation

Docs live in `docs/` (VitePress). All code examples must be stored in `docs/.examples/` and imported with `<<<` syntax — never inline code in markdown.

For full documentation authoring conventions, see `.github/instructions/documentation.instructions.md`.
For zh-TW localized markdown pages, also follow `.github/instructions/translation.instructions.md`.
For zh-TW localized example files under `docs/.examples/zh-TW/`, also follow `.github/instructions/translation-examples.instructions.md`.

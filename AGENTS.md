# AGENTS.md — PikaCSS

## Project Overview

PikaCSS is an **instant on-demand Atomic CSS-in-JS engine**. Developers write styles using CSS-in-JS APIs with full TypeScript autocomplete, and the engine outputs optimized atomic CSS classes at build time — zero runtime, zero learning curve.

- **Monorepo**: pnpm workspace (pnpm 10.24.0)
- **Language**: TypeScript (strict mode, ES modules)
- **Build**: tsdown (ESM + CJS + DTS)
- **Test**: Vitest with `@vitest/coverage-v8`, typecheck enabled
- **Lint**: ESLint via `@deviltea/eslint-config`
- **Docs**: VitePress (in `docs/`)
- **Node**: LTS (check `engines` if present)

## Repository Layout

```text
pikacss/
├── packages/
│   ├── core/              # Core engine: createEngine, plugins, extractors, resolvers
│   ├── integration/       # Build integration: config loading, transform, codegen
│   ├── unplugin/          # Universal build plugin (Vite/Rollup/Webpack/esbuild/Rspack/Rolldown)
│   ├── nuxt/              # Nuxt module wrapper
│   ├── plugin-icons/      # Icon plugin (@iconify integration)
│   ├── plugin-reset/      # CSS reset plugin (5 presets)
│   └── plugin-typography/ # Typography/prose plugin
├── demo/                  # Vue demo app
├── docs/                  # VitePress documentation site
├── scripts/               # Scaffolding scripts (newpkg, newplugin)
├── openspec/              # OpenSpec workflow configuration
└── coverage/              # Coverage reports (gitignored)
```

Each package follows the same structure:
- `src/index.ts` — main entry point
- `src/internal/` — internal modules (if any)
- `tsconfig.json` — references `tsconfig.package.json` and `tsconfig.tests.json`
- `tsdown.config.ts` — build configuration
- `vitest.config.ts` — test configuration (uses `defineProject`)
- `package.json` — package metadata and scripts

## Setup Commands

```bash
# Install all dependencies (required before any other command)
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests in watch mode
pnpm vitest

# Lint and auto-fix
pnpm lint

# Type-check all packages
pnpm typecheck

# Run a single package's tests
pnpm vitest run --project core
pnpm vitest run --project integration

# Docs
pnpm docs:dev      # dev server
pnpm docs:build    # production build
```

## Testing Conventions

- **Framework**: Vitest (v4+)
- **Test files**: Co-located with source files — `src/foo.ts` → `src/foo.test.ts`
- **Coverage**: `@vitest/coverage-v8`, configured in root `vitest.config.ts`
- **Coverage excludes**: config files, index files, docs, scripts, dist, coverage, bench files
- **Typecheck**: Enabled globally — tests are type-checked
- **Environment**: `happy-dom` available for DOM-related tests
- Always run `pnpm test` before committing to verify all tests pass
- After making changes, run `pnpm vitest run --project <package-name>` to verify the affected package

## Code Style

- **ES Modules** (`import`/`export`), never CommonJS (`require`)
- **TypeScript strict mode** — no `any` unless absolutely necessary
- **All files must be written in English** — code, comments, documentation, commit messages
- Markdown indentation: 2 spaces
- Follow existing patterns in the codebase
- Use `defineConfig`/`defineProject` helpers for config files
- Prefer named exports over default exports

## Build System

- **tsdown** compiles each package to ESM + CJS with `.d.ts` generation
- DTS uses `tsconfig.package.json` (composite, `src/` only)
- Each package has `build` and `typecheck` scripts
- Root `pnpm build` builds all packages in dependency order
- **publint** validates package publishing correctness

## Git Workflow

- **Pre-commit hook**: `lint-staged` runs ESLint on staged files via `simple-git-hooks`
- Always run `pnpm lint` and `pnpm test` before committing
- Commit messages should be descriptive and in English

## Package Dependencies (Internal)

```text
core (no internal deps)
  └── integration (depends on core)
       └── unplugin (depends on integration)
            └── nuxt (depends on unplugin)

plugin-icons, plugin-reset, plugin-typography (depend on core)
```

When modifying `core`, always verify downstream packages still build and pass tests.

## Key Conventions

- **Plugin system**: Use `defineEnginePlugin()` to create engine plugins
- **Config**: Use `defineEngineConfig()` for engine configuration
- **Style definitions**: Use `defineStyleDefinition()` for type-safe style objects
- **Integration context**: Use `createCtx()` to create build integration contexts
- **Unplugin factory**: Use `unpluginFactory` for build tool plugins
- Config files are auto-detected as `pika.config.{js,ts,mjs,mts,cjs,cts}`

## Common Pitfalls

- Do NOT edit files inside `dist/` or `coverage/` — they are generated
- Do NOT run `pnpm build` during iterative development — use tests and typecheck instead
- The root `vitest.config.ts` uses `projects: ['packages/*']` — each package is a separate Vitest project
- Coverage reports in the repo may be stale — always regenerate with `pnpm test`
- Some packages have `@types/*` as dev dependencies — check `package.json` before adding new type packages

## Documentation Conventions

All documentation lives in the `docs/` directory and is built with **VitePress**. Docs are written in **English** with a **direct, technical tone** optimized for developer comprehension. Follow these established patterns when creating or updating documentation:

### Structure and Organization

- **H1** — Page title (only one per document)
- **H2** — Major sections (Installation, Usage, Configuration, How It Works, Next)
- **H3** — Sub-sections (API details, plugin options, advanced topics)
- **H4** — Fine-grained details (rarely used)

Typical document flow:
1. **Brief introduction** — 1-2 paragraphs explaining what the feature/plugin does
2. **Installation** (if applicable) — always provide multi-package-manager examples
3. **Basic usage** — minimal example to get started
4. **Advanced configuration** — detailed options with tables
5. **How it works** — conceptual explanation or technical internals
6. **Next** — navigation links to related docs

### Writing Style

- **Tone**: Direct, imperative, technical — "Add the plugin", "Use this option", "Configure via..."
- **Detail level**: Balance theory with practice — provide both conceptual explanations and concrete code examples
- **Terminology**: Use consistent terms across all docs:
  - "engine" (not "framework" or "library")
  - "build-time" (not "compile-time" or "transformation")
  - "atomic CSS" (not "utility CSS" or "functional CSS")
  - "`pika()` function" (always in code format)
  - "virtual module" (for `pika.css`)
  - "generated files" (for `.gen.ts` and `.gen.css`)
- **Emphasis**: Use VitePress containers to highlight important information:
  - `::: tip` — helpful hints, best practices
  - `::: warning` — gotchas, constraints, deprecated features
  - `::: info` — clarifications, explanations

### Code Examples

**Never place code directly in markdown files.** All code examples are referenced from external files in the `.examples/` directory using VitePress's snippet import syntax:

```markdown
<<< @/.examples/getting-started/install-unplugin.sh [pnpm]
<<< @/.examples/guide/config-basic.ts{3-5}
```

- Use `<<<` syntax to import code snippets
- Syntax: `<<< @/.examples/<category>/<file-name>.<ext> [label]`
- Highlight specific lines with `{3-5}` or `{3,5,7}`
- Organize examples by documentation category (`getting-started/`, `guide/`, `plugins/`, `integrations/`, etc.)

**Code groups** for multi-option examples (package managers, frameworks):

```markdown
::: code-group
<<< @/.examples/getting-started/install-unplugin.sh [pnpm]
<<< @/.examples/getting-started/install-unplugin-npm.sh [npm]
<<< @/.examples/getting-started/install-unplugin-yarn.sh [yarn]
<<< @/.examples/getting-started/install-unplugin-bun.sh [bun]
:::
```

Always include at least **pnpm**, **npm**, and **yarn**.

### Tables

Use Markdown tables for structured reference information:

- **Configuration options**: Property | Type | Default | Description
- **Plugin presets**: Preset | Description
- **API methods**: Method | Purpose
- **Build tool integrations**: Build Tool | Import Path | Guide

Keep tables simple and scannable — use single-line descriptions.

### Internal Linking

- **Absolute paths from docs root**: `/getting-started/installation`, `/plugins/icons`
- **Never use relative paths** (`../guide/config`)
- **Anchor links**: `/integrations/overview#nuxt` for sections
- **Display text**: Descriptive (e.g., "See the [Vite integration guide](/integrations/vite)")
- **External links**: Use full URLs with `https://`

**Every document must end with a "Next" section** listing 2-4 related docs:

```markdown
## Next

- Continue to [Zero Config](/getting-started/zero-config)
- [Configuration Reference](/guide/configuration)
```

### Code and Identifier Formatting

Always wrap identifiers, package names, file names, and code expressions in backticks:

- Function names: `` `pika()` ``, `` `defineEngineConfig()` ``, `` `createEngine()` ``
- Package names: `` `@pikacss/core` ``, `` `@pikacss/unplugin-pikacss` ``
- Config options: `` `autoCreateConfig` ``, `` `transformedFormat` ``
- File paths: `` `pika.gen.ts` ``, `` `pika.config.ts` ``
- CSS properties: `` `fontSize` ``, `` `color` ``

### Key Messaging Patterns

Certain concepts are emphasized consistently across docs:

- **"`pika()` is a global function — no import needed"** — always clarify this in getting-started docs
- **"Zero runtime overhead"** — emphasize build-time compilation
- **"Full TypeScript autocomplete"** — highlight the DX benefit
- **"Arguments must be statically analyzable"** — explain the build-time constraint
- **"Virtual module"** — explain `pika.css` resolves to `pika.gen.css` at build time
- **"Atomic CSS deduplication"** — explain how the same declaration reuses the same class

### VitePress Features Used

- **Containers**: `::: tip`, `::: warning`, `::: info`, `::: danger`
- **Code groups**: `::: code-group` with labeled tabs
- **Snippet imports**: `<<<` with optional line highlighting
- **Custom headers**: Use `{#custom-id}` for anchor IDs (e.g., `## Official Plugins {#official-plugins}`)
- **Frontmatter**: Optional YAML for custom layout or title overrides

### File Organization

Example structure in `.examples/`:

```text
.examples/
├── getting-started/
│   ├── install-unplugin.sh
│   ├── pika-basic-usage.ts
│   └── vite.config.ts
├── guide/
│   ├── config-basic.ts
│   └── config-plugins.ts
├── plugins/
│   ├── reset-basic-usage.ts
│   └── icons-usage.vue
└── integrations/
    ├── vite-basic-config.ts
    └── nuxt-setup.ts
```

Match the folder name to the docs section for easy discovery.

### Documentation Authoring Workflow (Subagent)

When the agent is tasked with creating, updating, or analyzing documentation built with VitePress, the following workflow must be strictly followed to ensure technical accuracy and adherence to the latest VitePress standards:

1. Research Phase: The agent must initialize a subagent equipped with a fetch tool.

2. Fetch Official Context: The subagent must fetch the content of https://vitepress.dev/llms.txt. This file contains LLM-optimized documentation and rules for VitePress usage.

3. Synthesis: Analyze the fetched llms.txt to understand current VitePress best practices, markdown extensions, and architectural requirements.

4. Internal Alignment: Apply the official VitePress knowledge within the context of the PikaCSS Documentation Conventions, specifically regarding:

- External code snippet management in .examples/.
- The requirement for zero-runtime and atomic CSS terminology.
- Project-specific VitePress containers and code-groups.

5. Execution: Generate the documentation only after the subagent has confirmed the specific syntax and features required by the current version of VitePress.

### Documentation Checklist

When creating a new documentation page:

- [ ] H1 title matches the feature/concept name
- [ ] Brief 1-2 paragraph introduction
- [ ] Installation section (if applicable) with multi-package-manager examples
- [ ] Basic usage example with code snippet imports
- [ ] Configuration reference table (if applicable)
- [ ] "How It Works" or conceptual explanation
- [ ] "Next" section with 2-4 related links
- [ ] All code examples stored in `.examples/` and imported with `<<<`
- [ ] All identifiers and code wrapped in backticks
- [ ] Consistent terminology (engine, build-time, atomic CSS, etc.)
- [ ] At least one `::: tip` or `::: warning` container if relevant

## Scaffolding New Packages

```bash
pnpm newpkg       # Interactive: create a new package in packages/
pnpm newplugin    # Interactive: create a new plugin package
```

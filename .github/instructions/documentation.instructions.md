---
applyTo: "docs/**,docs/.examples/**"
---

# Documentation Conventions — PikaCSS

All docs live in `docs/` (VitePress). Code examples go in `docs/.examples/` only.

## Authoring Workflow

Before writing or editing documentation, always fetch VitePress's LLM guide for up-to-date syntax:

1. Use a `#runSubagent` with `#fetch_webpage` to fetch `https://vitepress.dev/llms.txt`
2. Cross-reference with the conventions below
3. Only then write or edit documentation

## Code Examples — CRITICAL

**Never write code directly in markdown files.** Always store examples in `docs/.examples/` and import with `<<<`:

```markdown
<<< @/.examples/getting-started/pika-basic.ts
<<< @/.examples/guide/config-basic.ts{3-5}
```

For multi-option tabs (package managers, frameworks):

```markdown
::: code-group
<<< @/.examples/getting-started/install.sh [pnpm]
<<< @/.examples/getting-started/install-npm.sh [npm]
<<< @/.examples/getting-started/install-yarn.sh [yarn]
:::
```

Always include at least **pnpm**, **npm**, and **yarn** in package manager examples.

## Page Structure

Typical document flow:
1. Brief intro (1-2 paragraphs)
2. Installation (if applicable) with multi-package-manager examples
3. Basic usage
4. Advanced configuration
5. How it works
6. **Next** — 2-4 related links (required on every page)

Heading levels: H1 (title, once) · H2 (major sections) · H3 (subsections) · H4 (rarely)

## Writing Style

- Tone: direct, imperative, technical — "Add the plugin", "Configure via..."
- Consistent terminology:
  - "engine" (not framework/library)
  - "build-time" (not compile-time/transformation)
  - "atomic CSS" (not utility CSS/functional CSS)
  - `` `pika()` `` function (always code-formatted)
  - "virtual module" for `pika.css`
  - "generated files" for `.gen.ts` / `.gen.css`
- Wrap all identifiers, package names, file paths in backticks
- Use VitePress containers:
  - `::: tip` — best practices, hints
  - `::: warning` — gotchas, constraints
  - `::: info` — clarifications

## Internal Linking

- Absolute paths from docs root: `/getting-started/installation`, `/plugins/icons`
- Never relative paths (`../guide/config`)
- Anchor links: `/integrations/overview#nuxt`
- Every page ends with a `## Next` section listing 2-4 related links

## Key Messaging (use consistently)

- `` `pika()` `` is a global function — no import needed
- Zero runtime overhead — build-time compilation
- Full TypeScript autocomplete
- Arguments must be statically analyzable
- `pika.css` is a virtual module → resolves to `pika.gen.css` at build time
- Atomic CSS deduplication: same declaration = same class

## .examples/ File Organization

```plaintext
docs/.examples/
├── getting-started/   # install, first-pika, zero-config
├── guide/             # config, built-ins
├── plugins/           # reset, icons, typography
└── integrations/      # vite, nuxt, webpack, etc.
```

Match folder name to the docs section.

## New Page Checklist

- [ ] H1 title, brief intro, all code via `<<<` imports
- [ ] Installation section with pnpm/npm/yarn examples
- [ ] Configuration table if applicable (Property | Type | Default | Description)
- [ ] `## Next` section with 2-4 related links
- [ ] Consistent terminology throughout

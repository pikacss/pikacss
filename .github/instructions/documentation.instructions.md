---
applyTo: "docs/**,docs/.examples/**"
---

# Documentation Conventions — PikaCSS

All docs live in `docs/` (VitePress). Code examples live in `docs/.examples/` only.

For zh-TW markdown pages, also follow `.github/instructions/translation.instructions.md`.
For zh-TW example mirrors, also follow `.github/instructions/translation-examples.instructions.md`.

## Authoring Workflow

Before writing or editing documentation, fetch VitePress's LLM guide for current syntax:

1. Use a `#runSubagent` with `#fetch_webpage` to fetch `https://vitepress.dev/llms.txt`
2. Cross-reference it with the rules below.
3. Then write or edit the docs.

## Core Rules

- Never write code directly in markdown files. Store examples in `docs/.examples/` and import them with `<<<`.
- Always include `pnpm`, `npm`, and `yarn` variants for package-manager install examples.
- Use absolute docs links such as `/getting-started/installation`, never relative markdown links like `../guide/config`.
- Every page ends with a `## Next` section linking 2-4 related pages.

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

## Page Structure

Typical flow:
1. Brief intro (1-2 paragraphs)
2. Installation, if applicable
3. Basic usage
4. Advanced configuration
5. How it works
6. `Next`

Heading levels: H1 (title, once) · H2 (major sections) · H3 (subsections) · H4 (rarely)

## Writing Style

- Tone: direct, imperative, technical.
- Keep terminology consistent: `engine`, `build-time`, `atomic CSS`, `pika()`, `virtual module`, `generated files`.
- Wrap identifiers, package names, and file paths in backticks.
- Use VitePress containers only when they add value: `tip`, `warning`, `info`.

## .examples/ File Organization

```plaintext
docs/.examples/
├── getting-started/   # install, first-pika, zero-config
├── guide/             # config, built-ins
├── plugins/           # reset, icons, typography
└── integrations/      # vite, nuxt, webpack, etc.
```

Match folder name to the docs section.

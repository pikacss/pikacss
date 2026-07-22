# Plugin: Design Tokens

> Read this when the user asks about W3C design token JSON, `design.md` token blocks, inline tokens, themes, aliases, CSS variable generation, token pruning, file watching, or neutral versus Node.js runtime adapters.

## Installation

```bash
pnpm add -D @pikacss/plugin-design-tokens
```

## Choose the Correct Entry

| Import | Capabilities |
|---|---|
| `@pikacss/plugin-design-tokens` | Inline token objects; file sources only when custom runtime capabilities are passed |
| `@pikacss/plugin-design-tokens/node` | Inline tokens plus JSON and Markdown file sources resolved with Node.js filesystem APIs |

Use `/node` in ordinary bundler config when `sources` contains paths:

```ts
// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens/node'

export default defineEngineConfig({
  plugins: [designTokens()],
  designTokens: {
    sources: ['./design.tokens.json'],
  },
})
```

Using a string source with the neutral entry produces a diagnostic and skips that source unless a custom `readFile` capability was supplied.

## Inline Tokens

The neutral entry works with inline W3C-style token groups:

```ts
import { designTokens } from '@pikacss/plugin-design-tokens'

export default defineEngineConfig({
  plugins: [designTokens()],
  designTokens: {
    sources: {
      color: {
        primary: { $value: '#3b82f6', $type: 'color' },
        accent: { $value: '{color.primary}' },
      },
    },
  },
})
```

This generates variables such as `--color-primary` and `--color-accent` through the core variables system.

## File Sources

With the Node adapter:

- Paths ending in `.md` are parsed as design documents.
- Other paths are parsed as W3C design token JSON.
- Relative paths resolve against `designTokens.root`, then the runtime working directory.
- Missing paths are still registered as config dependencies so creating the file later can trigger a reload.
- Invalid or unreadable sources emit structured diagnostics and are skipped rather than partially crashing token resolution.

```ts
export default defineEngineConfig({
  plugins: [designTokens()],
  designTokens: {
    root: './design',
    sources: ['tokens.json', 'components.md'],
  },
})
```

## Markdown Token Blocks

Only fenced blocks whose info string starts with `tokens` are parsed:

````md
# Buttons

```tokens
{
  "color": {
    "primary": { "$value": "#3b82f6" }
  }
}
```

```tokens theme=dark selector="[data-theme='dark']"
{
  "color": {
    "primary": { "$value": "#60a5fa" }
  }
}
```
````

Supported fence attributes:

- `theme=<name>` assigns a block to a theme.
- `selector=<css-selector>` overrides that theme block's selector.

Malformed JSON blocks are skipped with diagnostics.

## Themes

Base variables are emitted under `:root`. Theme variables use:

1. A selector specified on the Markdown token block.
2. `themes.<name>.selector` from config.
3. The default `.<themeName>` selector.

```ts
export default defineEngineConfig({
  plugins: [designTokens()],
  designTokens: {
    sources: ['./tokens.json'],
    themes: {
      dark: {
        selector: '[data-theme="dark"]',
        sources: ['./tokens.dark.json'],
      },
    },
  },
})
```

Later sources override earlier sources when generated variable names collide.

## Config Reference

| Option | Purpose | Default |
|---|---|---|
| `sources` | Inline token groups or file paths for `:root` | — |
| `themes` | Theme selectors and token sources keyed by theme name | — |
| `prefix` | Prefix inserted into generated variable names, without `--` | `''` |
| `root` | Base path for relative file sources | Runtime cwd; `'.'` without one |
| `pruneUnused` | Per-token override for variable pruning | Inherits the variables config default |

## Names and Aliases

Each path segment is normalized to kebab-case and joined with `-`:

- `color.primary` → `--color-primary`
- `fontSize.body` → `--font-size-body`
- With `prefix: 'app'`: `color.primary` → `--app-color-primary`

String token values may reference another token:

```json
{
  "color": {
    "primary": { "$value": "#3b82f6" },
    "border": { "$value": "1px solid {color.primary}" }
  }
}
```

The alias becomes `var(--color-primary)` using the same normalization and prefix.

## Composite Values

Dedicated serializers exist for:

- `shadow`
- `border`
- `transition`
- Arrays, whose serialized items are joined with `, `

An object value without a dedicated serializer is expanded into sub-variables. For example, a typography object with `fontSize` creates a `...-font-size` variable.

## Pruning and Usage

Tokens are inserted into `variables.definitions`, so they inherit:

- Variable scoping.
- Generated autocomplete.
- Unused-variable pruning.

Reference a token from normal styles:

```ts
pika({
  color: 'var(--color-primary)',
  borderColor: 'var(--color-border)',
})
```

Set `designTokens.pruneUnused: false` when all generated token variables must remain even when PikaCSS cannot observe a reference.

## Runtime Capabilities for Custom Hosts

The neutral factory accepts optional runtime capabilities:

```ts
import { designTokens } from '@pikacss/plugin-design-tokens'

const plugin = designTokens({
  readFile: async absolutePath => customFilesystem.readText(absolutePath),
  cwd: () => '/project',
})
```

Use this only for non-Node hosts or custom integrations. Application bundler config should normally use the `/node` entry instead.

## Diagnostics and File Watching

The plugin reports structured diagnostics through the current engine's diagnostic handler. File-backed sources register every resolved path with `engine.addConfigDependency`, including missing paths, so official integrations can recreate the engine after changes.

When testing failures, pass `onDiagnostic` to `createEngine` and assert diagnostic codes such as file-loader unavailable, read failure, invalid JSON, or unsupported value. Do not rely on console spying.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| File source is skipped | Neutral entry used | Import from `@pikacss/plugin-design-tokens/node` |
| Relative path resolves incorrectly | Wrong root or integration cwd | Set `designTokens.root` explicitly |
| Theme variables use the wrong selector | Fence selector/config selector mismatch | Align the selector with the application's actual theme mechanism |
| Token variable is missing from output | Unused-variable pruning | Reference the variable or set `pruneUnused: false` |
| Alias points to an unexpected name | Prefix/path normalization misunderstood | Apply the same prefix and kebab-case path rules to the target |
| Editing a source does not reload | Custom host does not watch config dependencies | Ensure the integration watches `engine.configDependencies` |

---
title: Design Tokens
description: Convert W3C design tokens and design.md documents into CSS variables with the design tokens plugin.
relatedPackages:
  - '@pikacss/plugin-design-tokens'
relatedSources:
  - 'packages/plugin-design-tokens/src/index.ts'
category: official-plugins
order: 50
---

# Design Tokens

Convert design tokens into CSS variables through the engine's `variables` system.

The design tokens plugin reads token sources — inline objects, W3C Design Tokens JSON files, or markdown design documents — flattens them into CSS variables, and merges them into the engine's `variables` config. Because tokens flow through the core `variables` system, they inherit unused-pruning, IDE autocomplete, and selector scoping. Loaded token files are registered as engine config dependencies, so build-tool integrations reload when a token file changes.

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/plugin-design-tokens
```

```sh [npm]
npm install -D @pikacss/plugin-design-tokens
```

```sh [yarn]
yarn add -D @pikacss/plugin-design-tokens
```

:::

<<< @/.examples/official-plugins/design-tokens.setup.example.ts

`designTokens()` takes no arguments. Configure the plugin through the top-level `designTokens` engine config key.

Usage: reference the generated variables from regular `pika()` calls. Tokens are pruned when unused by default, so only referenced variables are emitted:

::: code-group

<<< @/.examples/official-plugins/design-tokens.usage.example.pikain.ts [Input]

<<< @/.examples/official-plugins/design-tokens.usage.example.pikaout.css [Output]

:::

## Token Sources

`sources` accepts a single source or an array of sources. Each source is either an inline token group object or a file path. Relative paths resolve against `root` (default: `process.cwd()`). Later sources override earlier ones when variable names collide. Unreadable or invalid sources are skipped with a warning instead of failing engine creation.

### JSON Token Files

Any file path that does not end in `.md` is parsed as a W3C Design Tokens JSON file. A node with a `$value` property is a token; any other object is a nested group. `$`-prefixed group metadata keys (such as `$description`) are skipped:

```json
{
	"color": {
		"primary": { "$value": "#3b82f6", "$type": "color" },
		"accent": { "$value": "{color.primary}" }
	}
}
```

### Markdown Design Documents

File paths ending in `.md` are parsed as design documents. Only fenced code blocks whose info string starts with `tokens` are read; all other markdown content is ignored, so tokens can live inside your design documentation. Block content must be valid JSON in the W3C Design Tokens format:

````md
# Buttons

Primary buttons use the brand color.

```tokens
{ "color": { "primary": { "$value": "#3b82f6" } } }
```

The dark theme swaps in a lighter shade.

```tokens theme=dark selector=".dark"
{ "color": { "primary": { "$value": "#60a5fa" } } }
```
````

The info string may carry two attributes:

- `theme=<name>` — assigns the block's tokens to a theme instead of the base `:root` scope.
- `selector=<css-selector>` — overrides the theme selector for that block. Values may be quoted with `"` or `'`. A fence `selector` takes precedence over the selector configured under `themes`.

## Themes

Base tokens are emitted under `:root`. Theme tokens are emitted under the theme's selector, which defaults to `.<themeName>` and can be overridden via `themes.<name>.selector` (or per-block via the fence `selector` attribute). Theme sources use the same formats as base sources:

```ts
import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'

export default defineEngineConfig({
	plugins: [designTokens()],
	designTokens: {
		sources: ['./design.tokens.json'],
		themes: {
			dark: {
				selector: '[data-theme="dark"]',
				sources: ['./design.dark.tokens.json'],
			},
		},
	},
})
```

## Token Names and Aliases

Each token path segment is kebab-cased (`fontSize` → `font-size`), then segments are joined with `-` to form the variable name, e.g. `color.primary` → `--color-primary`. When `prefix` is set, it is prepended as the first segment: `--app-color-primary`.

String values may reference other tokens with alias syntax `{path.to.token}`, which resolves to `var(--path-to-token)` using the same normalization and prefix — aliases always point at the emitted variable name. Aliases also work embedded in longer values, e.g. `'1px solid {color.border}'` → `1px solid var(--color-border)`.

## Composite Values

Object and array `$value`s are serialized based on `$type`:

| `$type` | Serialization |
|---|---|
| `shadow` | `[inset] <offsetX> <offsetY> <blur> <spread> <color>` — missing offsets default to `0` |
| `border` | `<width> <style> <color>` |
| `transition` | `<duration> <timingFunction> <delay>` |
| *(arrays, any type)* | Items serialized individually and joined with `, ` (layered shadows, `fontFamily` stacks) |

Object values with any other `$type` (e.g. `typography`) have no single-value serializer. They are expanded into one sub-variable per field: `typography.heading` with `{ fontSize: '2rem' }` becomes `--typography-heading-font-size`.

## Config

| Property | Description |
|---|---|
| sources | Base token sources emitted under `:root` — inline token group objects or file paths. Later sources override earlier ones when names collide. |
| themes | Theme overrides keyed by theme name. Each theme takes a `selector` (default `.<themeName>`) and its own `sources`. |
| prefix | Prefix prepended to every generated CSS variable name (without leading `--`). Default: `''`. |
| root | Base directory used to resolve relative source file paths. Default: `process.cwd()`. |
| pruneUnused | Pruning override applied to every generated variable. When unset, the `variables` config default applies (unused tokens are pruned). |

> See [API Reference — Plugin Design Tokens](/api/plugin-design-tokens) for full type signatures and defaults.

## Next

- [Fonts](/official-plugins/fonts) — web font loading and management.
- [Variables](/customizations/variables) — the core variables system that design tokens feed into.

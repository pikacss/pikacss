---
name: pikacss-use
description: 'Help consumers install, configure, troubleshoot, and use PikaCSS in application projects. Covers installation, Vite/Nuxt integration, engine configuration, the pika() function and its variants, official plugin consumption (reset, icons, fonts, typography), ESLint setup, and TypeScript support. Use when: (1) setting up PikaCSS in an app, (2) configuring engine options, (3) consuming official plugins, (4) using pika()/pika.str()/pika.arr()/pikap(), (5) troubleshooting consumer build or runtime issues, (6) learning end-user PikaCSS patterns. Do not use for authoring or modifying plugin implementation; route that work to pikacss-develop-plugin. This is a skill-only domain guide used directly by the main agent; it has no paired custom agent.'
---

# Use PikaCSS

PikaCSS is an instant on-demand atomic CSS-in-JS engine. It generates atomic CSS at build time from `pika()` calls in source code. Build-tool plugins (Vite, Webpack, Nuxt, etc.) transform `pika()` calls and produce CSS + TypeScript output files.

- **Docs**: <https://pikacss.com/getting-started/>
- **API Reference**: <https://pikacss.com/api/>
- **Source**: <https://github.com/pikacss/pikacss>

## Boundary

- This skill is for consumers integrating or troubleshooting PikaCSS in an app.
- This is a skill-only domain guide. The main agent should apply it directly instead of delegating to a same-named custom agent.
- Official plugins are in scope only as things to install, configure, and use.
- Creating a new plugin, changing plugin internals, or working on plugin hook implementation is out of scope. Route that work to `pikacss-develop-plugin`.

## Agent pairing

- Dedicated implementation agent: none
- Dedicated review agent: none
- Use this skill directly in the main conversation for consumer-facing setup and troubleshooting.

## Installation

```bash
pnpm add -D @pikacss/unplugin-pikacss           # Core + Vite/Webpack plugin
# pnpm add -D @pikacss/nuxt-pikacss             # Nuxt module (includes Vite plugin)
# pnpm add -D @pikacss/plugin-{reset,icons,fonts,typography}  # Official plugins
# pnpm add -D @pikacss/eslint-config             # ESLint config
```

## Vite Setup

```ts
// vite.config.ts
import pikacss from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [pikacss()],
})
```

Generates `pika.gen.css` (atomic CSS) and `pika.gen.ts` (TypeScript declarations). Import the generated CSS in your entry file (e.g., `import './pika.gen.css'`).

## Nuxt Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pikacss/nuxt-pikacss'],
})
```

The Nuxt module handles CSS injection automatically.

## Engine Configuration

Create `pika.config.ts` (or `.js`, `.mjs`) at the project root:

```ts
import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  prefix: 'pk-',
  plugins: [reset(), icons()],
})
```

All config options:

| Option | Type | Default | Purpose |
|---|---|---|---|
| `plugins` | `EnginePlugin[]` | `[]` | Array of engine plugins |
| `prefix` | `string` | `'pk-'` | Class name prefix |
| `defaultSelector` | `string` | `'.%'` | Default CSS selector template (`%` = class placeholder) |
| `preflights` | `Preflight[]` | `[]` | Preflight CSS blocks |
| `cssImports` | `string[]` | `[]` | CSS `@import` URLs |
| `layers` | `Record<string, number>` | `{ preflights: 1, utilities: 10 }` | CSS layer ordering |
| `defaultPreflightsLayer` | `string` | `'preflights'` | Layer for preflight CSS |
| `defaultUtilitiesLayer` | `string` | `'utilities'` | Layer for atomic utilities |
| `autocomplete` | `AutocompleteConfig` | `{}` | IDE autocomplete config |
| `important` | `ImportantConfig` | — | `!important` behavior |
| `selectors` | `SelectorsConfig` | — | Named selector shortcuts |
| `shortcuts` | `ShortcutsConfig` | — | Named style shortcuts |
| `variables` | `VariablesConfig` | — | CSS custom properties |
| `keyframes` | `KeyframesConfig` | — | Named keyframe definitions |

## Usage — pika() Function

The `pika()` function accepts style items and returns class names:

```ts
// StyleDefinition object — CSS properties as key-value pairs
const cls = pika({
  display: 'flex',
  'align-items': 'center',
  '$:hover': { opacity: '0.8' },
})

// Named shortcut — reference a shortcut registered in config or plugins
const cls2 = pika('my-shortcut')

// Multiple items — mix objects and shortcuts
const cls3 = pika({ display: 'flex' }, 'my-shortcut', { color: 'red' })
```

### pika() Variants

| Syntax | Return type | Purpose |
|---|---|---|
| `pika(...)` | `string` or `string[]` (depends on config) | Default output format |
| `pika.str(...)` | `string` | Force space-separated string |
| `pika.arr(...)` | `string[]` | Force array of class names |
| `pikap(...)` | same as `pika()` | Preview mode — renders CSS in IDE tooltip |
| `pikap.str(...)` | `string` | Preview + force string |
| `pikap.arr(...)` | `string[]` | Preview + force array |

### Dynamic Selectors

Prefix style properties with selector names:

```ts
pika({
  '$:hover': { opacity: '0.8' },      // pseudo-class
  '$:focus': { outline: 'none' },      // pseudo-class
  '@dark': { color: 'white' },         // media query / scheme
  '@sm': { 'font-size': '14px' },      // responsive breakpoint
})
```

Custom selectors can be registered in config (`selectors`) or via plugins.

## Official Plugins

| Plugin | Package | Purpose |
|---|---|---|
| Reset | `@pikacss/plugin-reset` | CSS reset/normalize as preflight |
| Icons | `@pikacss/plugin-icons` | `i-{collection}:{name}` icon shortcuts via Iconify |
| Fonts | `@pikacss/plugin-fonts` | Web font loading and `font-{token}` shortcuts |
| Typography | `@pikacss/plugin-typography` | `prose-*` shortcuts and `--pk-prose-*` variables |

Each plugin is added to the `plugins` array in `pika.config.ts`.

## ESLint

```ts
// eslint.config.mjs
import pikacss from '@pikacss/eslint-config'

export default [...pikacss({ fnName: 'pika' })]
```

Provides lint rules for valid `pika()` usage, property ordering, and shorthand consistency.

## Troubleshooting

Common issues:
- **Config not detected**: Ensure `pika.config.ts` is at the project root.
- **Styles not applied**: Verify `pika.gen.css` is imported in your entry file.
- **Type errors**: Ensure `pika.gen.ts` is included in your tsconfig.
- **Plugin conflicts**: Check plugin order in the engine configuration.

## Workflow

1. Identify user's project setup (Vite, Nuxt, Webpack, etc.).
2. Install correct packages and set up build plugin + config.
3. Demonstrate `pika()` usage with user's framework.
4. Add plugins and ESLint as needed.

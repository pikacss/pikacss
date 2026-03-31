---
name: pikacss-use
description: 'The single PikaCSS domain skill for both consumers and plugin authors. Covers installation, Vite/Nuxt/Webpack/Rollup/esbuild/Rspack/Rolldown integration, engine configuration, the pika() compile-time macro, official plugin consumption (reset, icons, fonts, typography), ESLint setup, TypeScript support, AND plugin authoring — plugin structure, lifecycle hooks, config augmentation, engine API, layer management, testing plugins with createEngine. Use when: (1) setting up PikaCSS in an app, (2) configuring engine options or pika.config, (3) consuming official plugins, (4) using pika()/pika.str()/pika.arr()/pikap(), (5) troubleshooting consumer build or runtime issues, (6) learning end-user PikaCSS patterns, (7) understanding selectors, shortcuts, variables, keyframes, or preflights, (8) creating a new PikaCSS engine plugin, (9) modifying an official plugin implementation, (10) understanding plugin hooks and lifecycle, (11) extending EngineConfig with module augmentation, (12) writing or fixing plugin tests. Make sure to use this skill whenever the user mentions PikaCSS plugins, defineEnginePlugin, plugin hooks, configureEngine, or asks how to extend PikaCSS with custom behavior. This is a skill-only domain guide used directly by the main agent; it has no paired custom agent.'
---

# Use PikaCSS

PikaCSS is an instant on-demand atomic CSS-in-JS engine. It generates atomic CSS at **build time** by transforming `pika()` calls in source code into class-name literals. Build-tool plugins handle the transformation, CSS generation, and TypeScript declaration output.

- **Docs**: <https://pikacss.com/getting-started/>
- **API Reference**: <https://pikacss.com/api/>
- **Source**: <https://github.com/pikacss/pikacss>

## Reference Files

This skill ships with detailed reference documents. Load them on demand:

| File | When to read |
|---|---|
| `references/build-options.md` | User asks about build plugin options — scan patterns, output format, codegen paths, custom function name, HMR |
| `references/customizations.md` | User asks about variables (theming/dark mode), keyframes, preflights, selectors config, shortcuts with nested selectors, `__layer`/`__important`, CSS property syntax, or `define*` helpers |
| `references/plugin-reset.md` | User asks about CSS reset plugin — choosing a reset style |
| `references/plugin-icons.md` | User asks about icon shortcuts, Iconify collections, or icon troubleshooting |
| `references/plugin-fonts.md` | User asks about web font loading — Google Fonts, `@font-face`, or `@import` |
| `references/plugin-typography.md` | User asks about prose/typography shortcuts or `--pk-prose-*` variables |
| `references/plugin-development.md` | User asks about creating a plugin, plugin hooks, lifecycle, engine API, config augmentation, or plugin testing |

## Key Concept — pika() Is a Compile-Time Macro

`pika()` is **not** a runtime function. The build plugin scans source files, evaluates each `pika()` call at build time, and replaces it with a string literal (or array literal) of generated class names. No PikaCSS code runs in the browser. This means:

- `pika({ display: 'flex' })` becomes `'pk-a1b2'` (a plain string) in the built output.
- The corresponding CSS rule `.pk-a1b2 { display: flex }` is emitted into the generated CSS file.
- Arguments to `pika()` must be statically analyzable — no runtime variables.

## Boundary

- This skill covers both consumer usage (install, configure, troubleshoot) and plugin authoring (create, modify, test plugins).
- This is a skill-only domain guide. The main agent should apply it directly instead of delegating to a same-named custom agent.
- Official plugins are in scope both as things to consume and as reference implementations for plugin authors.
- For plugin authoring details (hooks, engine API, config augmentation, testing), load `references/plugin-development.md`.

## Agent pairing

- Dedicated implementation agent: none
- Dedicated review agent: none
- Use this skill directly in the main conversation for consumer-facing setup and troubleshooting.

## Installation

```bash
pnpm add -D @pikacss/unplugin-pikacss           # Core + build plugin (Vite/Webpack/Rollup/etc.)
# pnpm add -D @pikacss/nuxt-pikacss             # Nuxt module (includes Vite plugin)
# pnpm add -D @pikacss/plugin-{reset,icons,fonts,typography}  # Official plugins
# pnpm add -D @pikacss/eslint-config             # ESLint config
```

## Build Plugin Setup

### Vite

```ts
// vite.config.ts
import pikacss from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [pikacss()],
})
```

### Other Bundlers

`@pikacss/unplugin-pikacss` provides subpath exports for every supported bundler:

| Bundler | Import path |
|---|---|
| Vite | `@pikacss/unplugin-pikacss/vite` |
| Rollup | `@pikacss/unplugin-pikacss/rollup` |
| Webpack | `@pikacss/unplugin-pikacss/webpack` |
| esbuild | `@pikacss/unplugin-pikacss/esbuild` |
| Rspack | `@pikacss/unplugin-pikacss/rspack` |
| Rolldown | `@pikacss/unplugin-pikacss/rolldown` |

Each export is a factory function: `import pikacss from '@pikacss/unplugin-pikacss/<bundler>'`, then add `pikacss()` to the bundler's plugin array. See `references/build-options.md` for all plugin options.

### Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pikacss/nuxt-pikacss'],
})
```

The Nuxt module configures the Vite plugin and injects a Nuxt plugin that automatically imports the generated CSS — no manual CSS import needed.

### Generated Files and CSS Import

The build plugin generates two files (configurable via plugin options):
- `pika.gen.css` — all atomic CSS rules
- `pika.gen.ts` — TypeScript declarations for `pika()` and `pikap()`

**Import the CSS via the `pika.css` virtual module** in your entry file:

```ts
// main.ts (Vite/Webpack/etc. — not needed for Nuxt)
import 'pika.css'
```

`pika.css` is a virtual module alias that resolves to the generated CSS file. The Nuxt module handles this import automatically.

### TypeScript — pika.gen.ts Must Be Included

`pika.gen.ts` provides type declarations that make `pika()` and `pikap()` available as global compile-time macros. **It must be visible to the TypeScript compiler**, otherwise you will get "Cannot find name 'pika'" errors.

There are two ways it can be included:

1. **Implicit inclusion** — If your `tsconfig.json` uses a broad `include` pattern that already covers the project root (e.g. `"include": ["src", "."]` or `"include": ["**/*.ts"]`), `pika.gen.ts` at the project root is already picked up. No extra step needed.
2. **Explicit inclusion** — If your `include` is scoped to a subdirectory only (e.g. `"include": ["src"]`, common in Vite + React/Vue templates), `pika.gen.ts` at the root is **not** covered. Add it explicitly:

```jsonc
// tsconfig.json (or tsconfig.app.json)
{
  "include": ["src", "pika.gen.ts"]
}
```

**Always verify** that the project's `tsconfig` `include` pattern covers `pika.gen.ts`. When guiding a full setup, mention this step — especially for scaffolded templates where `include` defaults to `["src"]`.

## Engine Configuration

Create a config file at the project root. Supported file names:

- `pika.config.{ts,js,mjs,cjs,mts,cts}`
- `pikacss.config.{ts,js,mjs,cjs,mts,cts}`

```ts
// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  prefix: 'pk-',
  plugins: [reset(), icons()],
})
```

### Core Config Options

| Option | Type | Default | Purpose |
|---|---|---|---|
| `plugins` | `EnginePlugin[]` | `[]` | Array of engine plugins |
| `prefix` | `string` | `'pk-'` | Atomic class name prefix (e.g. `pk-a1b2`) |
| `defaultSelector` | `string` | `'.%'` | Default CSS selector template (`%` = class placeholder) |
| `preflights` | `Preflight[]` | `[]` | Global CSS rules emitted before utilities |
| `cssImports` | `string[]` | `[]` | CSS `@import` statements prepended to output |
| `layers` | `Record<string, number>` | `{ preflights: 1, utilities: 10 }` | CSS `@layer` ordering |
| `defaultPreflightsLayer` | `string` | `'preflights'` | Layer name for preflight CSS |
| `defaultUtilitiesLayer` | `string` | `'utilities'` | Layer name for atomic utilities |
| `autocomplete` | `AutocompleteConfig` | `{}` | IDE autocomplete configuration |

### Plugin-Augmented Config Options

These options are added to `EngineConfig` via TypeScript module augmentation by built-in internal plugins. Available in every project — no extra imports needed:

| Option | Type | Purpose |
|---|---|---|
| `important` | `ImportantConfig` | Add `!important` to all utilities |
| `selectors` | `SelectorsConfig` | Named selector aliases (pseudo-classes, media queries) |
| `shortcuts` | `ShortcutsConfig` | Named style shortcuts reusable in `pika()` calls |
| `variables` | `VariablesConfig` | CSS custom properties with scoping and pruning |
| `keyframes` | `KeyframesConfig` | Named `@keyframes` definitions with pruning |

For detailed usage of these options (variables with dark mode, keyframes, preflights, selectors config, shortcuts with nested selectors, `__layer`/`__important` per-style control), see `references/customizations.md`.

### cssImports vs preflights

- `cssImports` — static `@import` strings placed first in the CSS output. Use for external stylesheets (Google Fonts CDN, normalize.css CDN, etc.).
- `preflights` — CSS rules rendered after imports but before utilities, scoped to `@layer`. Use for reset styles, global variables, and custom base rules.

## Usage — pika() Macro

`pika()` accepts one or more **style items** and is replaced at build time with the generated class names.

### Style Items

A style item is one of:
- A **StyleDefinition object** — CSS properties as key-value pairs
- A **shortcut name** — a string referencing a named shortcut from config or plugins

```ts
// StyleDefinition object — both camelCase and kebab-case property names work
const cls = pika({
  display: 'flex',
  alignItems: 'center',        // camelCase
  'font-size': '1rem',         // kebab-case
})

// Named shortcut
const cls2 = pika('my-shortcut')

// Multiple items — mix objects and shortcuts
const cls3 = pika({ display: 'flex' }, 'my-shortcut', { color: 'red' })
```

CSS property values can use tuple syntax for fallbacks: `color: ['red', 'var(--fallback)']` emits multiple declarations. Custom properties are also supported: `'--my-var': '16px'`.

### pika() Variants

| Syntax | Output type | Purpose |
|---|---|---|
| `pika(...)` | `string` (default) | Space-separated class names |
| `pika.str(...)` | `string` | Force space-separated string |
| `pika.arr(...)` | `string[]` | Force array of class names |
| `pikap(...)` | same as `pika()` | Preview mode — renders CSS in IDE tooltip |
| `pikap.str(...)` | `string` | Preview + force string |
| `pikap.arr(...)` | `string[]` | Preview + force array |

The default output format is `string` (configurable via the build plugin's `transformedFormat` option — see `references/build-options.md`).

### Nested Selectors

Style properties can be nested under selector keys to apply styles conditionally:

```ts
pika({
  color: 'red',
  ':hover': { opacity: '0.8' },
  '@dark': { color: 'white' },
  '@screen-md': { fontSize: '1.2rem' },
})
```

Selector keys must be registered in the config's `selectors` option. The `$` character in the CSS selector template represents the atomic class. See `references/customizations.md` for the full selectors config format.

### Per-Style Control: __layer and __important

Individual style definitions can override layer placement or add `!important`:

```ts
pika({
  __layer: 'components',        // Place these utilities in a custom layer
  __important: true,            // Add !important to all properties in this item
  display: 'flex',
  color: 'red',
})
```

## Official Plugins

| Plugin | Package | Purpose | Reference |
|---|---|---|---|
| Reset | `@pikacss/plugin-reset` | CSS reset/normalize as preflight | `references/plugin-reset.md` |
| Icons | `@pikacss/plugin-icons` | `i-{collection}:{name}` icon shortcuts via Iconify | `references/plugin-icons.md` |
| Fonts | `@pikacss/plugin-fonts` | Web font loading and `font-{token}` shortcuts | `references/plugin-fonts.md` |
| Typography | `@pikacss/plugin-typography` | `prose-*` shortcuts and `--pk-prose-*` variables | `references/plugin-typography.md` |

Each plugin is a function imported from its package and added to the `plugins` array in `pika.config.ts`. Load the corresponding reference file for configuration options, examples, and troubleshooting.

## Define Helpers

`@pikacss/core` exports type-safe factory helpers for common config items:

- `defineEngineConfig(config)` — type-safe engine config
- `defineStyleDefinition(def)` — type-safe style definition objects
- `definePreflight(preflight)` — type-safe preflight entries
- `defineShortcut(shortcut)` — type-safe shortcut definitions

Use these when building config fragments in separate files.

## ESLint

```ts
// eslint.config.mjs
import pikacss from '@pikacss/eslint-config'

export default [pikacss()]
```

The default export is a function that returns a flat-config entry. The `fnName` option (default: `'pika'`) lets you customize the function name if needed: `pikacss({ fnName: 'pika' })`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Config not detected | File name or location wrong | Use `pika.config.ts` (or `pikacss.config.ts`) at the project root |
| Styles not applied | Missing CSS import | Add `import 'pika.css'` to your entry file (not needed for Nuxt) |
| Type errors on `pika()` | Missing generated types | Ensure `pika.gen.ts` is included in your tsconfig |
| Plugin config types missing | Module augmentation not loaded | Import the plugin in `pika.config.ts` — TypeScript picks up the augmented types |
| Build errors with dynamic args | Non-static pika() arguments | All `pika()` arguments must be statically analyzable — no runtime variables |
| Plugin order issues | Plugins applied in wrong order | Reorder the `plugins` array — plugins are applied in order |
| Icons not rendering | Collection package missing | Install `@iconify-json/{collection}` or enable `autoInstall` — see `references/plugin-icons.md` |
| Wrong icon appearance | Mask vs background mode mismatch | Read the icon modes section in `references/plugin-icons.md` |

## Plugin Development (Quick Start)

For full details, load `references/plugin-development.md`. The essentials:

- Plugins are plain objects created with `defineEnginePlugin({ name, order?, ...hooks })`.
- Hooks are direct methods — no `setup()` wrapper.
- Order tiers: `'pre'` → default (`undefined`) → `'post'`.
- Use `configureRawConfig` for injecting config defaults, `configureEngine` for registering preflights/selectors/shortcuts/keyframes/variables.
- Use TypeScript module augmentation on `EngineConfig` to expose plugin options to users.
- Test with `createEngine` + `defineEngineConfig` from `@pikacss/core`.

## Workflow

### Consumer Setup

1. Identify the user's project setup (Vite, Nuxt, Webpack, Rollup, esbuild, Rspack, Rolldown).
2. Install `@pikacss/unplugin-pikacss` (or `@pikacss/nuxt-pikacss` for Nuxt) and any desired plugins.
3. Set up the build plugin in the bundler config.
4. Create `pika.config.ts` with `defineEngineConfig()`.
5. Add `import 'pika.css'` to the entry file (skip for Nuxt).
6. Demonstrate `pika()` usage with the user's framework.
7. Configure selectors, shortcuts, variables, and keyframes as needed — load `references/customizations.md` for detailed patterns.
8. Add ESLint config if desired.

### Plugin Authoring

1. Understand the user's plugin goal (what CSS behavior to add).
2. Load `references/plugin-development.md` for hooks, engine API, and patterns.
3. Reference official plugins (reset, icons, fonts, typography) as real-world examples.
4. Choose hooks based on needs; use module augmentation for user configuration.
5. Register layers for CSS ordering if injecting preflight CSS.
6. Write tests using `createEngine` from `@pikacss/core`.

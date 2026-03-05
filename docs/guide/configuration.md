# Configuration

PikaCSS is configured through two layers:

1. **Engine Config** — controls the CSS engine (prefix, selectors, variables, keyframes, etc.)
2. **Build Plugin Options** — controls the build integration (file scanning, codegen, transform format)

## Config File

PikaCSS auto-detects config files matching the pattern:

```text
**/pika.config.{js,cjs,mjs,ts,cts,mts}
**/pikacss.config.{js,cjs,mjs,ts,cts,mts}
```

Wrap your config with `defineEngineConfig()` for type-safe IntelliSense. This function is exported from `@pikacss/core` and returns `const T`, preserving the exact literal type of your config for accurate type checking:

<<< @/.examples/guide/config-basic.ts

::: tip Const Type Inference in All `define*` Helpers
All helper functions — `defineEngineConfig`, `defineStyleDefinition`, `definePreflight`, `defineKeyframes`, `defineSelector`, `defineShortcut`, and `defineVariables` — are typed as `<const T>`. They return the exact literal type of their input, enabling precise inference across your config and style definitions.
:::

## Engine Config

### `plugins`

- **Type:** `EnginePlugin[]`
- **Default:** `[]`

Register plugins to extend PikaCSS functionality. Core built-in plugins (`important`, `variables`, `keyframes`, `selectors`, `shortcuts`) are always loaded automatically — you only need to add external plugins here.

<<< @/.examples/guide/config-plugins.ts

### `prefix`

- **Type:** `string`
- **Default:** `''`

A prefix prepended to every generated atomic style ID. Useful for avoiding naming conflicts with other CSS frameworks.

<<< @/.examples/guide/config-prefix.ts

### `defaultSelector`

- **Type:** `string`
- **Default:** `'.%'`

The selector template used for generated atomic styles. The `%` character is a placeholder (`ATOMIC_STYLE_ID_PLACEHOLDER`) that gets replaced with the actual atomic style ID at render time.

<<< @/.examples/guide/config-default-selector.ts

### `preflights`

- **Type:** `Preflight[]`
- **Default:** `[]`

Global CSS injected before atomic styles. Each item can be:

1. A **CSS string** — injected as-is
2. A **preflight definition object** — a CSS-in-JS object (like `{ ':root': { fontSize: '16px' } }`)
3. A **function** `(engine, isFormatted) => string | PreflightDefinition` — dynamically generates CSS using the engine instance
4. A **`WithLayer` wrapper** `{ layer, preflight }` — assigns any of the above to a specific CSS `@layer`

<<< @/.examples/guide/config-preflights.ts

To assign preflights to specific CSS `@layer`s, use the `WithLayer` wrapper:

<<< @/.examples/guide/config-preflights-with-layer.ts

::: tip `definePreflight()` Helper
Use `definePreflight()` from `@pikacss/core` for type-safe preflight definitions. It is an identity function that narrows the type of the argument, making it easier to extract or share preflights across config files:

<<< @/.examples/guide/built-ins/preflights-define-helper.ts
:::

### `layers`

- **Type:** `Record<string, number>`
- **Default:** `{ preflights: 1, utilities: 10 }`

Configure the CSS `@layer` order. Keys are layer names; values are order numbers — lower numbers render first. Custom entries are merged with the defaults, so unspecified layers keep their default order.

::: tip
`sortLayerNames` exported from `@pikacss/core` returns an array of layer names sorted by their order values — useful for debugging or plugin authoring.
:::

<<< @/.examples/guide/config-layers.ts

### `defaultPreflightsLayer`

- **Type:** `string`
- **Default:** `'preflights'`

The CSS `@layer` that preflights without an explicit `layer` property are placed into.

### `defaultUtilitiesLayer`

- **Type:** `string`
- **Default:** `'utilities'`

The CSS `@layer` that atomic utility styles are placed into by default.

## Core Plugin Config

These fields are added to `EngineConfig` via [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) by PikaCSS core plugins. They are always available because core plugins load automatically in `createEngine()`.

### `important`

- **Type:** `{ default?: boolean }`
- **Default:** `{ default: false }`

Controls whether `!important` is appended to all generated CSS declarations. Individual styles can override using the `__important` property.

<<< @/.examples/guide/config-important.ts

### `variables`

- **Type:** `{ variables: Arrayable<VariablesDefinition>, pruneUnused?: boolean, safeList?: string[] }`
- **Default:** `undefined`

Define CSS custom properties (variables) with support for scoped selectors, autocomplete configuration, and unused pruning.

| Sub-option | Type | Default | Description |
|---|---|---|---|
| `variables` | `Arrayable<VariablesDefinition>` | (required) | Variable definitions. Can be a single object or array of objects (merged in order). |
| `pruneUnused` | `boolean` | `true` | Remove unused variables from the final CSS. |
| `safeList` | `string[]` | `[]` | Variables that are always included regardless of usage. |

Each variable value can be:
- A **string/number** — the CSS value (rendered under `:root` by default)
- **`null`** — register for autocomplete only, no CSS output
- A **`VariableObject`** — fine-grained control over value, autocomplete behavior, and pruning

`VariablesDefinition` also supports nested selector keys (for example, `'[data-theme="dark"]'`) to scope variables outside `:root`.

<<< @/.examples/guide/config-variables.ts

::: tip Transitive Variable Tracking
When `pruneUnused` is `true`, PikaCSS uses a breadth-first search to expand `var()` references transitively. If variable `A` references variable `B` in its value (e.g., `--size-lg: calc(var(--size-base) * 4)`), and `A` is used in your styles, `B` is automatically preserved — even if it is not directly referenced in any atomic style.
:::

<<< @/.examples/guide/config-variables-transitive.ts

You can also pass an array of variable definitions that are merged in order:

<<< @/.examples/guide/config-variables-array.ts

### `keyframes`

- **Type:** `{ keyframes: Keyframes[], pruneUnused?: boolean }`
- **Default:** `undefined`

Define CSS `@keyframes` animations with frame definitions and autocomplete suggestions.

| Sub-option | Type | Default | Description |
|---|---|---|---|
| `keyframes` | `Keyframes[]` | (required) | Keyframe definitions. |
| `pruneUnused` | `boolean` | `true` | Remove unused keyframes from the final CSS. |

Each keyframe can be defined as:
- A **string** — animation name only (for autocomplete, no frames generated)
- A **tuple** `[name, frames?, autocomplete?, pruneUnused?]`
- An **object** `{ name, frames?, autocomplete?, pruneUnused? }`

<<< @/.examples/guide/config-keyframes.ts

### `selectors`

- **Type:** `{ selectors: Selector[] }`
- **Default:** `undefined`

Define custom selectors that can be used as keys in style definitions. `$` in the replacement value represents the current element's selector.

| Selector Form | Description |
|---|---|
| `string` | Registered for autocomplete only |
| `[name, replacement]` | Static mapping |
| `[pattern, handler, autocomplete?]` | Dynamic (regex-based) mapping |
| `{ selector, value }` | Object form (static) |
| `{ selector, value, autocomplete? }` | Object form (dynamic) |

<<< @/.examples/guide/config-selectors.ts

### `shortcuts`

- **Type:** `{ shortcuts: Shortcut[] }`
- **Default:** `undefined`

Define reusable style shortcuts — named combinations of style properties or other shortcuts.

| Shortcut Form | Description |
|---|---|
| `string` | Registered for autocomplete only |
| `[name, styleDefinition]` | Static mapping |
| `[pattern, handler, autocomplete?]` | Dynamic (regex-based) mapping |
| `{ shortcut, value }` | Object form (static) |
| `{ shortcut, value, autocomplete? }` | Object form (dynamic) |

<<< @/.examples/guide/config-shortcuts.ts

## Type Helpers

`@pikacss/core` exports a set of identity functions that narrow TypeScript types and provide full autocomplete. Each corresponds to a specific config concept:

| Helper | Purpose |
|---|---|
| `defineEngineConfig()` | Type-safe engine config object |
| `definePreflight()` | Type-safe `Preflight` definition |
| `defineStyleDefinition()` | Type-safe style definition object passed to `pika()` |
| `defineSelector()` | Type-safe `Selector` definition |
| `defineShortcut()` | Type-safe `Shortcut` definition |
| `defineKeyframes()` | Type-safe `Keyframes` definition |
| `defineVariables()` | Type-safe `VariablesDefinition` object |
| `defineEnginePlugin()` | Type-safe engine plugin |

All helpers are exported from `@pikacss/core`. `defineStyleDefinition()` is particularly useful when you want to reuse a style definition object across multiple `pika()` calls:

<<< @/.examples/guide/built-ins/style-definition-define-helper.ts

## Build Plugin Options (`PluginOptions`)

These options are passed to the build plugin (e.g., `pikacss()` in your Vite/Webpack/Rollup config). They control how PikaCSS integrates with your build tool.

| Option | Type | Default | Description |
|---|---|---|---|
| `scan` | `{ include?, exclude? }` | See below | File patterns to scan for `pika()` calls |
| `config` | `EngineConfig \| string` | `undefined` | Inline engine config or path to config file |
| `autoCreateConfig` | `boolean` | `true` | Auto-create a config file if none exists |
| `fnName` | `string` | `'pika'` | Function name to detect in source code |
| `transformedFormat` | `'string' \| 'array' \| 'inline'` | `'string'` | Output format of generated class names |
| `tsCodegen` | `boolean \| string` | `true` | TypeScript codegen file path (`true` = `'pika.gen.ts'`, `false` = disabled) |
| `cssCodegen` | `true \| string` | `true` | CSS codegen file path (`true` = `'pika.gen.css'`) |

### `scan`

Default values:
- `include`: `['**/*.{js,ts,jsx,tsx,vue}']`
- `exclude`: `['node_modules/**', 'dist/**']`

### `transformedFormat`

Controls how `pika()` calls are transformed at build time:

- **`'string'`** — `"a b c"` (space-separated string)
- **`'array'`** — `['a', 'b', 'c']` (array of class names)
- **`'inline'`** — object format for inline use in style objects

<<< @/.examples/guide/config-plugin-options.ts

## Type Exports

PikaCSS exports the following types from `@pikacss/core` for plugin authoring, type annotations, and shared style definitions.

### `PropertyValue<T>`

- **Definition:** `T | [value: T, fallback: T[]] | null | undefined`

Represents a CSS property value. Supports a plain value, a fallback tuple (rendered as `property: primary, fallback`), or `null`/`undefined` to omit the property. This type is used internally by `Properties` and all `StyleDefinitionMap` entries.

### `StyleDefinition` and `StyleDefinitionMap`

`StyleDefinition` is a union of two forms:

```ts
type StyleDefinition = Properties | StyleDefinitionMap
```

- **`Properties`** — a flat CSS property-value map with camelCase or hyphenated keys.
- **`StyleDefinitionMap`** — a selector-keyed object for nested style rules. Keys are selector strings (including custom aliases defined in `config.selectors`); values are `Properties`, nested `StyleDefinition`s, or arrays of style items.

Use `defineStyleDefinition()` for const-preserving inference when defining styles outside a `pika()` call:

<<< @/.examples/guide/type-style-definition-map.ts

## Full Example

A complete config file using all available options:

<<< @/.examples/guide/config-full-example.ts

## Next

- Continue to [Built-in Plugins](/guide/built-in-plugins)

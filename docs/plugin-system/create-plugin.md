# Create a Plugin

This guide walks you through creating a PikaCSS plugin from scratch. Plugins extend the engine with custom variables, shortcuts, selectors, keyframes, preflights, and autocomplete entries — all with full TypeScript type safety.

## Minimal Plugin

A plugin is a plain object with a `name` and optional hooks, wrapped in `defineEnginePlugin()` for type safety:

<<< @/.examples/plugin-system/minimal-plugin.ts

The convention is to export a **factory function** that returns the plugin object. This allows users to pass options:

<<< @/.examples/plugin-system/plugin-with-options.ts

## Plugin Structure

Every plugin has:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Unique identifier for the plugin |
| `order` | `'pre' \| 'post'` | No | Controls execution order relative to other plugins |
| hook functions | — | No | Functions called at various lifecycle stages |

### Execution Order

Plugins are sorted by `order` before hooks run. The execution sequence is: `pre` → (default) → `post`.

<<< @/.examples/plugin-system/plugin-order.ts

::: info Plugin Array Immutability
Plugin arrays passed in the engine config are **not sorted in-place**. A copy is made before sorting, so the original array is never mutated. This means the same plugin array can safely be reused across multiple engine instances without unexpected side effects.
:::

## Lifecycle Hooks

During `createEngine(config)`, hooks fire in this order:

### 1. `configureRawConfig` (async)

Modify the raw config before it is resolved. Return the modified config to pass it to the next plugin.

<<< @/.examples/plugin-system/hook-configure-raw-config.ts

### 2. `rawConfigConfigured` (sync)

Called after all `configureRawConfig` hooks have run. Use this to read the finalized raw config. Return value is ignored.

### 3. `configureResolvedConfig` (async)

Modify the resolved config after default values and plugin resolution have been applied.

<<< @/.examples/plugin-system/hook-configure-resolved-config.ts

### 4. `configureEngine` (async)

The most commonly used hook. Called after the engine is fully constructed. Use this to add variables, shortcuts, selectors, keyframes, preflights, and autocomplete entries.

<<< @/.examples/plugin-system/hook-configure-engine.ts

### Transform Hooks (runtime)

These hooks are called during style extraction at runtime:

<<< @/.examples/plugin-system/hook-transform.ts

### Notification Hooks (sync)

These hooks notify plugins about state changes — they cannot modify payloads:

<<< @/.examples/plugin-system/hook-notifications.ts

::: info Hook Execution Model
- Hooks run plugin-by-plugin in sorted order.
- If an async hook returns a non-null value, that value replaces the payload for the next plugin.
- Hook errors are caught and logged; execution continues to the next plugin.
:::

## Module Augmentation

Use TypeScript module augmentation to add custom config options that are type-safe for end users. This is how the official plugins (icons, reset, typography) add their config fields to `EngineConfig`.

<<< @/.examples/plugin-system/module-augmentation.ts

Users then get full autocomplete when configuring the engine:

<<< @/.examples/plugin-system/use-plugin-in-config.ts

## Adding Preflights

Preflights are global CSS styles injected before atomic styles. The `engine.addPreflight()` method accepts three forms:

### String Preflight

Raw CSS string injected as-is:

<<< @/.examples/plugin-system/preflight-string.ts

### PreflightDefinition Object

A structured object with selectors as keys and CSS properties as values:

<<< @/.examples/plugin-system/preflight-definition.ts

### PreflightFn Function

A function that receives the engine instance and returns a string or `PreflightDefinition`. Useful for dynamic preflights that read engine state:

<<< @/.examples/plugin-system/preflight-function.ts

### WithLayer Wrapper

Wrap any preflight with `WithLayer<T>` — `{ layer, preflight }` — to assign it to a specific CSS `@layer`. The type parameter `T` can be `string`, `PreflightDefinition`, or `PreflightFn`. All three preflight variants are supported:

<<< @/.examples/plugin-system/preflight-with-layer.ts

::: tip Layer Order
Layer rendering order is determined by the `layers` config in `EngineConfig`. Layers with lower numbers are rendered first. Preflights inside a named layer are always rendered inside their respective `@layer` block.
:::

### WithId Wrapper

Wrap any preflight with `WithId<T>` — `{ id, preflight }` — to assign a string identifier to it. The `id` allows other plugins or the engine to identify and deduplicate preflights:

<<< @/.examples/plugin-system/preflight-with-id.ts

::: tip Deduplication
Assigning an `id` is especially useful in plugins that may be initialized multiple times or when multiple plugins register the same baseline styles. The engine skips a preflight if another with the same `id` has already been registered.
:::

## Autocomplete API

Plugins can enrich the TypeScript autocomplete experience by adding custom entries. These APIs are available on the `engine` instance inside `configureEngine`:

<<< @/.examples/plugin-system/autocomplete-api.ts

| Method | Purpose |
|--------|---------|
| `appendAutocompleteSelectors(...selectors)` | Add selector strings to autocomplete |
| `appendAutocompleteStyleItemStrings(...strings)` | Add style item strings (shortcut names, etc.) |
| `appendAutocompleteExtraProperties(...properties)` | Add extra TypeScript properties |
| `appendAutocompleteExtraCssProperties(...properties)` | Add extra CSS properties (e.g. custom CSS variables) |
| `appendAutocompletePropertyValues(property, ...tsTypes)` | Add TypeScript type unions for a property's value |
| `appendAutocompleteCssPropertyValues(property, ...values)` | Add concrete CSS values for a CSS property |

### Layer Name Autocomplete

Plugins that introduce named CSS layers can augment `PikaAugment['Autocomplete']` to register those layer names for TypeScript autocomplete. Users who install the plugin then get suggestions when specifying the `layer` field in a `WithLayer` preflight:

<<< @/.examples/plugin-system/autocomplete-layer-augmentation.ts

::: info
`ResolvedLayerName` (exported from `@pikacss/core`) resolves to the augmented `Layer` union when set, or falls back to `UnionString` (`string & {}`) when no augmentation is present.
:::

## Built-in Engine APIs

Inside `configureEngine`, the engine exposes APIs from the built-in core plugins:

| API | Description |
|-----|-------------|
| `engine.variables.add(definition)` | Add CSS variables with autocomplete support |
| `engine.shortcuts.add(...shortcuts)` | Add static or dynamic shortcuts |
| `engine.selectors.add(...selectors)` | Add static or dynamic selector mappings |
| `engine.keyframes.add(...keyframes)` | Add `@keyframes` animations |
| `engine.addPreflight(preflight)` | Add global preflight CSS (accepts string, `PreflightDefinition`, `PreflightFn`, `WithLayer<T>`, or `WithId<T>`) |
| `engine.config` | Access the resolved engine config |
| `engine.store.atomicStyleIds` | Map of content hash → atomic style ID |
| `engine.store.atomicStyles` | Map of ID → `AtomicStyle` object |

## Real-World Examples

### Reset Plugin (simplified)

Based on `@pikacss/plugin-reset` — uses `order: 'pre'`, `configureRawConfig`, module augmentation, and `engine.addPreflight()`:

<<< @/.examples/plugin-system/real-world-reset.ts

### Typography Plugin (simplified)

Based on `@pikacss/plugin-typography` — uses variables, shortcuts, and module augmentation:

<<< @/.examples/plugin-system/real-world-typography.ts

## Scaffold a Plugin Package

The monorepo includes an interactive scaffolding script:

<<< @/.examples/plugin-system/scaffold-command.sh{bash}

The scaffold generates:

- Package folder at `packages/plugin-<name>/`
- `src/index.ts` with a `defineEnginePlugin` template
- `package.json` with `@pikacss/core` as a peer dependency
- TypeScript and Vitest config files
- A basic test file

The generated factory function follows the pattern `create<PascalName>Plugin(options)` with the plugin `name` set to the slug.

## Publishing Conventions

| Type | Package name pattern |
|------|---------------------|
| Official | `@pikacss/plugin-xxx` |
| Community | `pikacss-plugin-xxx` |

- Export a factory function that returns `EnginePlugin`
- Use module augmentation for config type extension
- Include `pikacss` and `pikacss-plugin` in `package.json` keywords

## Next

- [Icons Plugin](/plugins/icons)
- [Reset Plugin](/plugins/reset)
- [Typography Plugin](/plugins/typography)

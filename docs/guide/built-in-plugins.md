# Built-in Plugins

`createEngine()` always loads five core plugins before appending any user plugins from `config.plugins`.

## Core Plugins

The five built-in plugins are created in this fixed order inside `createEngine()`:

| Order | Plugin Name | Config Key | Purpose |
|-------|------------|------------|---------|
| 1 | `core:important` | `important` | Appends `!important` to CSS values |
| 2 | `core:variables` | `variables` | CSS custom properties with pruning |
| 3 | `core:keyframes` | `keyframes` | `@keyframes` animation management |
| 4 | `core:selectors` | `selectors` | Selector alias resolution |
| 5 | `core:shortcuts` | `shortcuts` | Reusable style shortcuts |

## Plugin Loading & Sorting

After creating core plugins and appending user plugins, **all plugins are sorted together** by their `order` property:

| `order` value | Sort weight | Timing |
|---------------|-------------|--------|
| `'pre'` | 0 | Runs first |
| `undefined` | 1 | Default (core plugins use this) |
| `'post'` | 2 | Runs last |

<<< @/.examples/guide/plugin-loading-order.ts

::: warning
Since core plugins have no `order` set (weight 1), a user plugin with `order: 'pre'` will execute **before** the core plugins. This can be useful for modifying raw config before core plugins process it.
:::

## Hook Execution Pipeline

All plugins (core and user) participate in the same hook pipeline, executed in sort order:

```mermaid
flowchart LR
    A[configureRawConfig] --> B[rawConfigConfigured]
    B --> C[resolveConfig]
    C --> D[configureResolvedConfig]
    D --> E[configureEngine]
```

At runtime, additional hooks fire as styles are processed:

- `transformSelectors` — resolve selector aliases
- `transformStyleItems` — resolve shortcut strings
- `transformStyleDefinitions` — expand `__important` and `__shortcut`
- `preflightUpdated` — variables/keyframes changed
- `atomicStyleAdded` — a new atomic style was registered
- `autocompleteConfigUpdated` — autocomplete metadata changed

## Configuring Built-in Plugins

You configure built-in plugins through top-level keys in `EngineConfig`, not by importing internal factories:

<<< @/.examples/guide/built-in-plugins-config.ts

## Plugin Detail Pages

- [Important](/guide/built-ins/important) — `!important` management
- [Variables](/guide/built-ins/variables) — CSS custom properties
- [Keyframes](/guide/built-ins/keyframes) — `@keyframes` animations
- [Selectors](/guide/built-ins/selectors) — selector aliases
- [Shortcuts](/guide/built-ins/shortcuts) — reusable style shortcuts

## Source Reference

- `packages/core/src/internal/engine.ts` — `createEngine()`, plugin wiring
- `packages/core/src/internal/plugin.ts` — `resolvePlugins()`, hook execution
- `packages/core/src/internal/plugins/` — individual plugin implementations

## Next

- Inspect [Configuration](/guide/configuration)
- Learn the [Plugin System](/plugin-system/overview)
- Dive into [Variables](/guide/built-ins/variables)

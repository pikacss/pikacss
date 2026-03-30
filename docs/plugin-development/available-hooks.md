---
title: Available Hooks
description: Complete reference of PikaCSS engine plugin lifecycle hooks.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/plugin.ts'
  - 'packages/core/src/internal/engine.ts'
category: plugin-development
order: 20
---

# Available Hooks

PikaCSS plugins can implement hooks that run at specific points in the engine lifecycle.

## configureRawConfig

### Signature

```ts
configureRawConfig?: (config: EngineConfig) => void | EngineConfig | Promise<void | EngineConfig>
```

### When

Called during `createEngine()` before the raw config is resolved into its final form. Plugins can mutate the config object in-place or return a new one.

### Example

```ts
defineEnginePlugin({
  name: 'add-layer',
  configureRawConfig: (config) => {
    config.layers ??= {}
    config.layers['my-layer'] = 5
  },
})
```

## rawConfigConfigured

### Signature

```ts
rawConfigConfigured?: (config: EngineConfig) => void
```

### When

Called after `configureRawConfig` has run for all plugins. The raw config is finalized — this is a notification hook for reading the final raw config, not for mutation.

### Example

```ts
defineEnginePlugin({
  name: 'log-config',
  rawConfigConfigured: (config) => {
    console.log('Final raw config:', config)
  },
})
```

## configureResolvedConfig

### Signature

```ts
configureResolvedConfig?: (config: ResolvedEngineConfig) => void | ResolvedEngineConfig | Promise<void | ResolvedEngineConfig>
```

### When

Called after the raw config is resolved into a `ResolvedEngineConfig`. Plugins can adjust resolved values like prefix, layers, or autocomplete state.

### Example

```ts
defineEnginePlugin({
  name: 'override-prefix',
  configureResolvedConfig: (config) => {
    config.prefix = 'custom-'
  },
})
```

## configureEngine

### Signature

```ts
configureEngine?: (engine: Engine) => void | Engine | Promise<void | Engine>
```

### When

Called after the engine instance is constructed. Plugins can add preflights, register autocomplete entries, or extend the engine with custom behavior.

### Example

```ts
defineEnginePlugin({
  name: 'add-preflight',
  configureEngine: async (engine) => {
    engine.addPreflight({
      layer: 'base',
      preflight: '*, *::before, *::after { box-sizing: border-box; }',
    })
  },
})
```

## transformSelectors

### Signature

```ts
transformSelectors?: (selectors: string[]) => string[] | Promise<string[]>
```

### When

Called when selector strings are being resolved during style extraction. Plugins can rewrite, expand, or filter selector values.

### Example

```ts
defineEnginePlugin({
  name: 'dark-mode',
  transformSelectors: (selectors) => {
    return selectors.map(s =>
      s === '@dark' ? 'html.dark $' : s
    )
  },
})
```

## transformStyleItems

### Signature

```ts
transformStyleItems?: (items: InternalStyleItem[]) => InternalStyleItem[] | Promise<InternalStyleItem[]>
```

### When

Called when style items are being processed in `engine.use()`. Plugins can inject, remove, or rewrite style items before they are extracted into atomic styles.

### Example

```ts
defineEnginePlugin({
  name: 'expand-shortcut',
  transformStyleItems: (items) => {
    return items.flatMap(item =>
      item === 'my-shortcut'
        ? [{ display: 'flex' }, { alignItems: 'center' }]
        : [item]
    )
  },
})
```

## transformStyleDefinitions

### Signature

```ts
transformStyleDefinitions?: (definitions: InternalStyleDefinition[]) => InternalStyleDefinition[] | Promise<InternalStyleDefinition[]>
```

### When

Called after style items are converted to style definitions. Plugins can transform definitions before they are extracted into atomic CSS contents.

### Example

```ts
defineEnginePlugin({
  name: 'auto-prefix',
  transformStyleDefinitions: (definitions) => {
    return definitions
  },
})
```

## preflightUpdated

### Signature

```ts
preflightUpdated?: () => void
```

### When

Called whenever a preflight is added or CSS imports change. Use this hook to react to preflight changes.

### Example

```ts
defineEnginePlugin({
  name: 'preflight-watcher',
  preflightUpdated: () => {
    console.log('Preflights changed')
  },
})
```

## atomicStyleAdded

### Signature

```ts
atomicStyleAdded?: (atomicStyle: AtomicStyle) => void
```

### When

Called each time a new atomic style is registered in the engine store. Use this for tracking, analysis, or side effects.

### Example

```ts
defineEnginePlugin({
  name: 'style-tracker',
  atomicStyleAdded: (atomicStyle) => {
    console.log(`New style: ${atomicStyle.id}`)
  },
})
```

## autocompleteConfigUpdated

### Signature

```ts
autocompleteConfigUpdated?: () => void
```

### When

Called whenever the autocomplete configuration changes. Use this to react to new autocomplete entries.

### Example

```ts
defineEnginePlugin({
  name: 'autocomplete-watcher',
  autocompleteConfigUpdated: () => {
    console.log('Autocomplete updated')
  },
})
```

## Next

- [Type Augmentation](/plugin-development/type-augmentation) — extend PikaCSS types.
- [Create a Plugin](/plugin-development/create-a-plugin) — plugin structure and the defineEnginePlugin helper.
- [Define Helpers](/plugin-development/define-helpers) — identity helpers for type inference.

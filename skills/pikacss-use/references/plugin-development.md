# Plugin Development

> Read this when the user wants to create a new PikaCSS engine plugin, modify an existing plugin's internals, understand plugin hooks and lifecycle, extend EngineConfig with module augmentation, or write plugin tests.

## Table of Contents

1. [Plugin Structure](#plugin-structure)
2. [Lifecycle Hooks](#lifecycle-hooks)
3. [Engine API](#engine-api)
4. [Config Augmentation](#config-augmentation)
5. [Real-World Example (plugin-reset)](#real-world-example-plugin-reset)
6. [Testing](#testing)

---

## Plugin Structure

Plugins are plain objects with a `name`, optional `order`, and **direct hook methods** (no `setup()` wrapper):

```ts
import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

export function myPlugin(): EnginePlugin {
  return defineEnginePlugin({
    name: 'my-plugin',
    order: 'pre', // 'pre' | undefined | 'post'

    // hooks go directly on the object:
    configureRawConfig: (config) => {
      // ...
    },
    configureEngine: async (engine) => {
      // ...
    },
  })
}
```

**Order tiers**: `'pre'` → default (`undefined`) → `'post'`. Within a tier, original array order is preserved. There is no `'normal'` value.

`defineEnginePlugin` is an identity helper for type inference only.

## Lifecycle Hooks

All hooks are direct methods on the plugin object.

| Hook | Sync/Async | Signature |
|---|---|---|
| `configureRawConfig` | async | `(config: EngineConfig) => Awaitable<EngineConfig \| void>` |
| `rawConfigConfigured` | sync | `(config: EngineConfig) => void` |
| `configureResolvedConfig` | async | `(resolvedConfig: ResolvedEngineConfig) => Awaitable<ResolvedEngineConfig \| void>` |
| `configureEngine` | async | `(engine: Engine) => Awaitable<Engine \| void>` |
| `transformSelectors` | async | `(selectors: string[]) => Awaitable<string[] \| void>` |
| `transformStyleItems` | async | `(styleItems: ResolvedStyleItem[]) => Awaitable<ResolvedStyleItem[] \| void>` |
| `transformStyleDefinitions` | async | `(styleDefinitions: ResolvedStyleDefinition[]) => Awaitable<ResolvedStyleDefinition[] \| void>` |
| `preflightUpdated` | sync | `() => void` |
| `atomicStyleAdded` | sync | `(atomicStyle: AtomicStyle) => void` |
| `autocompleteConfigUpdated` | sync | `() => void` |

Returning `void`/`null`/`undefined` keeps the current payload unchanged.

### Config Phase

Runs once during engine initialization, in order:

1. **`configureRawConfig`** — Mutate or replace the raw user config before resolution. Good for injecting defaults (layers, preflight layers, fallback options).
2. **`rawConfigConfigured`** — Read-only observation after all plugins have configured the raw config.
3. **`configureResolvedConfig`** — Mutate or replace the resolved config. Runs after internal resolution logic.
4. **`configureEngine`** — Access the fully initialized engine. Register preflights, selectors, shortcuts, keyframes, variables, autocomplete, and CSS imports here.

```ts
configureRawConfig: (config) => {
  config.layers ??= {}
  config.layers.myLayer = 5
},

configureEngine: async (engine) => {
  // addPreflight: plain string
  engine.addPreflight('*, *::before, *::after { box-sizing: border-box; }')
  // addPreflight: wrapped with layer and id
  engine.addPreflight({ layer: 'myLayer', id: 'my-reset', preflight: '/* CSS */' })
  engine.selectors.add(['$:custom', '&:is(:hover, :focus)'])
  engine.shortcuts.add(['my-shortcut', { display: 'flex' }])
  engine.keyframes.add(['fade-in', { from: { opacity: '0' }, to: { opacity: '1' } }])
  engine.variables.add({ '--my-var': 'red' })
},
```

### Transform Phase

Runs each time `pika()` calls are processed:

5. **`transformSelectors`** — Modify selector strings before they are applied.
6. **`transformStyleItems`** — Modify or expand resolved style items.
7. **`transformStyleDefinitions`** — Modify resolved style definitions after flattening.

```ts
transformStyleItems: async (styleItems) => {
  // modify or expand resolved style items
  return styleItems
},

transformStyleDefinitions: async (styleDefinitions) => {
  // modify resolved style definitions
  return styleDefinitions
},
```

### Notification Hooks

Fire after engine state changes:

8. **`preflightUpdated`** — After preflight CSS changes.
9. **`atomicStyleAdded`** — After a new atomic style is registered.
10. **`autocompleteConfigUpdated`** — After autocomplete contributions change.

## Engine API

Methods available on the `engine` object in `configureEngine`:

| Method | Purpose |
|---|---|
| `engine.addPreflight(preflight)` | Add preflight CSS — accepts a plain CSS string, a `PreflightDefinition` (CSS declaration object), a `PreflightFn` (function returning CSS), or a wrapped `{ id?, layer?, preflight }` object |
| `engine.appendAutocomplete(contribution)` | Add autocomplete suggestions — `AutocompleteContribution` has optional fields: `selectors`, `shortcuts`, `extraProperties`, `extraCssProperties`, `properties`, `cssProperties`, `patterns` |
| `engine.appendCssImport(cssImport)` | Add CSS `@import` |
| `engine.selectors.add(...selectors)` | Register named selectors — each arg is a `Selector`: `[name, cssSelector]` tuple or `{ selector, value }` object |
| `engine.shortcuts.add(...shortcuts)` | Register named shortcuts — each arg is a `Shortcut`: `[name, styleItems]` tuple or `{ shortcut, value }` object |
| `engine.keyframes.add(...keyframes)` | Register named keyframes — each arg is a `Keyframes`: `[name, frames]` tuple or `{ name, frames }` object |
| `engine.variables.add(variables)` | Register CSS custom properties — arg is a `VariablesDefinition` record: `{ '--key': 'value', 'html.dark': { '--key': 'dark-value' } }` |
| `engine.use(...items)` | Process style items through the engine |

Render methods (primarily for testing):

| Method | Purpose |
|---|---|
| `engine.renderPreflights(isFormatted)` | Render preflight CSS |
| `engine.renderAtomicStyles(isFormatted, options?)` | Render atomic CSS |
| `engine.renderLayerOrderDeclaration()` | Render `@layer` ordering |

## Config Augmentation

Extend `EngineConfig` via TypeScript module augmentation so users can configure your plugin in `pika.config.ts`:

```ts
declare module '@pikacss/core' {
  interface EngineConfig {
    /** My plugin option. @default 'hello' */
    myOption?: string
  }
}
```

Users then configure via:

```ts
import { defineEngineConfig } from '@pikacss/core'
import { myPlugin } from 'my-plugin'

export default defineEngineConfig({
  plugins: [myPlugin()],
  myOption: 'custom-value',
})
```

## Real-World Example (plugin-reset)

```ts
import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

declare module '@pikacss/core' {
  interface EngineConfig {
    reset?: ResetStyle
  }
}

export function reset(): EnginePlugin {
  let style: ResetStyle = 'modern-normalize'
  return defineEnginePlugin({
    name: 'reset',
    order: 'pre',
    configureRawConfig: (config) => {
      if (config.reset) style = config.reset
      config.layers ??= {}
      config.layers.reset = -1
    },
    configureEngine: async (engine) => {
      const resetCss = resetStyles[style]
      if (resetCss) {
        engine.addPreflight({ layer: 'reset', preflight: resetCss })
      }
    },
  })
}
```

## Testing

Use `createEngine` from `@pikacss/core` with Vitest:

```ts
import { createEngine, defineEngineConfig } from '@pikacss/core'
import { myPlugin } from '../src'

it('should register preflights', async () => {
  const engine = await createEngine(defineEngineConfig({
    plugins: [myPlugin()],
  }))
  const css = await engine.renderPreflights(false)
  expect(css).toContain('/* expected CSS */')
})

it('should register shortcuts', async () => {
  const engine = await createEngine(defineEngineConfig({
    plugins: [myPlugin()],
  }))
  const result = await engine.use({ display: 'flex' }, 'my-shortcut')
  const css = await engine.renderAtomicStyles(false)
  expect(css).toContain('display:flex')
})

it('should augment config', async () => {
  const engine = await createEngine(defineEngineConfig({
    plugins: [myPlugin()],
    myOption: 'custom-value',
  }))
  // verify plugin read the augmented config
})
```

### Testing Tips

- Use `engine.renderPreflights(false)` and `engine.renderAtomicStyles(false)` (unformatted) for simpler snapshot matching.
- Call `engine.use(...)` to feed style items through the engine before rendering atomic styles.
- Test config augmentation by passing augmented options to `defineEngineConfig` and asserting the plugin consumed them correctly.
- Test hook ordering by combining your plugin with a simple spy plugin that records hook invocations.

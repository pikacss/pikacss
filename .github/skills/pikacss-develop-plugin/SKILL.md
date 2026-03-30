---
name: pikacss-develop-plugin
description: 'Help plugin authors create or modify PikaCSS engine plugins and plugin tests. Covers plugin structure, lifecycle hooks, config augmentation, layer management, selectors, shortcuts, preflights, keyframes, variables, and plugin validation. Use when: (1) creating a new PikaCSS engine plugin, (2) modifying an official plugin implementation, (3) understanding plugin hooks and lifecycle, (4) extending EngineConfig with module augmentation, (5) writing or fixing plugin tests. Do not use for consumer installation, app configuration, or troubleshooting usage of already-built plugins; route that work to pikacss-use. This is a skill-only domain guide used directly by the main agent; it has no paired custom agent.'
---

# Develop PikaCSS Plugin

PikaCSS is an instant on-demand atomic CSS-in-JS engine. Plugins extend the engine with custom CSS behaviors — preflights, selectors, shortcuts, keyframes, variables, and style transformations.

- **Plugin Dev Guide**: <https://pikacss.com/plugin-development/>
- **API Reference**: <https://pikacss.com/api/>
- **Source**: <https://github.com/pikacss/pikacss> (see `packages/plugin-*/` for official plugin examples)

## Boundary

- This skill is for authoring plugin code, modifying plugin internals, and validating plugin behavior.
- This is a skill-only domain guide. The main agent should apply it directly instead of delegating to a same-named custom agent.
- Consumer installation, project setup, and troubleshooting how to use an existing plugin in an app are out of scope. Route that work to `pikacss-use`.

## Agent pairing

- Dedicated implementation agent: none
- Dedicated review agent: none
- Use this skill directly in the main conversation for plugin-authoring work.

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

### Config Phase Example

```ts
configureRawConfig: (config) => {
  config.layers ??= {}
  config.layers.myLayer = 5
},

configureEngine: async (engine) => {
  engine.addPreflight({ layer: 'myLayer', preflight: '/* CSS */' })
  engine.selectors.add({ name: '$:custom', selector: '&:is(:hover, :focus)' })
  engine.shortcuts.add({ name: 'my-shortcut', styleItems: [{ display: 'flex' }] })
  engine.keyframes.add({ name: 'fade-in', value: '@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }' })
  engine.variables.add({ variables: [{ name: '--my-var', value: 'red' }] })
},
```

### Transform Phase Example

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

## Engine API

Methods available on the `engine` object in `configureEngine`:

| Method | Purpose |
|---|---|
| `engine.addPreflight(preflight)` | Add preflight CSS |
| `engine.appendAutocomplete(contribution)` | Add autocomplete suggestions |
| `engine.appendCssImport(cssImport)` | Add CSS `@import` |
| `engine.selectors.add(...selectors)` | Register named selectors |
| `engine.shortcuts.add(...shortcuts)` | Register named shortcuts |
| `engine.keyframes.add(...keyframes)` | Register named keyframes |
| `engine.variables.add(variables)` | Register CSS custom properties |
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
```

## Workflow

1. Understand the user's plugin goal (what CSS behavior to add).
2. Reference official plugins for real-world patterns (reset, icons, fonts, typography).
3. Choose hooks based on needs; use module augmentation for user configuration.
4. Register layers for CSS ordering if injecting preflight CSS.
5. Write tests using `createEngine`.

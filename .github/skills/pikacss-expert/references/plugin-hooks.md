# Plugin Hooks Reference

This document provides detailed information about all available plugin hooks in PikaCSS.

## Hook Overview

PikaCSS plugins can hook into various stages of the processing pipeline:

1. **Configuration Phase**: Modify configuration before/after resolution
2. **Setup Phase**: Configure the engine instance
3. **Transform Phase**: Modify selectors, style items, and definitions
4. **Event Phase**: React to style changes

## Hook Execution Order

```
configRaw
  ↓
configResolved
  ↓
setup
  ↓
[During style processing]
  transformSelector
  transformStyleItem
  transformStyleDef
  onStyleChange
  onStyleUpdate
```

## Configuration Hooks

### `configRaw`

Modify the raw configuration before it's resolved.

**Signature:**
```ts
configRaw?: (config: EngineConfigRaw) => EngineConfigRaw | void
```

**When to use:**
- Add default configuration values
- Merge user config with plugin defaults
- Validate configuration early

**Example:**
```ts
configRaw(config) {
  return {
    ...config,
    myPlugin: {
      ...defaultOptions,
      ...config.myPlugin,
    }
  }
}
```

### `configResolved`

Modify the resolved configuration after defaults are applied.

**Signature:**
```ts
configResolved?: (config: EngineConfig) => EngineConfig | void
```

**When to use:**
- Read final configuration values
- Perform validation on resolved config
- Set up internal state based on config

**Example:**
```ts
configResolved(config) {
  const options = config.myPlugin
  // Validate options
  if (options.someValue < 0) {
    throw new Error('someValue must be positive')
  }
}
```

## Setup Hook

### `setup`

Configure the engine instance. This is where you register shortcuts, selectors, variables, etc.

**Signature:**
```ts
setup?: (engine: Engine) => void
```

**When to use:**
- Register shortcuts
- Add custom selectors
- Define CSS variables
- Set up keyframes
- Configure any engine-level features

**Example:**
```ts
setup(engine) {
  // Add shortcuts
  engine.addShortcut('my-shortcut', {
    display: 'flex',
    alignItems: 'center',
  })
  
  // Add custom selector
  engine.addSelector('@custom', (selector) => {
    return `.custom ${selector}`
  })
  
  // Add CSS variable
  engine.addVariable('--my-var', '#3b82f6')
}
```

## Transform Hooks

### `transformSelector`

Transform selector strings before they're processed.

**Signature:**
```ts
transformSelector?: (selector: string) => string | void
```

**When to use:**
- Convert custom selector syntax
- Add prefixes/suffixes to selectors
- Implement custom selector patterns

**Example:**
```ts
transformSelector(selector) {
  // Transform @dark to media query
  if (selector.startsWith('@dark')) {
    return selector.replace('@dark', '@media (prefers-color-scheme: dark)')
  }
}
```

### `transformStyleItem`

Transform individual style items (property-value pairs).

**Signature:**
```ts
transformStyleItem?: (item: StyleItem) => StyleItem | void

interface StyleItem {
  property: string
  value: string
  important: boolean
}
```

**When to use:**
- Modify property values
- Add vendor prefixes
- Convert custom value syntax
- Add/remove !important

**Example:**
```ts
transformStyleItem(item) {
  // Add vendor prefix for specific properties
  if (item.property === 'user-select') {
    return [
      { property: '-webkit-user-select', value: item.value, important: item.important },
      { property: '-moz-user-select', value: item.value, important: item.important },
      item,
    ]
  }
}
```

### `transformStyleDef`

Transform complete style definitions before they're finalized.

**Signature:**
```ts
transformStyleDef?: (def: StyleDef) => StyleDef | void

interface StyleDef {
  id: string
  selector: string
  styles: StyleItem[]
}
```

**When to use:**
- Post-process complete style blocks
- Add additional properties to definitions
- Reorder or filter style items
- Implement complex transformations

**Example:**
```ts
transformStyleDef(def) {
  // Add RTL support
  if (def.styles.some(s => s.property === 'margin-left')) {
    return {
      ...def,
      styles: [
        ...def.styles,
        {
          property: 'margin-inline-start',
          value: def.styles.find(s => s.property === 'margin-left')!.value,
          important: false,
        },
      ],
    }
  }
}
```

## Event Hooks

### `onStyleChange`

Called when individual styles are added or modified.

**Signature:**
```ts
onStyleChange?: (event: StyleChangeEvent) => void

interface StyleChangeEvent {
  type: 'add' | 'update' | 'remove'
  id: string
  def?: StyleDef
}
```

**When to use:**
- Track which styles are being used
- Implement caching strategies
- Log style changes for debugging
- Update external state

**Example:**
```ts
onStyleChange(event) {
  if (event.type === 'add') {
    console.log(`New style added: ${event.id}`)
  }
}
```

### `onStyleUpdate`

Called after a batch of styles has been processed.

**Signature:**
```ts
onStyleUpdate?: (styles: Map<string, StyleDef>) => void
```

**When to use:**
- Perform batch operations on all styles
- Generate summary reports
- Update derived data structures
- Optimize style collection

**Example:**
```ts
onStyleUpdate(styles) {
  console.log(`Total styles: ${styles.size}`)
  
  // Generate optimization report
  const duplicates = findDuplicates(styles)
  if (duplicates.length > 0) {
    console.warn(`Found ${duplicates.length} duplicate styles`)
  }
}
```

## Plugin Order

Control when your plugin runs relative to others using the `order` property:

```ts
export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    order: 'pre', // or 'post' or undefined
    // ... hooks
  }
}
```

**Order values:**
- `'pre'`: Run before default-order plugins
- `undefined` (default): Run in normal order
- `'post'`: Run after default-order plugins

**Example use cases:**
- `'pre'`: Setup plugins that others depend on
- `undefined`: Most plugins
- `'post'`: Cleanup or finalization plugins

## Complete Plugin Example

```ts
import type { Plugin, Engine, EngineConfig, StyleDef, StyleItem } from '@pikacss/core'

export interface MyPluginOptions {
  prefix?: string
  enabled?: boolean
}

export function myPlugin(options: MyPluginOptions = {}): Plugin {
  const { prefix = 'my-', enabled = true } = options
  
  return {
    name: 'my-plugin',
    order: 'pre',
    
    configRaw(config) {
      // Merge config
      return {
        ...config,
        myPlugin: {
          ...options,
          ...config.myPlugin,
        }
      }
    },
    
    configResolved(config) {
      // Validate resolved config
      const pluginConfig = config.myPlugin
      if (!pluginConfig.enabled) {
        console.log('Plugin disabled')
      }
    },
    
    setup(engine) {
      if (!enabled) return
      
      // Register shortcuts
      engine.addShortcut('my-shortcut', {
        display: 'flex',
        alignItems: 'center',
      })
      
      // Add custom selector
      engine.addSelector('@my', (selector) => {
        return `${prefix}${selector}`
      })
    },
    
    transformSelector(selector) {
      if (!enabled) return
      
      // Transform selectors starting with @my
      if (selector.startsWith('@my')) {
        return selector.replace('@my', '.my-custom')
      }
    },
    
    transformStyleItem(item) {
      if (!enabled) return
      
      // Add vendor prefix
      if (item.property === 'appearance') {
        return [
          { property: '-webkit-appearance', value: item.value, important: item.important },
          item,
        ]
      }
    },
    
    transformStyleDef(def) {
      if (!enabled) return
      
      // Add custom property to all definitions
      return {
        ...def,
        styles: [
          ...def.styles,
          { property: '--plugin-applied', value: '"my-plugin"', important: false },
        ],
      }
    },
    
    onStyleChange(event) {
      if (!enabled) return
      
      console.log(`Style ${event.type}: ${event.id}`)
    },
    
    onStyleUpdate(styles) {
      if (!enabled) return
      
      console.log(`Total styles: ${styles.size}`)
    },
  }
}
```

## Async Hooks

**Note:** Currently, PikaCSS hooks are synchronous. Async operations should be completed before the build starts or handled externally.

## Hook Best Practices

1. **Check enabled state**: Return early if your plugin is disabled
2. **Return undefined for no-op**: If your hook doesn't need to transform, return undefined
3. **Don't mutate input**: Always return new objects/arrays
4. **Handle edge cases**: Check for null/undefined values
5. **Log appropriately**: Use console.warn for issues, console.log for info
6. **Validate input**: Check that values are what you expect
7. **Keep it fast**: Hooks run frequently; optimize for performance

## Debugging Hooks

```ts
export function debugPlugin(): Plugin {
  return {
    name: 'debug',
    order: 'post',
    
    transformSelector(selector) {
      console.log('[transformSelector]', selector)
    },
    
    transformStyleItem(item) {
      console.log('[transformStyleItem]', item)
    },
    
    transformStyleDef(def) {
      console.log('[transformStyleDef]', def.id, def.styles.length, 'items')
    },
    
    onStyleChange(event) {
      console.log('[onStyleChange]', event.type, event.id)
    },
    
    onStyleUpdate(styles) {
      console.log('[onStyleUpdate]', styles.size, 'total styles')
    },
  }
}
```

## Type Definitions

For complete type definitions, see the [API Reference](api-reference.md) or import from `@pikacss/core`:

```ts
import type {
  Plugin,
  Engine,
  EngineConfig,
  EngineConfigRaw,
  StyleDef,
  StyleItem,
  StyleChangeEvent,
} from '@pikacss/core'
```

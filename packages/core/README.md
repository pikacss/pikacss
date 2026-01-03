# @pikacss/core

The core Atomic CSS-in-JS engine of PikaCSS.

## Installation

```bash
pnpm add @pikacss/core
```

## Quick Start

**pika.config.ts**:
```typescript
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  // Your configuration
})
```

**Your code**:
```typescript
import { createEngine, defineEngineConfig } from '@pikacss/core'

const config = defineEngineConfig({
  // Engine configuration
  prefix: 'pk-',
  defaultSelector: '.%',
  plugins: []
})

const engine = createEngine(config)
await engine.setup()
```

## Features

- ⚡ High-performance Atomic CSS-in-JS engine
- 🎯 Type-safe with full TypeScript support
- 🔌 Extensible plugin system
- 🎨 Built-in support for shortcuts, selectors, variables, keyframes
- 📦 Works at build-time, zero runtime overhead
- 🔧 Fully configurable
- 🌐 Framework-agnostic core

## Usage for Integration Developers

### Creating an Engine

```typescript
import { createEngine, defineEngineConfig } from '@pikacss/core'

const config = defineEngineConfig({
  // Prefix for generated atomic CSS class names
  prefix: 'pk-',
  
  // Default selector format (% will be replaced with atomic ID)
  defaultSelector: '.%',
  
  // Plugins to extend functionality
  plugins: [],
  
  // Global CSS preflights
  preflights: [],
})

const engine = createEngine(config)
await engine.setup()
```

### Engine Methods

The engine provides methods for managing CSS generation:

```typescript
// Add global CSS
engine.addPreflight('* { box-sizing: border-box; }')

// Access sub-systems
engine.variables  // CSS variables management
engine.keyframes  // CSS keyframes management
engine.selectors  // CSS selectors management
engine.shortcuts  // CSS shortcuts management
engine.important  // Important rules management
```

### Configuration

Use `defineEngineConfig` for type-safe configuration:

```typescript
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  // Prefix for atomic class IDs
  prefix: 'pk-',
  
  // Default selector format (% = atomic ID)
  defaultSelector: '.%',
  
  // Global CSS preflights
  preflights: [
    ':root { --primary: #3b82f6; }',
    // Or function:
    ({ engine, isFormatted }) => '/* Generated CSS */'
  ],
  
  // Shortcuts configuration
  shortcuts: {
    shortcuts: [
      ['flex-center', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }],
    ]
  },
  
  // Plugins to extend functionality
  plugins: []
})
```

## API

### Main Exports

```typescript
// Engine creation
export function createEngine(config: EngineConfig): Engine

// Type-safe config helpers
export function defineEngineConfig(config: EngineConfig): EngineConfig
export function defineEnginePlugin(plugin: EnginePlugin): EnginePlugin
export function defineStyleDefinition(def: StyleDefinition): StyleDefinition
export function definePreflight(preflight: Preflight): Preflight
export function defineKeyframes(keyframes: Keyframes): Keyframes
export function defineSelector(selector: Selector): Selector
export function defineShortcut(shortcut: Shortcut): Shortcut
export function defineVariables(variables: VariablesDefinition): VariablesDefinition

// Utilities
export { log, createLogger } from './internal/utils'
```

### Engine Instance

The `Engine` instance provides methods for managing the CSS generation:

- `engine.setup()` - Initialize the engine with plugins
- `engine.addPreflight(css)` - Add global CSS
- `engine.variables` - Manage CSS variables
- `engine.keyframes` - Manage CSS keyframes
- `engine.selectors` - Manage CSS selectors
- `engine.shortcuts` - Manage CSS shortcuts
- `engine.important` - Manage important rules

## Plugin Development

Create custom plugins to extend PikaCSS:

```typescript
import type { Plugin } from '@pikacss/core'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    
    setup(api) {
      // Add preflights
      api.addPreflight({
        css: '/* your global CSS */'
      })
      
      // Add rules
      api.addRule({
        /* rule configuration */
      })
      
      // Add shortcuts
      api.addShortcut({
        /* shortcut configuration */
      })
      
      // Add variants
      api.addVariant({
        /* variant configuration */
      })
    }
  }
}
```

## Documentation

For complete documentation, visit: [PikaCSS Documentation](https://pikacss.dev)

## License

MIT © DevilTea

# API Reference

## Core Functions

### `pika()`
The main function for generating atomic CSS classes.

#### Signatures
```ts
// Default (returns string)
pika(...styles: (StyleObject | string)[]): string

// Explicit variants
pika.str(...styles: (StyleObject | string)[]): string
pika.arr(...styles: (StyleObject | string)[]): string
pika.inl(...styles: (StyleObject | string)[]): string
```

#### Parameters
- `styles`: Array of style objects or shortcut strings

#### Returns
- `pika.str()`: Space-separated string of class names
- `pika.arr()`: Array of class names
- `pika.inl()`: Space-separated string (same as `.str()`)

#### Examples
```ts
// Single style object
pika({ color: 'red' })

// Multiple style objects
pika({ color: 'red' }, { fontSize: '16px' })

// With shortcuts
pika('flex-center', { padding: '1rem' })

// Array variant
pika.arr({ color: 'red' })
```

### `pikap()`
Preview variant of `pika()`. When you hover over this function in your IDE, it shows the generated CSS.

```ts
pikap({ color: 'red' }) // Hover to see: color: red;
```

## Configuration

### `defineEngineConfig()`
Helper function for creating type-safe engine configuration.

```ts
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
  // Configuration options
})
```

### Configuration Options

#### `plugins`
Type: `Plugin[]`

Array of plugins to register.

```ts
plugins: [icons(), reset()]
```

#### `prefix`
Type: `string`
Default: `''`

Prefix for generated atomic class IDs.

```ts
prefix: 'pika-' // Generates: pika-a, pika-b, etc.
```

#### `defaultSelector`
Type: `string`
Default: `'.%'`

Default selector format (`%` is replaced with atomic ID).

```ts
defaultSelector: '.%' // Class: <div class="a">
defaultSelector: '[data-pika~="%"]' // Attribute: <div data-pika="a">
```

#### `preflights`
Type: `(string | PreflightFunction)[]`

Global CSS injected before atomic styles.

```ts
preflights: [
  ':root { --color: blue; }',
  ({ engine, isFormatted }) => '/* Generated CSS */'
]
```

**PreflightFunction signature:**
```ts
type PreflightFunction = (params: {
  engine: Engine
  isFormatted: boolean
}) => string
```

#### Core Plugin Options

##### `variables`
Manage CSS custom properties.

```ts
variables: {
  // Configuration
}
```

##### `keyframes`
Process @keyframes animations.

```ts
keyframes: {
  // Configuration
}
```

##### `selectors`
Custom selector transformations.

```ts
selectors: {
  // Configuration
}
```

##### `shortcuts`
Style shortcuts configuration.

```ts
shortcuts: {
  shortcuts: [
    ['name', styleObject],
    [/pattern/, transform, autocomplete],
  ]
}
```

##### `important`
Control !important declarations.

```ts
important: {
  default: false // Global default
}
```

## Style Object

### CSS Properties
All standard CSS properties are supported.

```ts
{
  // Standard properties
  display: 'flex',
  color: 'red',
  fontSize: '16px',
  
  // camelCase
  backgroundColor: 'blue',
  
  // kebab-case
  'background-color': 'blue',
  
  // Numbers (converted to px where appropriate)
  margin: 10,
  padding: 20,
}
```

### Special Properties

#### `__important`
Type: `boolean`

Add `!important` to all properties.

```ts
{
  __important: true,
  color: 'red' // Outputs: color: red !important;
}
```

#### `__shortcut`
Type: `string | string[]`

Apply shortcuts within style object.

```ts
{
  __shortcut: 'btn',
  color: 'blue'
}

{
  __shortcut: ['btn', 'text-center']
}
```

### Selectors

Use `$` to represent the current atomic class.

```ts
{
  // Pseudo-classes
  '$:hover': { color: 'blue' },
  '$:focus': { outline: 'none' },
  '$:active': { transform: 'scale(0.98)' },
  
  // Pseudo-elements
  '$::before': { content: '""' },
  '$::after': { display: 'block' },
  
  // Combinators
  '$ > span': { fontWeight: 'bold' },
  '$ + div': { marginTop: '1rem' },
  '$ ~ p': { color: 'gray' },
  
  // Class combinations
  '$.active': { backgroundColor: 'yellow' },
  
  // Parent selectors
  'div > $': { margin: '1rem' },
  '.container $': { padding: '1rem' },
}
```

### At-Rules

```ts
{
  // Media queries
  '@media (min-width: 768px)': {
    width: '50%'
  },
  
  // Feature queries
  '@supports (display: grid)': {
    display: 'grid'
  },
  
  // Custom at-rules (if configured)
  '@dark': {
    backgroundColor: '#000'
  },
}
```

### Nesting

Styles support up to 5 levels of nesting.

```ts
{
  'color': 'red',
  '@media (min-width: 768px)': {
    '$:hover': {
      'color': 'blue',
      '@supports (color: oklch(0 0 0))': {
        color: 'oklch(0.5 0.2 180)'
      }
    }
  }
}
```

## Shortcuts

### Static Shortcut
```ts
['shortcut-name', styleObject]
```

Example:
```ts
['flex-center', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}]
```

### Dynamic Shortcut
```ts
[pattern: RegExp, transform: Function, autocomplete?: string[]]
```

**Transform function signature:**
```ts
type Transform = (match: RegExpMatchArray) => StyleObject
```

Example:
```ts
[
  /^m-(\d+)$/,
  (m) => ({ margin: `${m[1]}px` }),
  ['m-4', 'm-8', 'm-16']
]
```

### Object Syntax
```ts
{
  shortcut: string | RegExp,
  value: StyleObject | Transform,
  autocomplete?: string[]
}
```

Example:
```ts
{
  shortcut: /^p-(\d+)$/,
  value: m => ({ padding: `${m[1]}px` }),
  autocomplete: ['p-4', 'p-8']
}
```

## Plugins

### Plugin Structure

```ts
interface Plugin {
  name: string
  order?: 'pre' | 'post'
  
  // Configuration hooks
  configRaw?: (config: EngineConfigRaw) => EngineConfigRaw | void
  configResolved?: (config: EngineConfig) => EngineConfig | void
  
  // Setup hook
  setup?: (engine: Engine) => void
  
  // Transform hooks
  transformSelector?: (selector: string) => string | void
  transformStyleItem?: (item: StyleItem) => StyleItem | void
  transformStyleDef?: (def: StyleDef) => StyleDef | void
  
  // Event hooks
  onStyleChange?: (event: StyleChangeEvent) => void
  onStyleUpdate?: (styles: Map<string, StyleDef>) => void
}
```

### Creating a Plugin

```ts
export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    order: 'pre',
    
    setup(engine) {
      // Configure engine
    },
    
    transformSelector(selector) {
      // Transform selector
      return transformedSelector
    },
  }
}
```

## Integration APIs

### Vite Plugin

```ts
import { pikacss } from '@pikacss/vite'

pikacss({
  // VitePluginOptions
  config?: string | EngineConfig,
  include?: string | RegExp | (string | RegExp)[],
  exclude?: string | RegExp | (string | RegExp)[],
})
```

### Nuxt Module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pikacss/nuxt'],
  
  pikacss: {
    // NuxtModuleOptions
    config?: string | EngineConfig,
  }
})
```

### Unplugin

```ts
import { pikacss } from '@pikacss/unplugin-pikacss/webpack'
// or '@pikacss/unplugin-pikacss/rspack'
// or '@pikacss/unplugin-pikacss/esbuild'
// or '@pikacss/unplugin-pikacss/farm'

pikacss({
  // UnpluginOptions
  config?: string | EngineConfig,
  include?: string | RegExp | (string | RegExp)[],
  exclude?: string | RegExp | (string | RegExp)[],
})
```

## TypeScript Types

### Import Types

```ts
import type {
  // Core types
  Engine,
  EngineConfig,
  StyleObject,
  StyleDef,
  
  // Plugin types
  Plugin,
  
  // Shortcut types
  Shortcut,
  StaticShortcut,
  DynamicShortcut,
  
  // Transform types
  Transform,
  
  // Utility types
  CSSProperties,
  Selector,
} from '@pikacss/core'
```

### Module Augmentation

Extend PikaCSS types:

```ts
declare module '@pikacss/core' {
  interface EngineConfig {
    myPlugin?: MyPluginConfig
  }
}
```

## CLI (if available)

```bash
# Generate types
pnpm pikacss generate

# Build CSS
pnpm pikacss build

# Watch mode
pnpm pikacss watch
```

## Environment Variables

PikaCSS respects standard build tool environment variables:
- `NODE_ENV`: Affects minification and optimization
- Build-tool-specific variables for dev/prod modes

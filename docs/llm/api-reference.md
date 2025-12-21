---
title: API Reference
description: PikaCSS API reference for LLMs
outline: deep
llmstxt:
  description: PikaCSS API - factory functions, engine methods, type definitions, utility functions
---

# API Reference

This document provides a complete reference of PikaCSS's public APIs.

## Factory Functions

### `createEngine(config?)`
Creates a new PikaCSS engine instance.

```typescript
import { createEngine } from '@pikacss/core'

const engine = await createEngine({
	prefix: 'pk-',
	plugins: []
})
```

### `defineEngineConfig(config)`
Type-safe helper for defining engine configuration.

```typescript
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	// Configuration options
})
```

### `defineEnginePlugin(plugin)`
Type-safe helper for defining custom plugins.

```typescript
import { defineEnginePlugin } from '@pikacss/core'

export function myPlugin() {
	return defineEnginePlugin({
		name: 'my-plugin',
		// Plugin hooks
	})
}
```

## Engine Instance

The `Engine` class is the core of PikaCSS. It manages atomic styles, plugins, and configuration.

### Properties

#### `config: ResolvedEngineConfig`
The resolved configuration object.

#### `store`
Internal storage for atomic styles.
```typescript
engine.store: {
  atomicStyleIds: Map<string, string>  // Content hash -> ID
  atomicStyles: Map<string, AtomicStyle>  // ID -> AtomicStyle
}
```

### Core Methods

#### `use(...items): Promise<string[]>`
Processes style items and returns generated class names.

```typescript
const classNames = await engine.use(
	{ color: 'red' },
	{ fontSize: '16px' }
)
// Returns: ['a', 'b']
```

#### `addPreflight(preflight)`
Adds a preflight (global CSS) to the engine.

```typescript
engine.addPreflight('body { margin: 0; }')

// Or with object format
engine.addPreflight({
	body: { margin: 0, fontFamily: 'sans-serif' }
})

// Or with function
engine.addPreflight((engine, isFormatted) => {
	return { ':root': { '--color': 'blue' } }
})
```

#### `notifyPreflightUpdated()`
Triggers the `preflightUpdated` hook. Call after programmatically modifying preflights.

### Rendering Methods

#### `renderPreflights(isFormatted): Promise<string>`
Renders all preflights as CSS string.

```typescript
const preflightCSS = await engine.renderPreflights(true)
// Returns formatted CSS string
```

#### `renderAtomicStyles(isFormatted, options?): Promise<string>`
Renders atomic styles as CSS string.

```typescript
const css = await engine.renderAtomicStyles(true, {
	// Optional: render only specific styles
	atomicStyleIds: ['a', 'b'],
	// Optional: preview mode
	isPreview: false
})
```

### Extended Properties (via Core Plugins)

These properties are added by core plugins and are always available:

#### `engine.variables`
Manages CSS custom properties.

```typescript
// Access variable store
engine.variables.store: Map<string, ResolvedVariable[]>

// Add variables programmatically
engine.variables.add({
  '--color-primary': '#007bff',
  '--spacing': '8px'
})
```

#### `engine.shortcuts`
Manages style shortcuts.

```typescript
// Add shortcuts programmatically
engine.shortcuts.add(
  ['btn', { padding: '10px', borderRadius: '4px' }],
  [/^m-(\d+)$/, match => ({ margin: `${match[1]}px` })]
)

// Access resolver
engine.shortcuts.resolver: ShortcutResolver
```

#### `engine.selectors`
Manages selector aliases.

```typescript
// Add selectors programmatically
engine.selectors.add(
  [':hover', '$:hover'],
  ['@dark', 'html.dark $']
)

// Access resolver
engine.selectors.resolver: SelectorResolver
```

#### `engine.keyframes`
Manages `@keyframes` animations.

```typescript
// Access keyframes store
engine.keyframes.store: Map<string, ResolvedKeyframesConfig>

// Add keyframes programmatically
engine.keyframes.add(
  ['fadeIn', { from: { opacity: 0 }, to: { opacity: 1 } }]
)
```

### Autocomplete Methods

These methods are used to extend IDE autocomplete suggestions:

#### `appendAutocompleteSelectors(...selectors)`
Adds selectors to autocomplete.

```typescript
engine.appendAutocompleteSelectors(':hover', ':focus', '@dark')
```

#### `appendAutocompleteStyleItemStrings(...strings)`
Adds style item strings (shortcuts) to autocomplete.

```typescript
engine.appendAutocompleteStyleItemStrings('btn', 'flex-center')
```

#### `appendAutocompleteExtraProperties(...properties)`
Adds custom CSS properties to autocomplete.

```typescript
engine.appendAutocompleteExtraProperties('--my-var', '--theme-color')
```

#### `appendAutocompleteExtraCssProperties(...properties)`
Adds CSS properties to autocomplete.

```typescript
engine.appendAutocompleteExtraCssProperties('aspect-ratio', 'backdrop-filter')
```

#### `appendAutocompletePropertyValues(property, ...tsTypes)`
Adds TypeScript types for property value autocomplete.

```typescript
engine.appendAutocompletePropertyValues('display', '"flex"', '"grid"', '"block"')
```

#### `appendAutocompleteCssPropertyValues(property, ...values)`
Adds CSS values for property autocomplete.

```typescript
engine.appendAutocompleteCssPropertyValues('display', 'flex', 'grid', 'block')
```

#### `notifyAutocompleteConfigUpdated()`
Triggers the `autocompleteConfigUpdated` hook.

#### `notifyAtomicStyleAdded(atomicStyle)`
Triggers the `atomicStyleAdded` hook.

## Type Definitions

### `StyleItem`
Input type for `pika()` and `engine.use()`.

```typescript
type StyleItem = string | StyleDefinition | StyleItem[]
```

### `StyleDefinition`
Recursive style object type.

```typescript
interface StyleDefinition {
	[key: string]: string | number | StyleDefinition
	__important?: boolean
	__shortcut?: string | string[]
}
```

### `AtomicStyle`
Internal atomic style representation.

```typescript
interface StyleContent {
	selector: string[]
	property: string
	value: string[]
}

interface AtomicStyle {
	id: string
	content: StyleContent
}
```

### `Preflight`
Preflight input type.

```typescript
type Preflight = string | PreflightDefinition | PreflightFn

interface PreflightDefinition {
	[selector: string]: CSSProperties | PreflightDefinition
}

type PreflightFn = (
	engine: Engine,
	isFormatted: boolean
) => Awaitable<string | PreflightDefinition>
```

### `EnginePlugin`
Plugin definition type.

```typescript
interface EnginePlugin {
	name: string
	order?: 'pre' | 'post'
	configureRawConfig?: (config: EngineConfig) => Awaitable<EngineConfig | void>
	rawConfigConfigured?: (config: EngineConfig) => void
	configureResolvedConfig?: (config: ResolvedEngineConfig) => Awaitable<ResolvedEngineConfig | void>
	configureEngine?: (engine: Engine) => Awaitable<void>
	transformSelectors?: (selectors: string[]) => Awaitable<string[]>
	transformStyleItems?: (items: ResolvedStyleItem[]) => Awaitable<ResolvedStyleItem[]>
	transformStyleDefinitions?: (defs: ResolvedStyleDefinition[]) => Awaitable<ResolvedStyleDefinition[]>
	preflightUpdated?: () => void
	atomicStyleAdded?: (style: AtomicStyle) => void
	autocompleteConfigUpdated?: () => void
}
```

## Utility Functions

### `resolvePreflight(preflight)`
Converts a preflight to a normalized function format.

```typescript
import { resolvePreflight } from '@pikacss/core'

const preflightFn = resolvePreflight('body { margin: 0; }')
```

### `getAtomicStyleId(options)`
Generates a unique ID for an atomic style.

```typescript
import { getAtomicStyleId } from '@pikacss/core'

const id = getAtomicStyleId({
	property: 'color',
	value: ['red'],
	selector: ['.%']
})
```

### `renderAtomicStyles(payload)`
Low-level function to render atomic styles to CSS.

```typescript
import { renderAtomicStyles } from '@pikacss/core'

const css = renderAtomicStyles({
  atomicStyles: [...],
  isFormatted: true
})
```

---
title: Module Augmentation
description: Extend PikaCSS types with TypeScript module augmentation
outline: deep
---

# TypeScript Module Augmentation

When creating plugins that add new configuration options or engine properties, you can use TypeScript module augmentation to provide full type safety.

## Why Module Augmentation?

Module augmentation allows your plugin to:

1. Add new configuration options that appear in `defineEngineConfig`
2. Add new properties to the engine instance
3. Provide full autocomplete support in IDEs

## Basic Pattern

```typescript
import { defineEnginePlugin } from '@pikacss/core'

// Step 1: Declare the module augmentation
declare module '@pikacss/core' {
	interface EngineConfig {
		myPlugin?: {
			option1?: string
			option2?: boolean
		}
	}
}

// Step 2: Create the plugin
export function myPlugin() {
	return defineEnginePlugin({
		name: 'my-plugin',

		configureEngine(engine) {
			// Access typed config
			const options = engine.config.myPlugin
			if (options?.option1) {
				console.log(options.option1)
			}
		}
	})
}
```

## Extending EngineConfig

Add new configuration options:

```typescript
declare module '@pikacss/core' {
	interface EngineConfig {
		/**
		 * Configuration for my custom plugin
		 */
		myPlugin?: {
			/**
			 * Prefix for generated classes
			 * @default 'my-'
			 */
			prefix?: string

			/**
			 * Enable debug mode
			 * @default false
			 */
			debug?: boolean

			/**
			 * Custom theme colors
			 */
			colors?: Record<string, string>
		}
	}
}
```

Now users can configure your plugin:

```typescript
// pika.config.ts
export default defineEngineConfig({
	plugins: [myPlugin()],
	myPlugin: {
		prefix: 'custom-',
		debug: true,
		colors: {
			primary: '#007bff',
			secondary: '#6c757d'
		}
	}
})
```

## Extending Engine (Extra Properties)

Add new properties and methods to the engine instance:

```typescript
declare module '@pikacss/core' {
	interface Engine {
		myPlugin: {
			store: Map<string, CustomData>
			add: (...items: CustomItem[]) => void
			get: (key: string) => CustomData | undefined
		}
	}
}

interface CustomData {
	name: string
	value: string
}

interface CustomItem {
	id: string
	data: CustomData
}

export function myPlugin() {
	return defineEnginePlugin({
		name: 'my-plugin',

		async configureEngine(engine) {
			// Initialize the extra property
			engine.extra.myPlugin = {
				store: new Map(),

				add(...items) {
					items.forEach((item) => {
						engine.extra.myPlugin.store.set(item.id, item.data)
					})
				},

				get(key) {
					return engine.extra.myPlugin.store.get(key)
				}
			}
		}
	})
}
```

::: info Note
Extra properties are added to `engine.extra`, but the type declaration uses `Engine` directly for cleaner access syntax.
:::

## Complete Example

Here's a complete plugin with full type augmentation:

```typescript
import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

// Type declarations
declare module '@pikacss/core' {
	interface EngineConfig {
		/**
		 * Theme plugin configuration
		 */
		theme?: ThemePluginConfig
	}

	interface Engine {
		theme: ThemePluginAPI
	}
}

// Configuration types
interface ThemePluginConfig {
	/**
	 * Default theme name
	 * @default 'light'
	 */
	defaultTheme?: 'light' | 'dark'

	/**
	 * Custom color palette
	 */
	colors?: {
		light?: Record<string, string>
		dark?: Record<string, string>
	}
}

// API types
interface ThemePluginAPI {
	colors: Map<string, string>
	setColor: (name: string, value: string) => void
	getColor: (name: string) => string | undefined
}

// Plugin implementation
export function themePlugin(): EnginePlugin {
	return defineEnginePlugin({
		name: 'theme-plugin',

		async configureEngine(engine) {
			const config = engine.config.theme || {}
			const defaultTheme = config.defaultTheme || 'light'
			const themeColors = config.colors?.[defaultTheme] || {}

			// Initialize API
			const colors = new Map<string, string>()

			// Load initial colors
			Object.entries(themeColors)
				.forEach(([name, value]) => {
					colors.set(name, value)
				})

			// Set up extra property
			engine.extra.theme = {
				colors,

				setColor(name, value) {
					colors.set(name, value)
					// Update CSS variable
					engine.addPreflight({
						':root': { [`--color-${name}`]: value }
					})
					engine.notifyPreflightUpdated()
				},

				getColor(name) {
					return colors.get(name)
				}
			}

			// Add selectors for theme switching
			engine.selectors.add(
				['@light', 'html:not(.dark) $'],
				['@dark', 'html.dark $']
			)

			// Register for autocomplete
			engine.appendAutocompleteSelectors('@light', '@dark')
		}
	})
}
```

Usage:

```typescript
// pika.config.ts
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'
import { themePlugin } from './theme-plugin'

export default defineEngineConfig({
	plugins: [themePlugin()],
	theme: {
		defaultTheme: 'light',
		colors: {
			light: {
				primary: '#007bff',
				background: '#ffffff'
			},
			dark: {
				primary: '#0d6efd',
				background: '#1a1a1a'
			}
		}
	}
})
```

## Best Practices

1. **Use descriptive JSDoc comments**: Document all options with JSDoc for IDE tooltips

2. **Provide sensible defaults**: Don't require all options to be specified

3. **Make config optional**: Use `?` to make the plugin config optional

4. **Export types users might need**: Export interfaces for external use

5. **Follow existing patterns**: Look at core plugins for consistency

```typescript
// Export types for external use
export type { ThemePluginAPI, ThemePluginConfig }
```

## Type Declaration Location

Place your module augmentation:

1. **In the plugin's main file** - For self-contained plugins
2. **In a separate `types.ts` file** - For complex plugins
3. **Ensure it's included in `tsconfig.json`** - Via `include` or `types`

```json
{
	"compilerOptions": {
		"types": ["./node_modules/@my-org/pikacss-plugin-theme/types"]
	}
}
```

---
title: Plugin Development
description: Learn how to create custom PikaCSS plugins
outline: deep
---

# Plugin Development

This guide covers the complete process of creating custom PikaCSS plugins.

## Plugin Anatomy

A PikaCSS plugin is created using the `defineEnginePlugin` helper:

```typescript
import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

export function myPlugin(): EnginePlugin {
	return defineEnginePlugin({
		name: 'my-plugin',

		// Optional: Set plugin execution order
		order: 'post', // 'pre' | 'post' | undefined

		// Hooks...
	})
}
```

## Plugin Execution Order

Plugins can specify an `order` property to control execution order:

| Order | Description |
|-------|-------------|
| `'pre'` | Runs before default-order plugins |
| `undefined` | Runs in normal order (default) |
| `'post'` | Runs after default-order plugins |

```typescript
defineEnginePlugin({
	name: 'my-pre-plugin',
	order: 'pre', // Runs first
})
```

## Basic Example

Here's a simple plugin that adds a custom CSS property:

```typescript
import { defineEnginePlugin } from '@pikacss/core'

export function sizePlugin() {
	return defineEnginePlugin({
		name: 'size-plugin',

		async transformStyleDefinitions(defs) {
			return defs.map((def) => {
				if ('size' in def) {
					const { size, ...rest } = def
					return { ...rest, width: size, height: size }
				}
				return def
			})
		}
	})
}
```

Usage:

```typescript
pika({
	size: '100px' // Transforms to width: 100px; height: 100px;
})
```

## Advanced Example: Adding Shortcuts

```typescript
import { defineEnginePlugin } from '@pikacss/core'

export function utilityPlugin() {
	return defineEnginePlugin({
		name: 'utility-plugin',

		async configureEngine(engine) {
			// Add static shortcuts
			engine.shortcuts.add(
				['flex-center', {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}],
				['text-ellipsis', {
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap'
				}]
			)

			// Add dynamic shortcuts
			engine.shortcuts.add(
				[/^grid-cols-(\d+)$/, match => ({
					display: 'grid',
					gridTemplateColumns: `repeat(${match[1]}, minmax(0, 1fr))`
				}), ['grid-cols-2', 'grid-cols-3', 'grid-cols-4']]
			)

			// Register for autocomplete
			engine.appendAutocompleteStyleItemStrings(
				'flex-center',
				'text-ellipsis'
			)
		}
	})
}
```

## Plugin with Configuration

Plugins can accept configuration options:

```typescript
import { defineEnginePlugin } from '@pikacss/core'

interface MyPluginOptions {
	prefix?: string
	enabled?: boolean
}

export function myPlugin(options: MyPluginOptions = {}) {
	const { prefix = 'my-', enabled = true } = options

	return defineEnginePlugin({
		name: 'my-plugin',

		async configureEngine(engine) {
			if (!enabled)
				return

			engine.shortcuts.add(
				[`${prefix}button`, { padding: '10px 20px' }]
			)
		}
	})
}
```

## Accessing Engine State

The `configureEngine` hook provides access to the full engine instance:

```typescript
async configureEngine(engine) {
  // Access configuration
  const config = engine.config

  // Access stored atomic styles
  const atomicStyles = engine.store.atomicStyles

  // Add preflights
  engine.addPreflight({
    ':root': {
      '--plugin-color': '#007bff'
    }
  })

  // Notify when preflight changes
  engine.notifyPreflightUpdated()

  // Add to autocomplete
  engine.appendAutocompleteSelectors('@custom')
  engine.appendAutocompleteExtraProperties('--my-var')
}
```

## Reacting to Events

Some hooks allow you to react to engine events:

```typescript
defineEnginePlugin({
	name: 'logger-plugin',

	// Called when preflight is updated
	preflightUpdated() {
		console.log('Preflight styles were updated')
	},

	// Called when a new atomic style is added
	atomicStyleAdded(atomicStyle) {
		console.log('New atomic style:', atomicStyle.id)
	},

	// Called when autocomplete config changes
	autocompleteConfigUpdated() {
		console.log('Autocomplete config was updated')
	}
})
```

## Best Practices

1. **Give descriptive names**: Use a name that reflects the plugin's functionality

2. **Document configuration options**: Provide JSDoc comments for all options

3. **Handle errors gracefully**: Wrap potentially failing code in try-catch

4. **Use TypeScript**: Leverage type safety for better developer experience

5. **Follow async/sync patterns**: Respect the hook types (async vs sync)

6. **Provide autocomplete hints**: Always register shortcuts/selectors for IDE support

```typescript
// Good: Descriptive name and documented options
/**
 * Adds responsive utility shortcuts
 * @param options - Plugin configuration
 * @param options.breakpoints - Custom breakpoint values
 */
export function responsivePlugin(options?: ResponsiveOptions) {
	return defineEnginePlugin({
		name: 'responsive-utilities',
		// ...
	})
}
```

## Testing Plugins

You can test plugins by creating an engine instance:

```typescript
import { createEngine } from '@pikacss/core'
import { myPlugin } from './my-plugin'

const engine = await createEngine({
	plugins: [myPlugin()]
})

// Test that the plugin works
const classes = await engine.use({ size: '100px' })
console.log(classes) // ['a', 'b']
```

## Publishing Plugins

When publishing a plugin:

1. Export both the plugin function and TypeScript types
2. Include `@pikacss/core` as a peer dependency
3. Document all configuration options in README
4. Provide usage examples

```json
{
	"name": "@my-org/pikacss-plugin-example",
	"peerDependencies": {
		"@pikacss/core": "^0.0.1"
	}
}
```

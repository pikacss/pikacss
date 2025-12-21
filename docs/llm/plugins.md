---
title: Plugins System
description: PikaCSS plugin system reference for LLMs
outline: deep
llmstxt:
  description: PikaCSS plugins - core plugins, custom plugins, hooks, module augmentation
---

# Plugins System

PikaCSS is highly extensible through plugins.

## Core Plugins

PikaCSS includes 5 built-in core plugins (always loaded in this order):

1. **`important()`** - Handles `__important` property for adding `!important`
2. **`variables()`** - Manages CSS custom properties
3. **`keyframes()`** - Handles `@keyframes` animation definitions
4. **`selectors()`** - Resolves custom selector aliases
5. **`shortcuts()`** - Resolves style shortcuts/aliases

### Shortcuts Example
```typescript
shortcuts: [
	// Static shortcut
	['btn', { padding: '10px', borderRadius: '4px' }],
	// Dynamic shortcut (RegExp)
	[/^m-(\d+)$/, match => ({ margin: `${match[1]}px` })]
]
```

### Variables Example
```typescript
variables: {
  variables: {
    '--color-primary': '#007bff',
    '--spacing': '8px'
  }
}
```

### Keyframes Example
```typescript
keyframes: [
	['fadeIn', { from: { opacity: 0 }, to: { opacity: 1 } }]
]
```

## Creating Custom Plugins

You can create plugins using `defineEnginePlugin`.

```typescript
import { defineEnginePlugin } from '@pikacss/core'

export function myPlugin() {
	return defineEnginePlugin({
		name: 'my-plugin',

		// Plugin execution order: 'pre' | 'post' | undefined (default)
		// 'pre' runs before default plugins, 'post' runs after
		order: 'post',

		// Hook: Configure the raw config before resolution
		configureRawConfig(config) {
			// Modify config before it's processed
			return config
		},

		// Hook: Called after raw config is configured (sync)
		rawConfigConfigured(config) {
			// Read-only access to config
		},

		// Hook: Configure the resolved config
		configureResolvedConfig(resolvedConfig) {
			return resolvedConfig
		},

		// Hook: Configure the engine (add shortcuts, etc.)
		configureEngine(engine) {
			engine.shortcuts.add({
				shortcut: 'text-brand',
				value: { color: 'blue' }
			})
		},

		// Hook: Transform selector strings
		async transformSelectors(selectors) {
			return selectors
		},

		// Hook: Transform style items before resolution
		async transformStyleItems(styleItems) {
			return styleItems
		},

		// Hook: Transform resolved style definitions
		async transformStyleDefinitions(defs) {
			return defs.map((def) => {
				if ('size' in def) {
					const { size, ...rest } = def
					return { ...rest, width: size, height: size }
				}
				return def
			})
		},

		// Hook: Called when preflight is updated (sync)
		preflightUpdated() {
			// React to preflight changes
		},

		// Hook: Called when an atomic style is added (sync)
		atomicStyleAdded(atomicStyle) {
			// React to new atomic style
		},

		// Hook: Called when autocomplete config is updated (sync)
		autocompleteConfigUpdated() {
			// React to autocomplete changes
		}
	})
}
```

## Plugin Hooks Reference

| Hook | Type | Description |
|------|------|-------------|
| `configureRawConfig` | async | Modify raw config before resolution |
| `rawConfigConfigured` | sync | Read-only access after raw config is set |
| `configureResolvedConfig` | async | Modify resolved config |
| `configureEngine` | async | Access and configure the engine instance |
| `transformSelectors` | async | Transform selector strings |
| `transformStyleItems` | async | Transform style items before resolution |
| `transformStyleDefinitions` | async | Transform resolved style definitions |
| `preflightUpdated` | sync | React to preflight changes |
| `atomicStyleAdded` | sync | React to new atomic styles |
| `autocompleteConfigUpdated` | sync | React to autocomplete changes |

## Plugin Order

Plugins can specify an `order` property to control execution order:

- **`'pre'`**: Runs before default-order plugins
- **`undefined`** (default): Runs in normal order
- **`'post'`**: Runs after default-order plugins

```typescript
defineEnginePlugin({
	name: 'my-pre-plugin',
	order: 'pre', // Runs first
	// ...
})
```

## TypeScript Module Augmentation

When creating plugins that add new config options, use TypeScript module augmentation:

```typescript
import { defineEnginePlugin } from '@pikacss/core'

// Extend the EngineConfig interface
declare module '@pikacss/core' {
	interface EngineConfig {
		myPlugin?: {
			option1?: string
			option2?: boolean
		}
	}
}

export function myPlugin() {
	return defineEnginePlugin({
		name: 'my-plugin',
		configureEngine(engine) {
			const options = engine.config.myPlugin
			// Use options...
		}
	})
}
```

## Official Plugins

- **[@pikacss/plugin-icons](./icons-plugin.md)** - Icon support via Iconify

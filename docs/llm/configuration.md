---
title: Configuration
description: PikaCSS configuration reference for LLMs
outline: deep
llmstxt:
  description: PikaCSS configuration - engine config, preflights, variables, shortcuts, selectors, keyframes
---

# Configuration

## Engine Configuration (`pika.config.ts`)

This file configures the core behavior of the PikaCSS engine.

```typescript
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	prefix: 'pk-',
	defaultSelector: '.%',
	plugins: [],
	preflights: [],
	variables: {},
	shortcuts: [],
	selectors: {},
	keyframes: [],
	important: {}
})
```

## Core Options

### `prefix`
String prefix added to all generated atomic class IDs.

```typescript
prefix: 'pk-'
// Generated class: 'pk-a' instead of 'a'
```

### `defaultSelector`
Defines the CSS selector format. `%` is replaced by the atomic ID.

```typescript
defaultSelector: '.%' // Class selector (default)
defaultSelector: '[data-p~="%"]' // Attribute selector
```

## Preflights

Global CSS injected before atomic styles. Supports three formats:

### String Format
```typescript
preflights: [
	'body { margin: 0; font-family: sans-serif; }'
]
```

### Object Format (PreflightDefinition)
```typescript
preflights: [
	{
		':root': {
			'--color-primary': '#007bff',
			'--color-secondary': '#6c757d'
		},
		'body': {
			margin: 0,
			fontFamily: 'sans-serif'
		},
		// Nested structures supported
		'@media (prefers-color-scheme: dark)': {
			':root': {
				'--color-bg': '#1a1a1a',
				'--color-text': '#ffffff'
			}
		}
	}
]
```

### Function Format (Dynamic Preflights)
```typescript
preflights: [
	(engine, isFormatted) => {
		// Access engine state to generate dynamic CSS
		return {
			':root': {
				'--dynamic-var': 'computed-value'
			}
		}
	}
]
```

## Variables

CSS custom properties configuration.

```typescript
variables: {
  // Remove unused variables from output (default: true)
  pruneUnused: true,

  // Variables to always keep (even if unused)
  safeList: ['--external-var', '--always-keep'],

  variables: {
    // Simple value
    '--color-primary': '#007bff',
    '--spacing': '8px',

    // Declare without value (for external variables)
    '--external-var': null,

    // Full configuration object
    '--color-bg': {
      value: '#ffffff',
      pruneUnused: false,  // Override global setting
      autocomplete: {
        // Properties this variable can be used with
        asValueOf: ['background-color', 'background'],
        // Show in CSS property autocomplete
        asProperty: true
      }
    },

    // Hide from autocomplete
    '--internal-only': {
      value: '16px',
      autocomplete: {
        asValueOf: '-',     // Don't suggest as value
        asProperty: false   // Don't show as property
      }
    },

    // Nested selector context
    '[data-theme="dark"]': {
      '--color-bg': '#000000',
      '--color-text': '#ffffff'
    },

    // Media query context
    '@media (prefers-color-scheme: dark)': {
      ':root': {
        '--color-bg': '#1a1a1a'
      }
    }
  }
}
```

### Variable Autocomplete Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `asValueOf` | `string \| string[] \| '*' \| '-'` | `'*'` | Properties this variable can be used with. `'*'` = all, `'-'` = none |
| `asProperty` | `boolean` | `true` | Whether to show in CSS property autocomplete |

## Important

Configuration for `!important` modifier.

```typescript
important: {
  // Apply !important to all styles by default
  default: false  // or true
}
```

Use `__important` in style objects to override:

```typescript
// When important.default is false
pika({ __important: true, color: 'red' }) // color: red !important

// When important.default is true
pika({ __important: false, color: 'red' }) // color: red (no !important)
```

## Shortcuts

Define reusable style aliases. See [Plugins](./plugins.md) for details.

```typescript
shortcuts: [
	// Static shortcut
	['btn', { padding: '10px 20px', borderRadius: '4px' }],

	// Dynamic shortcut (RegExp)
	[/^m-(\d+)$/, match => ({ margin: `${match[1]}px` })],

	// With autocomplete hints
	[/^p-(\d+)$/, match => ({ padding: `${match[1]}px` }), ['p-4', 'p-8', 'p-16']]
]
```

## Selectors

Define custom selector aliases. See [Selectors](./selectors.md) for details.

```typescript
selectors: {
	selectors: [
		// Static selector
		['@light', 'html:not(.dark) $'],
		['@dark', 'html.dark $'],
		[':hover', '$:hover'],

		// Dynamic selector (RegExp)
		[/^@screen-(\d+)$/, m => `@media (min-width: ${m[1]}px)`]
	]
}
```

## Keyframes

Define CSS `@keyframes` animations.

```typescript
keyframes: [
	['fadeIn', {
		from: { opacity: 0 },
		to: { opacity: 1 }
	}],
	['slideIn', {
		'0%': { transform: 'translateX(-100%)' },
		'100%': { transform: 'translateX(0)' }
	}]
]
```

Usage:
```typescript
pika({
	animation: 'fadeIn 0.3s ease-in-out'
})
```

## Plugins

Add custom or official plugins. See [Plugins](./plugins.md) for details.

```typescript
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
	plugins: [
		icons()
	],
	// Plugin-specific config
	icons: {
		prefix: 'i-',
		scale: 1.2
	}
})
```

## Build Plugin Options

These options are passed to the bundler plugin (not in `pika.config.ts`).

```typescript
// vite.config.ts
import PikaCSS from '@pikacss/unplugin-pikacss/vite'

export default {
	plugins: [
		PikaCSS({
			// File scanning configuration
			scan: {
				include: ['**/*.{js,ts,jsx,tsx,vue,svelte}'],
				exclude: ['node_modules/**']
			},

			// Config file path
			config: './pika.config.ts',

			// Auto-create config if missing
			autoCreateConfig: true,

			// Function name to detect (default: 'pika')
			fnName: 'pika',

			// Default output format
			transformedFormat: 'string', // 'string' | 'array' | 'inline'

			// Generate pika.gen.ts
			tsCodegen: true, // or path string

			// Generate pika.gen.css
			cssCodegen: true // or path string
		})
	]
}
```

### Build Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scan.include` | `string[]` | `['**/*.{js,ts,jsx,tsx,vue}']` | Files to process |
| `scan.exclude` | `string[]` | `['node_modules/**']` | Files to ignore |
| `config` | `string \| object` | `'pika.config.ts'` | Config file path or inline config |
| `autoCreateConfig` | `boolean` | `true` | Auto-create config file |
| `fnName` | `string` | `'pika'` | Function name to detect |
| `transformedFormat` | `string` | `'string'` | Default output format |
| `tsCodegen` | `boolean \| string` | `true` | Generate TypeScript types |
| `cssCodegen` | `boolean \| string` | `true` | Generate CSS file |

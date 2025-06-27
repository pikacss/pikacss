---
title: Variables
description: Learn how to use CSS variables in PikaCSS
outline: deep
---

# Variables

CSS variables (custom properties) are powerful features in modern web development that allow for dynamic styling, theme switching, and code reusability. PikaCSS provides a robust system for declaring, managing, and using CSS variables in your project.

## How Variables Work in PikaCSS

In PikaCSS, CSS variables can be defined in your configuration and automatically added to your `:root` element. This allows for:

- Consistent design tokens across your application
- Dynamic theme switching using CSS variables
- Type-safe variable usage with TypeScript support
- Better organization of your design system

## Defining Variables

You can define variables in your `pika.config.ts` file:

```ts
import { defineEngineConfig } from '@pikacss/vite-plugin-pikacss'

export default defineEngineConfig({
	variables: {
		variables: {
			// Basic usage
			'--color-primary': '#ff007f',
			'--font-sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
			'--spacing-base': '1rem',

			// External variables, only for autocomplete
			'--external-variable': null,

			// With options
			'--color-secondary': {
				value: '#6b21a8',
				autocomplete: {
					asValueOf: ['color', 'background-color', 'border-color'],
					asProperty: true
				}
			},

			// With selectors
			'[data-theme=dark]': {
				'--bg-surface': '#121212',

				'.nested': {
					'--bg-nested': '#1e1e1e',
				}
			}
		},
	}
})
```

## Variable Configuration Options

Each variable can be defined with the following options:

| Option | Description |
|--------|-------------|
| `value` | The value of the CSS variable |
| `autocomplete` | Configuration for TypeScript autocomplete (optional) |
| `pruneUnused` | Whether to remove unused variables from the final CSS (defaults to `true`) |

### Autocomplete Options

The `autocomplete` object allows you to control how the variable appears in TypeScript autocomplete:

```ts
const autocomplete = {
	// Specify which CSS properties can use this variable as a value
	// Use '*' for all properties, or specific property names
	asValueOf: ['color', 'background-color'],

	// Whether to add the variable as a CSS property itself
	asProperty: true,
}
```

## Using Variables in Styles

Once defined, you can use your CSS variables in your styles:

```ts
// Using a CSS variable in styles
pika({
	// As a property value
	color: 'var(--color-primary)',
	backgroundColor: 'var(--color-secondary)',

	// In calculations
	padding: 'calc(var(--spacing-base) * 2)',
	margin: 'calc(var(--spacing-base) / 2)',

	// With fallbacks
	fontFamily: 'var(--font-custom, var(--font-sans))'
})
```

## Variables with TypeScript Support

When you define variables in your configuration, PikaCSS automatically generates TypeScript definitions, providing autocomplete:

```ts
// TypeScript will show autocomplete for your defined variables
pika({
	color: 'var(--color-primary)', // ✓ Valid - autocomplete works
	backgroundColor: 'var(--unknown-variable)' // ✗ Error - unknown variable
})
```

## Variable Pruning

By default, PikaCSS performs "pruning" of unused variables, meaning that only variables actually used in your styles will be included in the final CSS output. This helps to minimize your CSS bundle size.

You can disable this behavior globally or per variable:

```ts
export default defineEngineConfig({
	variables: {
		// Disable pruning globally
		pruneUnused: false,
		// Variables to always include
		safeList: ['--included-by-safelist'],

		variables: {
			// This variable will be included even if unused
			'--always-included': {
				value: 'value',
				pruneUnused: false, // Disable pruning for this variable
			},
			// This variable follows the global setting (pruned if unused)
			'--maybe-pruned': 'value',

			'--included-by-safelist': 'value'
		},
	}
})
```

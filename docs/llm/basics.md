---
title: Basics & Syntax
description: PikaCSS pika() function and syntax reference for LLMs
outline: deep
llmstxt:
  description: PikaCSS basics - pika() function, style objects, output variants, special properties
---

# Basics & Syntax

## The `pika()` Function

The core of PikaCSS is the `pika()` function. It accepts a JavaScript object defining your styles and returns a string of atomic class names.

```typescript
const className = pika({
	'color': 'red',
	'fontSize': '16px',
	'$:hover': {
		color: 'blue'
	}
})
// Output (example): "a b c"
```

## Style Object Syntax

- **Properties**: Use camelCase (e.g., `backgroundColor`) or kebab-case (e.g., `'background-color'`).
- **Values**: Strings or numbers.
- **Nesting**: Use selectors as keys for nested styles.
  - `$`: Represents the current element (like `&` in SCSS).
  - `$:hover`: Pseudo-class.
  - `@media ...`: Media queries.

```typescript
pika({
	'display': 'flex',
	// Nested selector
	'$:hover': {
		opacity: 0.8
	},
	// Media query
	'@media (min-width: 768px)': {
		flexDirection: 'row'
	}
})
```

## Output Variants

PikaCSS provides variants of the main function to control the output format.

### `pika.str(...)` (Default)
Returns a space-separated string of class names.
```typescript
const classes = pika.str({ color: 'red' }) // "a"
```

### `pika.arr(...)`
Returns an array of class names. Useful for frameworks that accept class arrays (e.g., some React patterns).
```typescript
const classList = pika.arr({ color: 'red' }) // ["a"]
```

### `pika.inl(...)`
Returns a space-separated string of atomic class names, similar to `pika.str()`. This variant is provided for semantic clarity when the result is intended for use in contexts where inline-like behavior is expected.
```typescript
const style = pika.inl({ color: 'red' }) // "a" (class name)
```

> **Note**: Despite the name, `pika.inl()` does NOT return raw CSS properties. All `pika` variants generate atomic classes.

## Previewing Styles
In VS Code, you can often hover over the `pika` function call (or `pikap` if configured) to see the generated CSS in a tooltip. This helps verify what styles are being applied.

## Special Properties

PikaCSS supports special properties (prefixed with `__`) that modify how styles are processed.

### `__important`
Adds `!important` to all CSS properties in the style object.

```typescript
pika({
	__important: true,
	color: 'red',
	fontSize: '16px'
})
// Output CSS: color: red !important; font-size: 16px !important;
```

You can also set `__important: false` to override a global default (when `important.default: true` is set in config).

### `__shortcut`
Applies a shortcut by name within a style object.

```typescript
// If you have a shortcut defined: ['btn', { padding: '10px', borderRadius: '4px' }]
pika({
	__shortcut: 'btn',
	color: 'blue' // Additional styles
})
// Equivalent to: pika({ padding: '10px', borderRadius: '4px', color: 'blue' })
```

You can also use an array to apply multiple shortcuts:
```typescript
pika({
	__shortcut: ['btn', 'text-center']
})
```

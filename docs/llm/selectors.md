---
title: Selectors
description: PikaCSS selectors reference for LLMs
outline: deep
llmstxt:
  description: PikaCSS selectors - static, dynamic, nesting rules
---

# Selectors

Selectors allow you to define custom keys that map to complex CSS selectors or media queries.

## Configuration

Define selectors in `pika.config.ts`.

```typescript
export default defineEngineConfig({
	selectors: {
		selectors: [
			// Static
			[':hover', '$:hover'],
			['@dark', 'html.dark $'],

			// Dynamic (RegExp)
			[/^@screen-(\d+)$/, m => `@media (min-width: ${m[1]}px)`]
		]
	}
})
```

## Usage

```typescript
pika({
	'color': 'black',
	// Use static selector
	':hover': { color: 'blue' },
	// Use dynamic selector
	'@screen-768': { fontSize: '20px' }
})
```

## Types of Selectors

1. **Static Selectors**: Simple mapping.
   - `['alias', 'replacement']`
   - `$` is replaced by the generated class name.
2. **Dynamic Selectors**: RegExp matching.
   - `[RegExp, ReplacementFunction, AutocompleteArray]`
   - Useful for breakpoints, grid spans, etc.

## Nesting

PikaCSS supports nesting up to **5 levels** deep.

```typescript
pika({
	'@screen-md': {
		':hover': {
			opacity: 1
		}
	}
})
```

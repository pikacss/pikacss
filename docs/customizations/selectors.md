---
title: Selectors
description: Define custom selector mappings for concise nested style definitions.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/plugins/selectors.ts'
category: customizations
order: 60
---

# Selectors

Map short names to CSS selector patterns for concise nested style definitions.

Custom selectors let you define short, readable names for complex CSS selectors. Instead of writing full `@media` queries or compound selectors repeatedly, define them once and reference them by name in your style definitions.

The `$` placeholder in a selector value is replaced with the generated atomic class selector.

## Config

A selector definition accepts several shapes:

- **Static tuple** `[name, cssSelector]` — maps an exact name to one or more resolved CSS selectors.
- **Dynamic tuple** `[RegExp, resolver, autocomplete?]` — matches a pattern and computes the selector lazily. The optional third element lists autocomplete suggestions for the pattern (e.g. `'@container-${name}'`). The resolver may return `undefined`/`null` to signal "unresolved for now": nothing is cached and the rule is retried on a later resolve call.
- **Object form** — `{ selector, value }` (static) or `{ selector, value, autocomplete? }` (dynamic), equivalent to the tuples.
- **Plain string** — registers the name as an autocomplete suggestion only, useful for redirecting to a selector resolved elsewhere.

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  selectors: {
    definitions: [
      // Static pair: [name, cssSelector]
      ['@dark', 'html.dark $'],
      ['@light', 'html:not(.dark) $'],

      // Media query selectors
      ['@sm', '@media (min-width: 640px)'],
      ['@md', '@media (min-width: 768px)'],
      ['@lg', '@media (min-width: 1024px)'],
      ['@xl', '@media (min-width: 1280px)'],

      // Dynamic pattern: [RegExp, resolver, autocomplete?]
      [/^@container-(.+)$/, ([, name]) => `@container ${name}`, '@container-${name}'],

      // Object form
      {
        selector: '@print',
        value: '@media print',
      },
    ],
  },
})
```

Use custom selectors in style definitions:

```ts
pika({
  'color': 'black',
  '@dark': { color: 'white' },
  '@sm': { fontSize: '14px' },
  '@lg': { fontSize: '18px' },
})
```

## Examples

<<< @/.examples/customizations/selectors.example.ts

## Next

- [Shortcuts](/customizations/shortcuts) — create reusable style aliases.
- [Variables](/customizations/variables) — define CSS custom properties.

---
title: Selectors
description: Define custom selector mappings for concise nested style definitions.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/plugins/selectors.ts'
category: customizations
order: 60
---

# Selectors

Map short names to CSS selector patterns for concise nested style definitions.

Custom selectors let you define short, readable names for complex CSS selectors. Instead of writing full `@media` queries or compound selectors repeatedly, define them once and reference them by name in your style definitions.

The `$` placeholder in a selector value is replaced with the generated atomic class selector.

## Config

::: tip Why the nested key?
The outer `selectors` is the plugin configuration field added to `EngineConfig` via [type augmentation](/plugin-development/type-augmentation). The inner `selectors` is the actual selector list. This two-level structure keeps each feature's options under a single top-level key.
:::

Selectors can be defined as static pairs or dynamic patterns:

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  selectors: {
    selectors: [
      // Static pair: [name, cssSelector]
      ['@dark', 'html.dark $'],
      ['@light', 'html:not(.dark) $'],

      // Media query selectors
      ['@sm', '@media (min-width: 640px)'],
      ['@md', '@media (min-width: 768px)'],
      ['@lg', '@media (min-width: 1024px)'],
      ['@xl', '@media (min-width: 1280px)'],

      // Dynamic pattern: [RegExp, resolver, autocomplete?]
      [/^@container-(.+)$/, ([, name]) => `@container ${name}`],
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

---
title: Autocomplete
description: Customize IDE autocomplete suggestions for PikaCSS properties and values.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/types.ts'
  - 'packages/core/src/internal/utils.ts'
category: customizations
order: 80
---

# Autocomplete

Customize IDE autocomplete suggestions for CSS properties and values.

PikaCSS generates TypeScript definitions (`pika.gen.ts`) that provide autocomplete support in your editor. The autocomplete system can be extended with custom property values, extra properties, and pattern-based suggestions through the engine config.

Plugins can also contribute autocomplete entries. The autocomplete configuration merges contributions from all sources.

## Config

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  autocomplete: {
    // Suggest specific values for CSS properties
    properties: {
      display: ['flex', 'grid', 'block', 'inline-block', 'none'],
      position: ['relative', 'absolute', 'fixed', 'sticky'],
    },

    // Suggest values for CSS properties in hyphen-case
    cssProperties: {
      'font-weight': ['400', '500', '600', '700'],
    },

    // Register extra non-standard properties
    extraProperties: new Set(['__layer']),

    // Register extra CSS-like properties from plugins
    extraCssProperties: new Set(),

    // Pattern-based suggestions for selectors and shortcuts
    selectors: new Set(['@dark', '@light', '@sm', '@md', '@lg']),
    shortcuts: new Set(['flex-center', 'btn']),
  },
})
```

## Examples

<<< @/.examples/customizations/autocomplete.example.ts

## Next

- [Engine Config](/getting-started/engine-config) — full configuration reference.
- [Selectors](/customizations/selectors) — custom selectors also register autocomplete entries.

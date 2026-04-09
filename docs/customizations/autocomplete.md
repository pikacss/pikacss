---
title: Autocomplete
description: Customize IDE autocomplete suggestions for PikaCSS properties and values.
relatedPackages:
  - '@pikacss/core'
  - '@pikacss/unplugin-pikacss'
relatedSources:
  - 'packages/core/src/internal/types/autocomplete.ts'
  - 'packages/core/src/internal/utils.ts'
  - 'packages/integration/src/tsCodegen.ts'
  - 'packages/unplugin/src/types.ts'
category: customizations
order: 80
---

# Autocomplete

Customize IDE autocomplete suggestions for CSS properties and values.

In integrations that support `tsCodegen`, enabling that option generates a TypeScript declaration file for editor autocomplete. In the unplugin, `tsCodegen` writes `pika.gen.ts` by default, a string writes the declarations to a custom path, and `false` disables TypeScript codegen entirely. The `autocomplete` engine config below extends those generated suggestions with custom property values, extra properties, and pattern-based suggestions.

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
    extraProperties: ['__layer'],

    // Register extra CSS-like properties from plugins
    extraCssProperties: ['--brand'],

    // Register extra selector and shortcut suggestions
    selectors: ['@dark', '@light', '@sm', '@md', '@lg'],
    shortcuts: ['flex-center', 'btn'],
  },
})
```

## Examples

<<< @/.examples/customizations/autocomplete.example.ts

## Next

- [Engine Config](/getting-started/engine-config) — full configuration reference.
- [Selectors](/customizations/selectors) — custom selectors also register autocomplete entries.

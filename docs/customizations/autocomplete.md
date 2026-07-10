---
title: Autocomplete
description: Customize IDE autocomplete suggestions for PikaCSS properties and values.
relatedPackages:
  - '@pikacss/core'
  - '@pikacss/unplugin-pikacss'
relatedSources:
  - 'packages/core/src/types/autocomplete.ts'
  - 'packages/core/src/utils.ts'
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
    // Suggest values for CSS properties. Keys may be camelCase or
    // hyphen-case — match how you write them in style definitions.
    cssProperties: {
      'display': ['flex', 'grid', 'block', 'inline-block', 'none'],
      'position': ['relative', 'absolute', 'fixed', 'sticky'],
      'font-weight': ['400', '500', '600', '700'],
    },

    // Register extra non-CSS properties (usually consumed by a plugin
    // via `transformStyleDefinitions` rather than rendered as CSS)
    extraProperties: ['__variant'],

    // Map extra properties to TypeScript type strings. Values are
    // emitted verbatim as types into the generated `pika.gen.ts`,
    // so they must be valid TypeScript type expressions.
    // (Core registers `__layer`, `__shortcut`, and `__important` this way.)
    properties: {
      __variant: ['\'primary\' | \'secondary\''],
    },

    // Register extra CSS-like properties from plugins
    extraCssProperties: ['--brand'],

    // Register extra selector and shortcut suggestions
    selectors: ['@dark', '@light', '@sm', '@md', '@lg'],
    shortcuts: ['flex-center', 'btn'],
  },
})
```

::: warning `properties` is not for CSS value suggestions
Entries in `properties` are written into `pika.gen.ts` as raw TypeScript types (e.g. the core plugins register `__important: 'boolean'`). Putting CSS value strings like `'flex'` there produces invalid type references in the generated file. Use `cssProperties` for CSS value suggestions — its entries are emitted as string literal types.
:::

## Autocomplete is suggestions, not validation

PikaCSS input types are deliberately open: property keys and values are widened with `string & {}`, so a typo like `colr: 'red'` still passes type checking. The autocomplete configuration narrows what your editor *suggests* — it does not reject unknown properties or values. The extra-property types (`__shortcut`, `__important`, entries you add via `properties`) come from the generated `pika.gen.ts`, so they are only in effect when `tsCodegen` is enabled and the generated file is part of your TypeScript project.

## Examples

<<< @/.examples/customizations/autocomplete.example.ts

## Next

- [Engine Config](/getting-started/engine-config) — full configuration reference.
- [Selectors](/customizations/selectors) — custom selectors also register autocomplete entries.

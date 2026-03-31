---
title: Define Helpers
description: Identity helpers for type-safe PikaCSS configuration and plugin authoring.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/index.ts'
category: plugin-development
order: 40
---

# Define Helpers

PikaCSS exports identity helpers that return their input unchanged while providing full TypeScript inference and autocomplete.

## defineEnginePlugin

Returns the given plugin definition with full type inference for hook signatures.

```ts
import { defineEnginePlugin } from '@pikacss/core'

const plugin = defineEnginePlugin({
  name: 'my-plugin',
  configureEngine: async (engine) => {
    // fully typed engine parameter
  },
})
```

## defineEngineConfig

Returns the given engine configuration with full type inference for all config fields.

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  prefix: 'pk-',
  plugins: [],
  layers: { base: 0, utilities: 1 },
})
```

## defineStyleDefinition

Returns the given style definition with full type inference for CSS properties and selectors.

```ts
import { defineStyleDefinition } from '@pikacss/core'

const card = defineStyleDefinition({
  'display': 'flex',
  '$:hover': { opacity: '0.8' },
})
```

## definePreflight

Returns the given preflight entry with full type inference.

```ts
import { definePreflight } from '@pikacss/core'

const reset = definePreflight({
  layer: 'base',
  id: 'reset',
  preflight: '*, *::before, *::after { box-sizing: border-box; }',
})
```

## defineKeyframes

Returns the given keyframes definition with full type inference.

```ts
import { defineKeyframes } from '@pikacss/core'

const fadeIn = defineKeyframes(['fade-in', {
  from: { opacity: '0' },
  to: { opacity: '1' },
}])
```

## defineSelector

Returns the given selector mapping with full type inference.

```ts
import { defineSelector } from '@pikacss/core'

const darkMode = defineSelector(['@dark', 'html.dark $'])
```

## defineShortcut

Returns the given shortcut definition with full type inference.

```ts
import { defineShortcut } from '@pikacss/core'

const flexCenter = defineShortcut(['flex-center', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}])
```

## defineVariables

Returns the given variables definition with full type inference for CSS custom property declarations.

```ts
import { defineVariables } from '@pikacss/core'

const theme = defineVariables({
  ':root': {
    '--color-primary': '#3b82f6',
    '--spacing-md': '1rem',
  },
})
```

## Next

- [Create a Plugin](/plugin-development/create-a-plugin) — get started with plugin development.
- [API Reference](/api/) — full API documentation.

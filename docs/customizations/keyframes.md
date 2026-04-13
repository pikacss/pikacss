---
title: Keyframes
description: Define CSS @keyframes animations in PikaCSS engine configuration.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/plugins/keyframes.ts'
category: customizations
order: 50
---

# Keyframes

Register CSS `@keyframes` animations with the engine.

PikaCSS lets you define keyframe animations in your engine configuration. They are rendered as preflight CSS and registered for autocomplete so the animation names are available in your style definitions.

## Config

Keyframes can be defined as tuples or objects:

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  keyframes: {
    definitions: [
      // Tuple form: [name, frames]
      ['fade-in', {
        from: { opacity: '0' },
        to: { opacity: '1' },
      }],

      // With percentages
      ['slide-in', {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      }],

      // Name only (frames defined elsewhere, e.g. in CSS)
      'spin',
    ],
  },
})
```

Use the animation name in your styles:

```ts
pika({
  animation: 'fade-in 0.3s ease-in-out',
})
```

## Examples

<<< @/.examples/customizations/keyframes.example.ts

## Next

- [Selectors](/customizations/selectors) — create custom selector shortcuts.
- [Variables](/customizations/variables) — define CSS custom properties.

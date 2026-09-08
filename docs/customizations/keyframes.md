---
title: Keyframes
description: Define object-form CSS keyframes with generated authoring metadata.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/plugins/keyframes.ts'
category: customizations
order: 50
---

# Keyframes

Keyframes use object definitions and are emitted only when needed unless pruning is disabled.

```ts
import { defineConfig } from '@pikacss/unplugin-pikacss'

export default defineConfig({
  engine: {
    keyframes: {
      definitions: [
        {
          name: 'fade-in',
          frames: {
            from: { opacity: '0' },
            to: { opacity: '1' },
          },
          animationValues: ['fade-in 0.3s ease-in-out'],
        },
        {
          name: 'slide-in',
          frames: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          description: 'Slide from the left',
        },
        {
          external: 'third-party-spin',
          animationValues: ['third-party-spin 1s linear infinite'],
          description: 'Defined by an external stylesheet',
        },
      ],
    },
  },
})
```

Use a keyframe name in ordinary CSS properties:

```ts
pika({ animation: 'fade-in 0.3s ease-in-out' })
```

The subsystem also exposes configured keyframes through its static Pika authoring surface for supported compile-time composition. Runtime usage never mutates generated Typegen.

`animationValues` adds complete values to `animation` autocomplete for either local or external definitions. An `{ external: 'name' }` definition tells PikaCSS that the `@keyframes` rule exists in another stylesheet: it participates in authoring/Typegen metadata but PikaCSS never emits or prunes that rule.

Set `pruneUnused: false` on a local definition (or the keyframes config default) when a PikaCSS-owned animation is consumed outside PikaCSS-generated CSS. External definitions are never pruned by PikaCSS.

## Examples

<<< @/.examples/customizations/keyframes.example.ts

## Next

- [Variables](/customizations/variables)
- [Selectors](/customizations/selectors)

---
title: Variables
description: Define CSS custom properties (variables) in PikaCSS engine configuration.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/plugins/variables.ts'
category: customizations
order: 40
---

# Variables

Define CSS custom properties that are injected as preflight styles.

CSS custom properties (variables) enable theming and dynamic value reuse across your styles. PikaCSS registers variables as preflight CSS under `:root` by default, making them available globally.

Use semantic buckets when the variable should autocomplete against matching CSS properties. Supported buckets are `colors`, `lengths`, `times`, `numbers`, `easings`, and `fontFamilies`. Put uncategorized variables in `others`.

## Config

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  variables: {
    colors: {
      '--color-primary': '#3b82f6',
      '--color-secondary': '#64748b',
    },
    lengths: {
      '--spacing-sm': '0.5rem',
      '--spacing-md': '1rem',
      '--spacing-lg': '2rem',
    },
    others: {
      '--shadow-elevated': '0 12px 40px rgb(0 0 0 / 0.12)',
    },
  },
})
```

Variables can be scoped to specific selectors:

```ts
defineEngineConfig({
  variables: {
    colors: {
      ':root': {
        '--color-bg': '#ffffff',
        '--color-text': '#000000',
      },
      '.dark': {
        '--color-bg': '#1a1a1a',
        '--color-text': '#ffffff',
      },
    },
  },
})
```

Use variables in your style definitions:

```ts
pika({
  color: 'var(--color-primary)',
  padding: 'var(--spacing-md)',
})
```

## Examples

<<< @/.examples/customizations/variables.example.ts

## Next

- [Keyframes](/customizations/keyframes) — define CSS animations.
- [Selectors](/customizations/selectors) — create custom selector shortcuts.

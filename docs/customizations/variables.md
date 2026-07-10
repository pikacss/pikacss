---
title: Variables
description: Define CSS custom properties (variables) in PikaCSS engine configuration.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/index.ts'
  - 'packages/core/src/plugins/variables.ts'
category: customizations
order: 40
---

# Variables

Define CSS custom properties that are injected as preflight styles.

CSS custom properties (variables) enable theming and dynamic value reuse across your styles. PikaCSS registers variables as preflight CSS under `:root` by default. Only variables that are actually referenced end up in the output — see [Unused variables are pruned](#unused-variables-are-pruned).

Register variables under `variables.definitions`. Plain values default to `var(--token)` suggestions for all CSS properties. Use the object form when you want to narrow autocomplete targets, disable value suggestions, or opt out of pruning.

## Config

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': '#3b82f6',
      '--color-secondary': '#64748b',
      '--spacing-sm': '0.5rem',
      '--spacing-md': '1rem',
      '--spacing-lg': '2rem',
      '--shadow-elevated': '0 12px 40px rgb(0 0 0 / 0.12)',
    },
  },
})
```

Use the object form when you need manual autocomplete control:

```ts
defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': {
        value: '#3b82f6',
        autocomplete: { asValueOf: ['color', 'backgroundColor'] },
      },
      '--shadow-elevated': {
        value: '0 12px 40px rgb(0 0 0 / 0.12)',
        autocomplete: { asValueOf: '-' },
      },
    },
  },
})
```

Variables can be scoped to specific selectors:

```ts
defineEngineConfig({
  variables: {
    definitions: {
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

## Unused variables are pruned

By default, a defined variable is only emitted when it is referenced via `var(...)` by an atomic style or another preflight (references are expanded transitively, so a used variable keeps the variables its value depends on). This keeps the output minimal, but it means variables consumed only by *external* CSS — stylesheets outside PikaCSS's output — are silently dropped.

To keep such variables in the output:

```ts
defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': '#3b82f6',
      // Per-variable opt-out of pruning
      '--external-theme': {
        value: '#64748b',
        pruneUnused: false,
      },
    },

    // Or list names that must always be emitted
    safeList: ['--color-primary'],

    // Or disable pruning for all variables (default: true)
    pruneUnused: false,
  },
})
```

- `pruneUnused` (config level) sets the default policy for all variables. Default: `true`.
- `pruneUnused` (per variable, object form) overrides the config-level default for that variable.
- `safeList` lists variable names that are always emitted regardless of usage.

## Examples

<<< @/.examples/customizations/variables.example.ts

## Next

- [Keyframes](/customizations/keyframes) — define CSS animations.
- [Selectors](/customizations/selectors) — create custom selector shortcuts.

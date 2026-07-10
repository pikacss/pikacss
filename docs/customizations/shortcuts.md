---
title: Shortcuts
description: Define reusable style aliases that expand to full style definitions.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/plugins/shortcuts.ts'
category: customizations
order: 70
---

# Shortcuts

Create reusable aliases that expand to full style definitions.

Shortcuts let you define named style combinations that can be referenced as string arguments in `pika()` calls. They work like utility class presets — define once, reuse everywhere.

## Config

A shortcut definition accepts several shapes (mirroring [Selectors](/customizations/selectors)):

- **Static tuple** `[name, styleDefinition]` — maps an exact name to one or more style items.
- **Dynamic tuple** `[RegExp, resolver, autocomplete?]` — matches a pattern and computes the style items lazily. The optional third element lists autocomplete suggestions for the pattern (e.g. `'size-${length}'`). The resolver may return `undefined`/`null` to signal "unresolved for now": nothing is cached and the rule is retried on a later resolve call.
- **Object form** — `{ shortcut, value }` (static) or `{ shortcut, value, autocomplete? }` (dynamic), equivalent to the tuples.
- **Plain string** — registers the name as an autocomplete suggestion only.

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  shortcuts: {
    definitions: [
      // Static pair: [name, styleDefinition]
      ['flex-center', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }],

      // Static pair with nested selectors
      ['btn', {
        'padding': '0.5rem 1rem',
        'borderRadius': '0.25rem',
        'cursor': 'pointer',
        '$:hover': { opacity: '0.8' },
      }],

      // Dynamic pattern: [RegExp, resolver, autocomplete?]
      [/^size-(.+)$/, ([, size]) => ({
        width: size,
        height: size,
      }), 'size-${length}'],

      // Object form
      {
        shortcut: 'card',
        value: { padding: '1rem', borderRadius: '0.5rem' },
      },
    ],
  },
})
```

Use shortcuts:

```ts
// Reference by name
pika('flex-center')

// Combine with inline styles
pika('flex-center', { gap: '1rem' })
```

## The `__shortcut` property

Inside a style definition, the `__shortcut` pseudo-property expands one or more shortcuts in place. This is useful when you want a single definition object that mixes shortcut expansion with overrides:

```ts
pika({
  __shortcut: 'btn',
  backgroundColor: 'navy',
})

// Multiple shortcuts
pika({
  __shortcut: ['flex-center', 'btn'],
  gap: '1rem',
})
```

The expanded declarations are inserted before the definition's own properties, so your explicit properties win when they overlap. An explicit `__important` flag on the definition is propagated onto the expanded declarations (see [Important](/customizations/important)).

## Examples

<<< @/.examples/customizations/shortcuts.example.ts

## Next

- [Autocomplete](/customizations/autocomplete) — customize IDE completions.
- [Selectors](/customizations/selectors) — define custom selector mappings.

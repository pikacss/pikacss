# Customizations

> Read this when the user asks about variables (including dark mode/theming), keyframes, preflights, per-style layer control, per-style !important, selectors, or shortcuts in detail.

## Table of Contents

1. [Variables and Theming](#variables-and-theming)
2. [Keyframes](#keyframes)
3. [Preflights](#preflights)
4. [Selectors](#selectors)
5. [Shortcuts](#shortcuts)
6. [Per-Style Layer Control (__layer)](#per-style-layer-control)
7. [Per-Style !important (__important)](#per-style-important)
8. [CSS Property Syntax](#css-property-syntax)
9. [Define Helpers](#define-helpers)

---

## Variables and Theming

### Basic Variables

```ts
export default defineEngineConfig({
  variables: {
    variables: {
      '--color-primary': '#3b82f6',
      '--color-text': '#1a1a1a',
      '--spacing-md': '1rem',
    },
  },
})
```

### Dark Mode with Scoped Selectors

Variables can be scoped to CSS selectors for theme switching:

```ts
export default defineEngineConfig({
  variables: {
    variables: {
      // Default (light) — applied to :root
      '--color-bg': '#ffffff',
      '--color-text': '#1a1a1a',

      // Dark mode — scoped to html.dark selector
      'html.dark': {
        '--color-bg': '#1a1a1a',
        '--color-text': '#f5f5f5',
      },
    },
  },
})
```

Use in pika():

```ts
pika({ color: 'var(--color-text)', 'background-color': 'var(--color-bg)' })
```

Toggle dark mode at runtime: `document.documentElement.classList.toggle('dark')`

### Media Query Scoping

```ts
variables: {
  variables: {
    '--color-bg': '#fff',
    '@media (prefers-color-scheme: dark)': {
      '--color-bg': '#1a1a1a',
    },
  },
}
```

### Pruning

- **`pruneUnused: true`** (default) — variables not referenced by any atomic style or preflight are stripped from output.
- **`safeList`** — variable names that should always be emitted:

```ts
variables: {
  variables: { '--color-accent': '#f00' },
  pruneUnused: true,
  safeList: ['--color-accent'],
}
```

---

## Keyframes

### Tuple Format

```ts
export default defineEngineConfig({
  keyframes: {
    keyframes: [
      ['spin', { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }],
      ['fade-in', { '0%': { opacity: '0' }, '100%': { opacity: '1' } }],
    ],
  },
})
```

### Object Format

```ts
keyframes: {
  keyframes: [
    { name: 'spin', frames: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } },
  ],
}
```

### Usage

Reference in pika() via the `animation` or `animation-name` property:

```ts
pika({ animation: 'spin 1s linear infinite' })
```

### Pruning

- **`pruneUnused: true`** (default) — keyframes not referenced by any `animation` or `animation-name` style are stripped.
- Set `pruneUnused: false` on individual definitions to keep them regardless.

---

## Preflights

Preflights accept multiple formats:

### Raw CSS String

```ts
preflights: [
  '*, *::before, *::after { box-sizing: border-box; }',
]
```

### Definition Object

```ts
preflights: [
  {
    body: { margin: '0', 'font-family': 'system-ui, sans-serif' },
    '*, *::before, *::after': { 'box-sizing': 'border-box' },
  },
]
```

### Function (dynamic)

```ts
preflights: [
  (engine, isFormatted) => `
    :root { --prefix: ${engine.config.prefix}; }
  `,
]
```

### With Layer and ID

```ts
preflights: [
  { layer: 'base', id: 'my-reset', preflight: '*, *::before { box-sizing: border-box; }' },
]
```

---

## Selectors

Register named selector aliases used in pika() style nesting:

```ts
selectors: {
  selectors: [
    // [alias, actual CSS selector]
    [':hover', '$:hover'],
    [':focus', '$:focus'],
    ['::before', '$::before'],
    ['@dark', 'html.dark $'],
    ['@light', 'html:not(.dark) $'],
    ['@sm', '@media screen and (min-width: 640px)'],
    ['@md', '@media screen and (min-width: 768px)'],
    ['@lg', '@media screen and (min-width: 1024px)'],
  ],
}
```

- `$` — placeholder for the atomic class name
- Media queries don't need `$` — they wrap the rule block

Usage:

```ts
pika({
  color: 'red',
  ':hover': { color: 'blue' },
  '@dark': { color: 'white' },
  '@md': { 'font-size': '1.2rem' },
})
```

---

## Shortcuts

Named style bundles reusable in pika() calls:

```ts
shortcuts: {
  shortcuts: [
    ['flex-center', { display: 'flex', 'align-items': 'center', 'justify-content': 'center' }],
    ['card', {
      padding: '1rem',
      'border-radius': '8px',
      'box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
      '@dark': { 'background-color': '#2a2a2a' },
    }],
  ],
}
```

Shortcuts can contain nested selectors. Use in code: `pika('flex-center', 'card')`

---

## Per-Style Layer Control

Override the default utility layer for individual styles using the `__layer` property:

```ts
pika({ __layer: 'components', display: 'flex', padding: '1rem' })
```

The layer must be defined in the `layers` config.

---

## Per-Style !important

Force `!important` on individual styles:

```ts
pika({ __important: true, color: 'red' })
```

Or globally via config:

```ts
important: { default: true }
```

---

## CSS Property Syntax

Both notations are accepted in StyleDefinition:

```ts
// camelCase (JavaScript convention)
pika({ fontSize: '16px', marginTop: '1rem' })

// kebab-case (CSS convention)
pika({ 'font-size': '16px', 'margin-top': '1rem' })
```

### Value Formats

- **String**: `'16px'`, `'red'`, `'var(--color-primary)'`
- **Tuple with fallback**: `['oklch(0.7 0.15 200)', ['blue']]` → rendered as `oklch(0.7 0.15 200), blue`
- **CSS custom properties**: `{ '--my-var': '10px' }` (set inline custom properties)

---

## Define Helpers

Identity functions from `@pikacss/core` for TypeScript type inference. They accept a value and return it unchanged — useful for extracting reusable config fragments with full editor autocompletion:

```ts
import { defineStyleDefinition, definePreflight, defineKeyframes, defineSelector, defineShortcut, defineVariables } from '@pikacss/core'

const cardStyle = defineStyleDefinition({ padding: '1rem', 'border-radius': '8px' })
const myReset = definePreflight('*, *::before { box-sizing: border-box; }')
const spin = defineKeyframes(['spin', { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }])
```

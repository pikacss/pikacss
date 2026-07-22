# Customizations

> Read this when the user asks about variables and themes, keyframes, preflights, selectors, shortcuts, `__shortcut`, layers, `!important`, CSS property syntax, value fallbacks, or typed reusable config fragments.

## Variables and Theming

Register variables under `variables.definitions`:

```ts
export default defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': '#3b82f6',
      '--color-text': '#1a1a1a',
      '--spacing-md': '1rem',
    },
  },
})
```

Plain values use the default autocomplete and pruning policy. Use object values for per-variable control:

```ts
variables: {
  definitions: {
    '--color-primary': {
      value: '#3b82f6',
      autocomplete: {
        asValueOf: ['color', 'background-color'],
        asProperty: true,
      },
      pruneUnused: false,
    },
  },
}
```

- `autocomplete.asValueOf: '*'` suggests the variable for every CSS property.
- `autocomplete.asValueOf: '-'` suppresses value suggestions.
- `autocomplete.asProperty` controls whether the variable name itself is suggested as a custom property.

### Scoped themes

Non-variable keys are emitted as selector scopes:

```ts
variables: {
  definitions: {
    '--color-bg': '#fff',
    '--color-text': '#1a1a1a',

    'html.dark': {
      '--color-bg': '#1a1a1a',
      '--color-text': '#f5f5f5',
    },

    '[data-theme="high-contrast"]': {
      '--color-text': '#000',
    },

    '@media (prefers-color-scheme: dark)': {
      '--system-bg': '#1a1a1a',
    },
  },
}
```

The scope must match the application's actual theme switch. Do not combine a class-based variable scope with a data-attribute selector alias unless the application applies both.

### Pruning

Unused variables are pruned by default. Keep variables through either:

```ts
variables: {
  pruneUnused: true,
  safeList: ['--color-accent'],
  definitions: {
    '--color-accent': '#f00',
    '--always-keep': {
      value: '1rem',
      pruneUnused: false,
    },
  },
}
```

Variable dependencies are expanded transitively. If an emitted variable references another variable, the dependency is emitted too.

## Keyframes

Definitions may use tuple or object form:

```ts
export default defineEngineConfig({
  keyframes: {
    definitions: [
      ['spin', {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      }],
      {
        name: 'fade-in',
        frames: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    ],
  },
})
```

Reference names through `animation` or `animationName`:

```ts
pika({ animation: 'spin 1s linear infinite' })
```

Unused keyframes are pruned by default. Use the definition's pruning controls when a keyframe must always remain.

## Preflights

Preflights accept multiple public shapes.

### Raw CSS

```ts
preflights: [
  '*, *::before, *::after { box-sizing: border-box; }',
]
```

### Definition object

```ts
preflights: [
  {
    body: {
      margin: '0',
      fontFamily: 'system-ui, sans-serif',
    },
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
  },
]
```

### Function

```ts
preflights: [
  (engine, isFormatted, context) => `
    :root { --class-prefix: ${engine.config.prefix}; }
  `,
]
```

When one preflight invokes another during rendering, forward the render-pass context to `engine.invokePreflight(fn, isFormatted, context)` so each function executes once per pass.

### Wrapped with metadata

```ts
preflights: [
  {
    id: 'app-base',
    layer: 'base',
    preflight: 'html { color-scheme: light dark; }',
  },
]
```

Stable IDs are useful when plugins need to recognize or exclude their own preflight.

## Selectors

There are three distinct selector forms. Do not mix their syntax.

### Built-in pseudo selectors

Direct CSS pseudo selectors use `$` before the colon:

```ts
pika({
  '$:hover': { opacity: '0.8' },
  '$:focus-visible': { outline: '2px solid currentColor' },
  '$::before': { content: '""' },
})
```

`$` represents the generated atomic class selector. Bare `:hover` is not the built-in direct pseudo syntax.

### Direct at-rules

CSS at-rules can be used directly:

```ts
pika({
  '@media (min-width: 768px)': {
    fontSize: '1.125rem',
  },
  '@supports (display: grid)': {
    display: 'grid',
  },
})
```

### Named selector aliases

Register reusable aliases under `selectors.definitions`:

```ts
export default defineEngineConfig({
  selectors: {
    definitions: [
      ['@dark', 'html.dark $'],
      ['@motion-safe', '@media (prefers-reduced-motion: no-preference)'],
      ['@group-hover', '.group:hover $'],
    ],
  },
})
```

```ts
pika({
  '@dark': { color: 'white' },
  '@motion-safe': { transition: 'opacity 150ms' },
})
```

Aliases may also be dynamic rules using a `RegExp`, resolver, and optional autocomplete patterns. Read the package API before inventing a dynamic rule shape.

## Shortcuts

Static and dynamic shortcuts live under `shortcuts.definitions`:

```ts
export default defineEngineConfig({
  shortcuts: {
    definitions: [
      ['flex-center', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }],
      ['button', {
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        '$:hover': { opacity: '0.8' },
      }],
      [/^size-(.+)$/, ([, size]) => ({
        width: size,
        height: size,
      }), 'size-${length}'],
    ],
  },
})
```

Use them as style items:

```ts
pika('flex-center', 'button', { gap: '0.5rem' })
```

Unresolved strings are preserved as raw/existing class names, so a `pika()` call may combine PikaCSS shortcuts and ordinary classes.

### `__shortcut`

Expand shortcuts inside a style definition:

```ts
pika({
  __shortcut: ['flex-center', 'button'],
  backgroundColor: 'navy',
  gap: '1rem',
})
```

Shortcut declarations are inserted before the definition's own declarations, so explicit properties win. `__important` propagates to shortcut-expanded declarations.

## Layer Control

Define custom layers and set one per style definition:

```ts
export default defineEngineConfig({
  layers: {
    reset: 0,
    preflights: 1,
    components: 5,
    utilities: 10,
  },
})
```

```ts
pika({
  __layer: 'components',
  display: 'flex',
})
```

The layer should exist in `config.layers`; numeric weights determine output order.

## Important Control

Per-definition:

```ts
pika({
  __important: true,
  color: 'red',
})
```

Global default:

```ts
important: {
  default: true,
}
```

Core plugin ordering ensures `!important` is applied after shortcut expansion and never to the `__shortcut` pseudo-property itself.

## CSS Property Syntax

Both camelCase and kebab-case are valid:

```ts
pika({
  fontSize: '16px',
  marginTop: '1rem',
  'line-height': '1.5',
  '--local-gap': '0.5rem',
})
```

### Value fallbacks

The fallback shape is `[primaryValue, fallbackValues[]]`:

```ts
pika({
  color: ['oklch(0.7 0.15 220)', ['rgb(0 120 255)', 'blue']],
})
```

PikaCSS emits fallback declarations in the supplied array order, then the primary declaration:

```css
color: rgb(0 120 255);
color: blue;
color: oklch(0.7 0.15 220);
```

A flat array such as `['blue', 'red']` is not the property fallback tuple.

### Nullish values

`null` or `undefined` removes/unsets a property during optimization. This is useful when transformed style definitions intentionally cancel an earlier value.

## Typed Config Fragments

Only `defineEngineConfig` and `defineEnginePlugin` remain as public define helpers. For reusable fragments, use object literals with `satisfies` or explicit types:

```ts
import type {
  SelectorsConfig,
  ShortcutsConfig,
  StyleDefinition,
  VariablesDefinition,
} from '@pikacss/core'

const cardStyle: StyleDefinition = {
  padding: '1rem',
  borderRadius: '0.5rem',
}

const themeVariables = {
  '--color-primary': '#3b82f6',
  '.dark': {
    '--color-primary': '#60a5fa',
  },
} satisfies VariablesDefinition

const selectors = {
  definitions: [['@dark', 'html.dark $']],
} satisfies SelectorsConfig

const shortcuts = {
  definitions: [['card', cardStyle]],
} satisfies ShortcutsConfig
```

Apply the same approach to preflights, keyframes, autocomplete, and official-plugin config. Do not suggest removed legacy wrapper helpers.

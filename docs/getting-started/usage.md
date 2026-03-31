---
title: Usage
description: Learn how to write styles with pika() and see common usage patterns.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/engine.ts'
  - 'packages/core/src/types.ts'
category: getting-started
order: 30
---

# Usage

Write styles using CSS property names in JavaScript objects, and PikaCSS transforms them into atomic CSS at build time.

## pika() Variants

PikaCSS provides several function variants for different output formats and use cases:

### pika()

The default function. Returns a space-separated string of atomic class names.

```ts
const className = pika({ color: 'red', fontSize: '16px' })
// → 'pk-abc pk-def'
```

### pika.str()

Explicit string variant. Identical to `pika()` — returns a space-separated string of class names. Useful when you want to be explicit about the return type.

```ts
const className = pika.str({ color: 'red' })
// → 'pk-abc'
```

### pika.arr()

Array variant. Returns an array of individual class name strings instead of a single joined string. Useful for frameworks or utilities that accept class name arrays.

```ts
const classNames = pika.arr({ color: 'red', fontSize: '16px' })
// → ['pk-abc', 'pk-def']
```

### pikap() — Preview Mode

Preview variant for development. Works the same as `pika()`, but triggers a live preview of the generated CSS when you save the file. Available as `pikap()`, `pikap.str()`, and `pikap.arr()`.

```ts
// Save the file to see the generated CSS preview
const className = pikap({ color: 'red' })
```

::: tip
All variants accept the same arguments — they only differ in return type. The ESLint plugin validates all variants equally.
:::

## Examples

### Basic CSS Properties

Pass a style definition object with standard CSS properties:

::: code-group

<<< @/.examples/getting-started/basic.example.pikain.ts [Input]

<<< @/.examples/getting-started/basic.example.pikaout.css [Output]

:::

### Pseudo-Classes and Pseudo-Elements

Use `$:hover`, `$:focus`, `$::before`, etc. to add pseudo selectors:

::: code-group

<<< @/.examples/getting-started/pseudo.example.pikain.ts [Input]

<<< @/.examples/getting-started/pseudo.example.pikaout.css [Output]

:::

### Responsive Styles

Use `@media` queries as keys for responsive breakpoints:

::: code-group

<<< @/.examples/getting-started/responsive.example.pikain.ts [Input]

<<< @/.examples/getting-started/responsive.example.pikaout.css [Output]

:::

### Custom Selectors

Use custom selector names defined in your engine config:

::: code-group

<<< @/.examples/getting-started/custom-selector.example.pikain.ts [Input]

<<< @/.examples/getting-started/custom-selector.example.pikaout.css [Output]

:::

### Shortcut References

Reference named shortcuts as string arguments:

```ts
// Assuming a shortcut "flex-center" is defined in config
const className = pika('flex-center')
```

## Next

- [Engine Config](/getting-started/engine-config) — customize the engine behavior.
- [Customizations](/customizations/selectors) — define custom selectors.

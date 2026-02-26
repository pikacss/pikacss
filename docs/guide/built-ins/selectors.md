# Selectors

The `core:selectors` plugin resolves selector aliases before rendering. It supports both static mappings and dynamic RegExp-based patterns, with recursive resolution.

## How It Works

1. Selector definitions are collected from `config.selectors.selectors` during `rawConfigConfigured`.
2. During `configureEngine`, each definition is resolved and registered:
   - Static rules are stored for exact-match lookup.
   - Dynamic rules are stored for RegExp-based matching.
   - Autocomplete entries are added for known selectors.
3. During `transformSelectors`, each selector string is recursively resolved through the `SelectorResolver`.
4. If a selector does not match any rule, the original string is returned unchanged.
5. Dynamic resolutions are automatically fed back into autocomplete via `onResolved`.

## Config

```ts
interface SelectorsConfig {
  /** Array of selector definitions. */
  selectors: Selector[]
}
```

## Selector Definition Formats

There are four ways to define a selector.

### String Form

A plain string is registered as an autocomplete suggestion only — no resolution rule is created.

<<< @/.examples/guide/built-ins/selectors-string-form.ts

### Tuple Form — Static

A two-element tuple maps a selector name to one or more replacement strings. Use `$` as a placeholder for the element's default selector (see [The `$` Placeholder](#the-placeholder) below).

```ts
type TupleFormStatic = [selector: string, value: string | string[]]
```

<<< @/.examples/guide/built-ins/selectors-tuple-static.ts

### Tuple Form — Dynamic

A tuple with a `RegExp` pattern and a resolver function. The function receives the `RegExpMatchArray` and returns one or more replacement strings. An optional third element provides autocomplete hints.

```ts
type TupleFormDynamic = [selector: RegExp, value: (matched: RegExpMatchArray) => string | string[], autocomplete?: string | string[]]
```

<<< @/.examples/guide/built-ins/selectors-tuple-dynamic.ts

### Object Form

Equivalent to tuple forms but with named properties. Supports both static and dynamic variants:

<<< @/.examples/guide/built-ins/selectors-object-form.ts

## Full Example

<<< @/.examples/guide/built-ins/selectors-config.ts

## Usage with `pika()`

Use selector names as keys in style definitions. Any key that is not a CSS property is treated as a selector:

<<< @/.examples/guide/built-ins/selectors-usage.ts

Generated CSS output:

<<< @/.examples/guide/built-ins/selectors-output.css

## The `$` Placeholder {#the-placeholder}

In selector values, `$` is replaced with the element's **default selector** (which defaults to `.%`, where `%` is the atomic style ID placeholder). This enables pseudo-classes, ancestor selectors, and more.

<<< @/.examples/guide/built-ins/selectors-placeholder-pseudo.ts

### Placeholder Behavior Summary

| Definition | `$` → defaultSelector | Final CSS |
| --- | --- | --- |
| `['hover', '$:hover']` | `.%:hover` | `.a:hover { ... }` |
| `['before', '$::before']` | `.%::before` | `.a::before { ... }` |
| `['dark', '[data-theme="dark"] $']` | `[data-theme="dark"] .%` | `[data-theme="dark"] .a { ... }` |
| `['md', '@media (min-width: 768px)']` | _(no `$`)_ | `@media (min-width: 768px) { .a { ... } }` |

::: tip At-Rules
For CSS at-rules like `@media` or `@container`, **do not** include `$` in the value. When the resolved selector does not contain the `%` placeholder, the engine automatically appends the default selector (`.%`) as a nested level, producing the correct two-level structure:

```css
@media (min-width: 768px) {
  .a { ... }
}
```
:::

::: warning
Do not embed `$` inside an at-rule string (e.g., `@media (...) { $ }`). This produces `@media (...) { .a }` as a **single block selector**, resulting in invalid CSS.
:::

## Recursive Resolution

Selector resolution is recursive. A selector value can reference another selector name, and it will be resolved through the chain:

<<< @/.examples/guide/built-ins/selectors-recursive.ts

## `defineSelector` Helper

Use the `defineSelector()` helper for type-safe selector definitions with full autocomplete:

<<< @/.examples/guide/built-ins/selectors-define-helper.ts

## Engine API

Plugins can manage selectors programmatically:

- `engine.selectors.resolver` — the `SelectorResolver` instance
- `engine.selectors.add(...list)` — add selector definitions at runtime

## Behavior Notes

- Invalid selector config shapes are silently skipped.
- Dynamic resolutions are cached after first resolution.
- Both static and dynamic rules are stored in the `SelectorResolver` which extends `AbstractResolver`.
- The `$` placeholder respects the engine's `defaultSelector` option (defaults to `.%`).

## Source Reference

- `packages/core/src/internal/plugins/selectors.ts`

## Next

- Continue to [Shortcuts](/guide/built-ins/shortcuts)

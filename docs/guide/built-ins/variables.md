# Variables

The `core:variables` plugin manages CSS custom properties (variables). It handles declaration output as preflight CSS, nested selectors for theming, autocomplete integration, and unused variable pruning.

## How It Works

1. Variable definitions are collected from `config.variables.variables` during `rawConfigConfigured`.
2. During `configureEngine`, each variable is resolved and registered:
   - Autocomplete entries are added (e.g., `var(--name)` as a value suggestion).
   - Variables with values are stored in `engine.variables.store`.
3. A preflight function scans all atomic styles for `var(--name)` patterns to determine which variables are actually used.
4. Only used variables (plus safe-listed ones) are emitted to CSS output.

## Config

```ts
interface VariablesConfig {
  /** Variable definitions — a single object or an array of objects. */
  variables: VariablesDefinition | VariablesDefinition[]
  /** Whether to prune unused variables from CSS output. @default true */
  pruneUnused?: boolean
  /** Variables that are always included regardless of usage. @default [] */
  safeList?: `--${string}`[]
}
```

### `VariablesDefinition`

A recursive object where:
- Keys starting with `--` define CSS variables.
- Other keys are treated as CSS selectors for scoping.
- Values can be a simple CSS value or a `VariableObject` for fine-grained control.

### `VariableObject`

```ts
interface VariableObject {
  value?: string | number | null
  autocomplete?: {
    /** Which CSS properties suggest var(--name). @default ['*'] */
    asValueOf?: string | string[]
    /** Register --name as a CSS property in autocomplete. @default true */
    asProperty?: boolean
  }
  /** Override pruning for this specific variable. */
  pruneUnused?: boolean
}
```

## Basic Usage

Define variables in your `pika.config.ts`. Top-level variables are placed under `:root` by default:

<<< @/.examples/guide/variables-config.ts

Use the variables in your styles:

<<< @/.examples/guide/variables-usage.ts

Generated CSS output (preflight + atomic styles):

<<< @/.examples/guide/variables-output.css

## Variable Object Form

Use an object value for fine-grained control over autocomplete and pruning:

<<< @/.examples/guide/variables-object-form.ts

::: tip Null-Value Variables
Variables with `value: null` provide autocomplete suggestions without emitting any CSS declaration. This is useful for variables defined externally (e.g., by a third-party stylesheet).
:::

## Unused Variable Pruning

By default, `pruneUnused` is `true`. A variable is kept in CSS output when **any** of the following is true:

- It is referenced via `var(--name)` in an atomic style value
- It appears in the `safeList` array
- Its per-variable `pruneUnused` is explicitly set to `false`

::: tip Transitive Dependency Tracking
PikaCSS tracks variable dependencies transitively. If your styles reference `--color-primary`, and `--color-primary`'s value references `--color-base`, which in turn references `--color-raw`, all three variables are automatically preserved in CSS output — even if only `--color-primary` appears directly in your styles.
:::

## Dynamic Variables via Engine API

Plugins can add variables programmatically at runtime:

```ts
engine.variables.add({
  '--dynamic-color': '#ff007f',
})
```

The `engine.variables.store` is a `Map<string, ResolvedVariable[]>` holding all registered variables, keyed by variable name.

## Behavior Summary

| Aspect | Detail |
| --- | --- |
| Plugin name | `core:variables` |
| Default selector | `:root` (for top-level variables) |
| `pruneUnused` default | `true` |
| `autocomplete.asValueOf` default | `['*']` |
| `autocomplete.asProperty` default | `true` |
| Null-value variables | Registered for autocomplete only, not emitted to CSS |
| Detection | Scans atomic style values for `var(--name)` patterns (transitive) |

## The `defineVariables()` Helper

Use `defineVariables()` for type-safe variable definitions with full TypeScript autocomplete. It is an identity function exported from `@pikacss/core`, useful when extracting variables into a separate file for reuse across multiple configs:

<<< @/.examples/guide/built-ins/variables-define-helper.ts

## Source Reference

- `packages/core/src/internal/plugins/variables.ts`

## Next

- Continue to [Keyframes](/guide/built-ins/keyframes)

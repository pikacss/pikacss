# Important

The `core:important` plugin controls whether CSS property values receive the `!important` flag. It operates during the `transformStyleDefinitions` hook.

## How It Works

1. The plugin reads `important.default` from `EngineConfig` during `rawConfigConfigured`.
2. During `transformStyleDefinitions`, for each style definition:
   - If `__important` is explicitly set on the definition, that value is used.
   - Otherwise, the `important.default` value applies (defaults to `false`).
3. When important is `true`, every property value in the definition is appended with ` !important` — including fallback-array values.
4. The `__important` key is always stripped from the definition before CSS output.
5. Nested selector objects are passed through unchanged — only property values are modified.

::: tip Duplicate `!important` Prevention
The plugin never produces doubled `!important`. Values that already end with `!important` are left unchanged — you will never see `color: red !important !important` in generated CSS.
:::

## Config

```ts
interface ImportantConfig {
  /**
   * When true, all CSS values get `!important` by default.
   * Individual definitions can override this with `__important`.
   * @default false
   */
  default?: boolean
}
```

## Basic Usage

Enable `!important` for all styles globally:

<<< @/.examples/guide/important-config.ts

All generated CSS will include `!important`:

<<< @/.examples/guide/important-default-true-output.css

## Per-Definition Override

Use the `__important` extra property to override the global default on a per-definition basis:

<<< @/.examples/guide/important-per-definition.ts

Generated output:

<<< @/.examples/guide/important-override-output.css

## The `__important` Property

`__important` is a special extra property registered by the plugin. It accepts a `boolean` value and is **never** emitted to CSS.

| `__important` value | `important.default` | Result |
| --- | --- | --- |
| `true` | `false` | `!important` applied |
| `true` | `true` | `!important` applied |
| `false` | `false` | No `!important` |
| `false` | `true` | No `!important` |
| not set | `false` | No `!important` |
| not set | `true` | `!important` applied |

## Autocomplete

The plugin registers `__important` as an extra property with `boolean` values for IDE autocomplete support.

## Source Reference

- `packages/core/src/internal/plugins/important.ts`

## Next

- Continue to [Variables](/guide/built-ins/variables)

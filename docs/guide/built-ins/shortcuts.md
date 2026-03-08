# Shortcuts

The `core:shortcuts` plugin enables reusable style combinations. Define named style shortcuts and reference them as string style items passed to `pika()` or via the `__shortcut` property inside style definitions.

## How It Works

1. Shortcut definitions are collected from `config.shortcuts.shortcuts` during `rawConfigConfigured`.
2. During `configureEngine`, each definition is resolved and registered:
   - Static rules are stored for exact-match lookup.
   - Dynamic rules are stored for RegExp-based matching.
   - Autocomplete entries are added for known shortcuts.
3. The plugin operates on two hooks:
   - **`transformStyleItems`** — string style items are checked against the `ShortcutResolver`. If matched, the resolved items replace the original string.
   - **`transformStyleDefinitions`** — when a style definition contains a `__shortcut` property, the shortcut is resolved and the resulting style definitions are inserted **before** the remaining properties of the current definition.
4. Unmatched shortcut strings are returned unchanged (passed through as-is).

## Config

<<< @/.examples/guide/built-ins/shortcuts-config-interface.ts

## Shortcut Definition Formats

There are **5 forms** for defining shortcuts: 1 string form, 2 tuple forms, and 2 object forms.

### String Form

A plain string is registered as an autocomplete suggestion only — no resolution rule is created.

<<< @/.examples/guide/built-ins/shortcuts-string-form.ts

### Tuple Form — Static

<<< @/.examples/guide/built-ins/shortcuts-tuple-static-type.ts

The value can be a `StyleDefinition` object, a `string` referencing another shortcut, or an array of both:

<<< @/.examples/guide/built-ins/shortcuts-tuple-static.ts

### Tuple Form — Dynamic

<<< @/.examples/guide/built-ins/shortcuts-tuple-dynamic-type.ts

The resolver function receives the `RegExpMatchArray` from the pattern match and returns one or more `ResolvedStyleItem`s. Optional autocomplete hints provide IDE suggestions for the dynamic pattern, and can be passed as either a single string or an array:

<<< @/.examples/guide/built-ins/shortcuts-tuple-dynamic.ts

### Object Form

Equivalent to tuple forms but with named properties. Both static and dynamic variants are supported:

<<< @/.examples/guide/built-ins/shortcuts-object-form.ts

## Full Example

<<< @/.examples/guide/built-ins/shortcuts-config.ts

## Usage with `pika()`

Shortcuts can be used in two ways:

### As String Arguments

Pass shortcut names as string arguments to `pika()`. They are resolved alongside other style items:

<<< @/.examples/guide/built-ins/shortcuts-usage-string-arg.ts

Generated CSS output:

<<< @/.examples/guide/built-ins/shortcuts-output-string-arg.css

### The `__shortcut` Property

Use `__shortcut` inside a style definition to apply one or more shortcuts. The resolved styles are merged **before** any other properties in the definition:

<<< @/.examples/guide/built-ins/shortcuts-usage-property.ts

Generated CSS output:

<<< @/.examples/guide/built-ins/shortcuts-output-property.css

::: tip Order of Properties
When using `__shortcut`, the shortcut styles are inserted **before** the remaining properties in the definition. This means properties defined alongside `__shortcut` can override shortcut values.
:::

## The `defineShortcut()` Helper

Use `defineShortcut()` as a type-safe identity helper for individual shortcut definitions. It provides full TypeScript autocomplete:

<<< @/.examples/guide/built-ins/shortcuts-define-helper.ts

## Recursive Resolution

Shortcuts can reference other shortcuts by name. Resolution is recursive — a shortcut value can be a string pointing to another registered shortcut:

<<< @/.examples/guide/built-ins/shortcuts-recursive.ts

When `pika('btn')` is called, the engine resolves `'flex-center'` first, then merges the result with the remaining inline styles.

::: tip Cycle Safety
The resolver detects circular references such as `btn -> flex-center -> btn`. When that happens, the engine logs a warning and safely treats the unresolved item as a plain string instead of entering an infinite loop.
:::

## Autocomplete

The plugin registers:

- `__shortcut` as an extra property on style definitions, accepting `string | string[]` values.
- All static shortcut names as autocomplete suggestions.
- Dynamic resolutions are automatically fed back into autocomplete via `onResolved`.

## Engine API

Plugins can manage shortcuts programmatically:

- `engine.shortcuts.resolver` — the `ShortcutResolver` instance
- `engine.shortcuts.add(...list)` — add shortcut definitions at runtime

## Behavior Notes

- Dynamic resolutions are cached after first resolution.
- Both static and dynamic rules are stored in the `ShortcutResolver` which extends `AbstractResolver`.
- Invalid shortcut config shapes are silently skipped.
- Shortcuts can reference other shortcuts — resolution is recursive.
- Resolution errors are caught and logged as warnings; the original string is returned.

## Source Reference

- `packages/core/src/internal/plugins/shortcuts.ts`

## Next

- Continue to [Plugin System Overview](/plugin-system/overview)
- Review [Built-in Plugins](/guide/built-in-plugins)
- Compare [Selectors](/guide/built-ins/selectors)

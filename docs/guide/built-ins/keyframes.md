# Keyframes

The `core:keyframes` plugin manages CSS `@keyframes` animations. It generates `@keyframes` rules as preflight CSS and provides autocomplete for `animationName` and `animation` properties.

## How It Works

1. Keyframe definitions are collected from `config.keyframes.keyframes` during `rawConfigConfigured`.
2. During `configureEngine`, each definition is resolved and registered:
   - Autocomplete entries are added for `animationName` and `animation`.
   - Entries with `frames` are stored in `engine.keyframes.store`.
3. A preflight function scans atomic styles for animation references to determine which keyframes are actually used.
4. Only used keyframes (or those with `pruneUnused: false`) are emitted to CSS output.

## Config

<<< @/.examples/guide/built-ins/keyframes-config-interface.ts

## Keyframe Definition Formats

PikaCSS supports three forms for defining keyframes:

### 1. String Form

Registers only the keyframe name for autocomplete — no `@keyframes` block is generated.

<<< @/.examples/guide/built-ins/keyframes-string-form.ts

### 2. Tuple Form

<<< @/.examples/guide/built-ins/keyframes-tuple-form-type.ts

In both tuple and object forms, `autocomplete` must be an array of strings. Unlike selectors and shortcuts, keyframes do not accept a single string shorthand here.

### 3. Object Form

<<< @/.examples/guide/built-ins/keyframes-object-form-interface.ts

### `KeyframesProgress`

The `frames` object maps animation stops to CSS properties:

- `from` — alias for `0%`
- `to` — alias for `100%`
- `` `${number}%` `` — any percentage stop (e.g., `'25%'`, `'50%'`)

## Full Example

<<< @/.examples/guide/keyframes-config.ts

## Usage with `pika()`

Reference defined keyframes in `animationName` or the `animation` shorthand:

<<< @/.examples/guide/keyframes-usage.ts

Generated CSS output:

<<< @/.examples/guide/keyframes-output.css

## Pruning Unused Keyframes

By default, `pruneUnused` is `true`. Only keyframes whose names appear in `animationName` or `animation` atomic style values are included in CSS output.

- **Global setting**: `keyframes.pruneUnused` applies to all entries.
- **Per-keyframe override**: Set `pruneUnused` on an individual entry.
- Entries without `frames` are never output (they only affect autocomplete).

::: tip Animation Name Detection
Unused keyframe detection scans atomic styles for `animation-name` (kebab-case) and `animation` property values. PikaCSS normalizes all CSS properties to kebab-case internally, so `pruneUnused` works correctly regardless of which property form you use in TypeScript.
:::

## Autocomplete

The plugin registers these autocomplete values automatically:

- `animationName` — the keyframe name (e.g., `fade-in`)
- `animation` — the name followed by a space (e.g., `fade-in `) to prompt for duration/easing
- Custom `autocomplete` strings are also added as `animation` suggestions

## Engine API

Plugins can manage keyframes programmatically:

- `engine.keyframes.store` — `Map<string, ResolvedKeyframesConfig>` of all registered keyframes with frames
- `engine.keyframes.add(...list)` — add keyframe definitions at runtime (accepts all three forms)

## The `defineKeyframes()` Helper

Use `defineKeyframes()` for type-safe keyframe definitions with full TypeScript autocomplete. It is an identity function exported from `@pikacss/core`, especially useful when organizing animations in a separate file:

<<< @/.examples/guide/built-ins/keyframes-define-helper.ts

## Source Reference

- `packages/core/src/internal/plugins/keyframes.ts`

## Next

- Continue to [Selectors](/guide/built-ins/selectors)
- Review [Built-in Plugins](/guide/built-in-plugins)
- Learn the [Plugin System](/plugin-system/overview)

# First Pika

After [installing](/getting-started/installation) the build plugin and importing `pika.css`, you can start writing styles with `pika(...)`.

## Prerequisites

Make sure you have already:

1. Installed `@pikacss/unplugin-pikacss` and registered the plugin in your bundler config.
2. Imported `pika.css` in your application entry point.

<<< @/.examples/getting-started/first-pika-entry.ts

## A minimal first example

`pika()` is a global function that accepts style objects with camelCase CSS properties. It returns class name(s) that you can bind to elements.

::: tip Global Function — No Import Needed
`pika()` is registered as a **global function** by the build plugin. You do **not** need to import it — just use it directly in any source file. The build plugin finds all `pika()` calls via static analysis and replaces them with generated class names at build time. The `pika.gen.ts` file provides TypeScript type declarations (via `declare global`) for editor autocomplete, but it is not a module you import from.
:::

::: code-group
<<< @/.examples/getting-started/first-pika-basic.vue [Vue SFC]
<<< @/.examples/getting-started/first-pika-basic.ts [Vanilla TS]
:::

## What happens at build time

PikaCSS works entirely at build time — there is **zero runtime overhead**. When you run your build, PikaCSS:

1. **Scans** your source files for `pika(...)` calls.
2. **Analyzes** the style objects statically (arguments must be analyzable at build time).
3. **Generates atomic CSS classes** — each CSS property-value pair becomes its own class.
4. **Replaces** every `pika(...)` call with the resulting class name string(s).
5. **Writes** the atomic CSS rules into the generated stylesheet (`pika.gen.css`).

### Source vs. compiled output

Your `pika()` call in source code:

<<< @/.examples/getting-started/first-pika-basic.vue{3-12}

Gets compiled to static class names in the output:

<<< @/.examples/getting-started/first-pika-compiled.html

And the generated `pika.gen.css` contains one atomic rule per property:

<<< @/.examples/getting-started/first-pika-output.css

::: tip Why atomic CSS?
Each CSS property-value pair is extracted to a **single, reusable class**. If another element uses `color: 'white'`, it will share the same `.d` class. This deduplication keeps the stylesheet small as your app grows.
:::

## Nested selectors

Style objects support nested selectors for pseudo-classes, media queries, and custom selectors. Nest them as keys in the style object — PikaCSS compiles each nested property to its own atomic class.

<<< @/.examples/getting-started/first-pika-nested.vue{12-18}

This produces the following atomic CSS:

<<< @/.examples/getting-started/first-pika-nested-output.css

## Multiple arguments

`pika()` accepts multiple arguments (each is a `StyleItem`). An argument may be a **style object** or a **string** (for shortcuts defined in your config). They are merged in order:

<<< @/.examples/getting-started/first-pika-multiple-args.vue{5-12}

## Output format variants

By default, `pika()` returns a space-separated string of class names (e.g. `"a b c"`). It also exposes variants for different output formats:

<<< @/.examples/getting-started/first-pika-variants.ts

| Variant       | Return type | Use case                                    |
| ------------- | ----------- | ------------------------------------------- |
| `pika()`      | Configured  | Default (usually `string`)                  |
| `pika.str()`  | `string`    | Force space-separated string                |
| `pika.arr()`  | `string[]`  | Force array of class names                  |

### IDE preview with `pikap`

`pikap` is a preview variant of `pika`. It has the same API, but provides **CSS preview tooltips** directly in your IDE. Use `pikap` during development to see the generated CSS without running a build.

## Configuration (optional)

PikaCSS works with zero configuration, but you can create a `pika.config.ts` (or `.js`, `.mjs`, `.mts`) to customize behavior. Use the `defineEngineConfig()` helper for full TypeScript autocomplete:

<<< @/.examples/getting-started/first-pika-config.ts

The config file is auto-detected by the plugin. See [Configuration](/guide/configuration) for all available options.

## Why this matters

You keep a **CSS-in-JS authoring experience** — standard CSS properties, TypeScript autocomplete, object composition — while shipping **static CSS output** with no runtime style generation overhead.

## Next

- [Build-time Compile](/principles/build-time-compile) — understand the compile strategy in detail
- [Configuration](/guide/configuration) — customize selectors, shortcuts, variables, and more
- [Built-in Plugins](/guide/built-in-plugins) — learn about the plugin system

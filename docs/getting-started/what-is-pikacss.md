# What is PikaCSS?

PikaCSS is an instant on-demand **Atomic CSS-in-JS engine**. It lets you author styles using familiar CSS property objects with full TypeScript autocomplete, and compiles them into optimized atomic CSS classes entirely at build time — **zero runtime overhead**.

## Core Idea

You write styles through the global `pika(...)` function using standard CSS properties in camelCase. The build plugin statically analyzes every `pika()` call, extracts each CSS property-value pair into its own atomic class, and replaces the call with the generated class names.

<<< @/.examples/getting-started/pika-basic-usage.ts

This means:

- **No runtime cost** — all style generation happens during the build step. The `pika()` calls are replaced with plain strings in the final bundle.
- **No custom vocabulary** — you write real CSS properties (`color`, `fontSize`, `padding`, etc.) rather than memorizing utility class names.
- **Full TypeScript autocomplete** — the build plugin generates a type declaration file (`pika.gen.ts`) that provides precise autocompletion for all CSS properties, custom selectors, shortcuts, and CSS variables.

## How It Works

PikaCSS combines two ideas:

1. **CSS-in-JS authoring** — style objects with nesting, composition, and TypeScript inference for readability and developer experience.
2. **Atomic CSS output** — each unique CSS property-value pair produces exactly one small, reusable class rule, keeping the final stylesheet compact.

The generated CSS contains one class per declaration:

<<< @/.examples/getting-started/atomic-output.css

When multiple components share the same declaration (e.g., `color: red`), they reuse the same atomic class. This deduplication keeps the CSS bundle size minimal regardless of how many components use the same styles.

## Nested Selectors and Responsive Design

Style definitions support nesting with pseudo-classes, media queries, and custom selectors defined in your configuration:

<<< @/.examples/getting-started/pika-nested-selectors.ts

Custom selectors like `@dark` or `@screen-md` are configured in your `pika.config.ts`. PikaCSS resolves them at build time into their actual CSS counterparts (e.g., `html.dark .a { ... }` or `@media screen and (min-width: 768px) { ... }`).

## Shortcuts

You can define reusable style combinations as **shortcuts** in your configuration and use them by passing string names to `pika()`:

<<< @/.examples/getting-started/pika-shortcuts-usage.ts

Shortcuts are resolved at build time — no runtime lookup involved.

## Built-in Plugins

The engine ships with five built-in plugins that are always loaded:

| Plugin | Purpose |
| --- | --- |
| **important** | Adds `!important` to all declarations (opt-in via config) |
| **variables** | Defines CSS custom properties (`--var`) with autocomplete, scoped by selector, and prunes unused variables |
| **keyframes** | Registers `@keyframes` animations with autocomplete for `animation` / `animationName` |
| **selectors** | Registers custom selector aliases (static or dynamic with RegExp) |
| **shortcuts** | Registers reusable style combinations (static or dynamic with RegExp) |

## Configuration

PikaCSS auto-detects config files named `{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}` from the integration working directory, which is usually your project root. Use `defineEngineConfig()` for type safety:

<<< @/.examples/getting-started/pika-config-example.ts

## Framework Integration

PikaCSS integrates with all major build tools through a universal [unplugin](https://github.com/unjs/unplugin)-based plugin. The default function name is `pika` and it is exposed as a **global function** — no import is needed in your source files. The build plugin statically finds and replaces all `pika()` calls at build time.

Supported build tools: **Vite**, **Rollup**, **Webpack**, **esbuild**, **Rspack**, **Rolldown**, and **Nuxt** (via a dedicated module).

Here is how it looks in a Vue single-file component:

<<< @/.examples/getting-started/pika-vue-example.vue

## When PikaCSS Is a Good Fit

Use PikaCSS when you want:

- **Type-safe style authoring** directly in your application code with full IDE support.
- **Build-time compilation** instead of any runtime styling work.
- **Build-tool integration across major ecosystems** including Vite, Webpack, Rspack, Rollup, esbuild, Rolldown, and Nuxt.
- **Minimal CSS output** thanks to atomic deduplication.

## Important Constraint

`pika()` calls are compiled **statically**. The build plugin evaluates the arguments using `new Function(...)`, so all arguments must be deterministic JavaScript expressions — no references to runtime-only variables, component state, or dynamic imports.

## Next

- Continue to [Installation](/getting-started/installation)
- Explore [Zero Config](/getting-started/zero-config)
- Review [Configuration](/guide/configuration)

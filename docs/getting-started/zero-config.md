# Zero Config

PikaCSS is designed to work out of the box with sensible defaults — no configuration file is needed to get started. "Zero config" means you can install PikaCSS, add the build plugin, and immediately start writing styles with the `pika()` function. The engine, code generation, file scanning, and config file creation are all handled automatically.

## What happens when the plugin starts

When the PikaCSS build plugin initializes, it automatically performs the following steps:

1. **Config discovery** — searches your project for an existing config file.
2. **Auto-create config** — if no config file is found, creates a `pika.config.js` with an empty config scaffold.
3. **Engine initialization** — creates the core engine with built-in plugins and default settings.
4. **File scanning** — scans your source files for `pika()` function calls.
5. **Code generation** — generates `pika.gen.css` (compiled atomic CSS) and `pika.gen.ts` (TypeScript autocomplete support).

All of these steps happen without any manual setup.

## Config file discovery

PikaCSS searches your project for files matching the glob pattern:

```text
**/{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}
```

This means any of these file names are recognized: `pika.config.js`, `pika.config.ts`, `pikacss.config.mjs`, etc.

If no config file is found and `autoCreateConfig` is enabled (which it is by default), PikaCSS automatically creates a `pika.config.js` in your project root:

<<< @/.examples/getting-started/auto-created-config.js

The `/// <reference path="..." />` directive links to the generated TypeScript file so your editor can provide autocomplete inside the config.

## Built-in plugins

Even with zero configuration, PikaCSS loads five built-in core plugins that power its fundamental features:

| Plugin | Description |
| --- | --- |
| `core:important` | Handles `!important` modifier for styles |
| `core:variables` | CSS custom properties (variables) with unused pruning |
| `core:keyframes` | `@keyframes` animation definitions with unused pruning |
| `core:selectors` | Custom selector resolution (e.g., pseudo-classes, media queries) |
| `core:shortcuts` | Reusable style shortcut resolution |

These plugins are always active — you do not need to add them to your config.

## Default engine configuration

When no config file exists (or the config object is empty), the engine uses these defaults:

<<< @/.examples/getting-started/default-engine-config.ts

Key points:

- **`prefix`** — Defaults to `'pk-'`. Generated class names are prefixed identifiers like `pk-a`, `pk-b`, `pk-c`. Set `prefix: ''` if you want bare IDs such as `a`, `b`, `c`.
- **`defaultSelector`** — `.%` turns each atomic style into a class selector where `%` is replaced by the style ID (e.g., `.pk-a { color: red }` with the default prefix).
- **`plugins`** — Empty array. Built-in plugins are always loaded separately.
- **`preflights`** — No global base styles. Plugins like `plugin-reset` can add them.
- **`important.default`** — `false`. Styles are not `!important` unless explicitly specified.
- **`variables.pruneUnused`** / **`keyframes.pruneUnused`** — `true`. Unused variables and keyframes are removed from the final CSS output.

## Default plugin options

The build plugin (e.g., for Vite) also has its own defaults:

<<< @/.examples/getting-started/plugin-options-defaults.ts

Key points:

- **`autoCreateConfig`** — `true`. A config file is auto-created if none exists.
- **`fnName`** — `'pika'`. This is the function name the plugin looks for in your source code.
- **`transformedFormat`** — `'string'`. The `pika()` call is replaced with a space-separated string of class names at build time.
- **`tsCodegen`** — `true`. Generates `pika.gen.ts` for TypeScript autocomplete.
- **`cssCodegen`** — `true`. Generates `pika.gen.css` containing all compiled atomic styles.
- **`scan.include`** — Scans all `js`, `ts`, `jsx`, `tsx`, and `vue` files by default.
- **`scan.exclude`** — Excludes `node_modules` and `dist` directories.

## Generated outputs

By default, PikaCSS generates two files in your project root:

- **`pika.gen.css`** — The compiled atomic CSS containing all styles found in your source files. Import this in your app entry via the virtual module `pika.css`.
- **`pika.gen.ts`** — A TypeScript declaration file that provides autocomplete support for the `pika()` function based on your configured selectors, shortcuts, variables, and layers. This file uses `declare global` to register `pika` as a global function — you do **not** import `pika` from this file.

## When to customize

You only need to create or edit a config file when you want to:

- Add a **prefix** to generated class names
- Define custom **selectors** (e.g., `hover`, responsive breakpoints)
- Create reusable **shortcuts** (e.g., `flex-center`)
- Declare CSS **variables** with theme support
- Add **plugins** (icons, reset, typography)
- Configure **preflights** (global base styles)
- Change codegen file paths

Here is an example of a customized config:

<<< @/.examples/getting-started/custom-config.ts

## Next

- Continue to [First Pika](/getting-started/first-pika)
- Review [Installation](/getting-started/installation)
- Explore [Configuration](/guide/configuration)

# Vite Integration

PikaCSS provides first-class Vite support through `@pikacss/unplugin-pikacss/vite`. It supports Vite 5 and Vite 6.

## Installation

::: code-group
<<< @/.examples/integrations/vite-install.sh [pnpm]
<<< @/.examples/integrations/vite-install-npm.sh [npm]
<<< @/.examples/integrations/vite-install-yarn.sh [yarn]
<<< @/.examples/integrations/vite-install-bun.sh [bun]
:::

## Basic Setup

### 1. Register the Plugin

Add the PikaCSS plugin to your `vite.config.ts`:

<<< @/.examples/integrations/vite-basic-config.ts

With a framework plugin (Vue or React), place PikaCSS after it:

::: code-group
<<< @/.examples/integrations/vite-vue-config.ts [Vue]
<<< @/.examples/integrations/vite-react-config.ts [React]
:::

### 2. Import the Virtual CSS Module

In your application entry file, import `pika.css` — this is a virtual module that Vite resolves to the generated atomic CSS file:

<<< @/.examples/integrations/vite-app-entry.ts

::: info Virtual Module
`pika.css` is not a real file on disk. The plugin intercepts Vite's module resolution and maps `pika.css` to the generated CSS codegen file (default: `pika.gen.css`). This module contains all the atomic CSS rules extracted from your `pika()` calls.
:::

### 3. Start Using PikaCSS

You're ready to go! Use `pika()` in your source files. On first run with the default `autoCreateConfig: true`, a `pika.config.ts` file will be auto-created in your project root.

## HMR Behavior (Dev Mode)

In `vite dev` mode, PikaCSS provides a full HMR experience:

- **Style changes**: When you modify `pika()` calls in your source files, the plugin re-scans and regenerates atomic CSS. The updated styles are hot-reloaded without a full page refresh.
- **Config file watching**: The plugin watches your `pika.config.ts` (or whichever config file is active). When the config file content changes, the plugin automatically reloads the engine configuration, invalidates affected modules, and triggers HMR updates.
- **Debounced codegen**: CSS and TypeScript codegen writes are debounced (300ms) to avoid excessive file system writes during rapid edits.

## Plugin Options

All options are optional. Here is a complete reference with defaults:

<<< @/.examples/integrations/vite-all-options.ts

### `scan`

Controls which files PikaCSS scans for `pika()` function calls. Accepts glob patterns.

| Property  | Type                 | Default                              | Description                  |
| --------- | -------------------- | ------------------------------------ | ---------------------------- |
| `include` | `string \| string[]` | `['**/*.{js,ts,jsx,tsx,vue}']`       | File patterns to scan        |
| `exclude` | `string \| string[]` | `['node_modules/**', 'dist/**']`     | File patterns to exclude     |

<<< @/.examples/integrations/vite-custom-scan.ts

### `fnName`

The function name PikaCSS looks for in source code. Change this if `pika` conflicts with another identifier in your project.

- **Type**: `string`
- **Default**: `'pika'`

<<< @/.examples/integrations/vite-custom-fnname.ts

### `transformedFormat`

Controls the output format of transformed `pika()` calls.

| Value      | Return Type | Example Output           | Use Case                             |
| ---------- | ----------- | ------------------------ | ------------------------------------ |
| `'string'` | `string`    | `"a b c"`                | Default — works with `class` binding |
| `'array'`  | `string[]`  | `['a', 'b', 'c']`       | For use with `clsx`, `classnames`    |
| `'inline'` | —           | inline style application | Direct style injection               |

<<< @/.examples/integrations/vite-custom-format.ts

### `config`

Provide engine configuration inline or as a file path. When omitted, the plugin auto-detects `pika.config.{js,ts,mjs,mts}` in the project root.

- **Type**: `EngineConfig | string`
- **Default**: `undefined` (auto-detected)

::: code-group
<<< @/.examples/integrations/vite-inline-config.ts [Inline Config]
<<< @/.examples/integrations/vite-config-path.ts [File Path]
:::

::: tip
When passing an inline config object, `autoCreateConfig` is ignored — no config file will be created on disk.
:::

### `autoCreateConfig`

Whether to automatically create a configuration file when none is found.

- **Type**: `boolean`
- **Default**: `true`

When `true` and no config file exists, a default `pika.config.ts` is created in the project root on first run.

### `tsCodegen`

Controls TypeScript code generation. The generated file provides type hints and autocomplete support for `pika()`.

- **Type**: `boolean | string`
- **Default**: `true` (resolves to `'pika.gen.ts'`)

| Value    | Behavior                                           |
| -------- | -------------------------------------------------- |
| `true`   | Generate `pika.gen.ts` in the project root         |
| `false`  | Disable TypeScript codegen                         |
| `string` | Generate at the specified path                     |

<<< @/.examples/integrations/vite-disable-ts-codegen.ts

### `cssCodegen`

Controls CSS code generation. The generated file contains all atomic CSS rules.

- **Type**: `true | string`
- **Default**: `true` (resolves to `'pika.gen.css'`)

| Value    | Behavior                                           |
| -------- | -------------------------------------------------- |
| `true`   | Generate `pika.gen.css` in the project root        |
| `string` | Generate at the specified path                     |

<<< @/.examples/integrations/vite-custom-codegen.ts

## How It Works

The Vite plugin is a thin `createVitePlugin(unpluginFactory)` adapter. All transform logic, codegen, virtual `pika.css` resolution, and config watching come from the shared unplugin factory (`packages/unplugin/src/index.ts`).

**Build mode** (`vite build`):
1. Scans all matched source files for `pika()` calls.
2. Replaces each `pika()` call with the generated class name(s).
3. Writes the full atomic CSS to the codegen file.

**Dev mode** (`vite dev`):
1. Transforms files on-demand as Vite serves them.
2. Watches the config file for changes and reloads the engine.
3. Uses debounced writes and HMR for a smooth development experience.

## Next

- [Rollup](/integrations/rollup)

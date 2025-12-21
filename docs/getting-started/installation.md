---
title: Installation
description: Learn how to install PikaCSS in your project, and understand the auto-generated files created by PikaCSS.
outline: deep
---

# Installation

## Unplugin

1. ### Install the unplugin
::: code-group

```bash [pnpm]
pnpm add -D @pikacss/unplugin-pikacss
```

```bash [yarn]
yarn add -D @pikacss/unplugin-pikacss
```

```bash [npm]
npm install -D @pikacss/unplugin-pikacss
```

:::

2. ### Apply the vite plugin (or other supported bundlers)

```ts [vite.config.ts]
import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		PikaCSS({ /* options */ }),
	],
})
```

3. ### Import the virtual module
```ts [main.ts]
import 'pika.css'
```

## Nuxt

1. ### Install the nuxt module

::: code-group

```bash [pnpm]
pnpm add -D @pikacss/nuxt-pikacss
```

```bash [yarn]
yarn add -D @pikacss/nuxt-pikacss
```

```bash [npm]
npm install -D @pikacss/nuxt-pikacss
```

:::

2. ### Apply the nuxt module

```ts [nuxt.config.ts]
export default defineNuxtConfig({
	modules: [
		'@pikacss/nuxt-pikacss',
	],

	pikacss: { /* options */ },
})
```

## Auto Generated Files

### `pika.config.ts` / `pika.config.js`
The PikaCSS engine configuration file. Generated automatically once if no configuration file or inline config is found. Contains engine options like prefix, selectors, plugins, preflights, etc.

### `pika.gen.ts`
TypeScript code generation file providing type definitions and auto-completion support for PikaCSS utilities. **Critical for DX**: Enables IDE auto-completion and type safety when using PikaCSS functions.

The auto-generated `pika.config.ts` includes a reference line that automatically includes type definitions into TypeScript's type system:
```ts
/// <reference path="./src/pika.gen.ts" />
```

If you use inline config or other advanced setups, ensure `pika.gen.ts` is included in your type system via:
- The reference comment in config file (recommended)
- `tsconfig.json` `include` paths
- IDE settings

Safe to add to `.gitignore` as it's auto-generated.

### `pika.gen.css`
CSS code generation file containing all scanned atomic styles used in your project. Automatically generated during development. Safe to add to `.gitignore`.

> It's recommended to add `pika.gen.ts` and `pika.gen.css` to your `.gitignore` file as they are auto-generated files and should not be committed to version control.

## Plugin Options

### `scan`
Configure file patterns for scanning pika() function calls.
- `include`: File patterns to scan (default: `['**/*.{js,ts,jsx,tsx,vue}']`)
- `exclude`: File patterns to exclude (default: `['node_modules/**']`)

### `config`
Engine configuration object or path to a config file.
- Pass an object: `{ prefix: 'pika-', defaultSelector: '.%' }`
- Or a file path: `'./pika.config.ts'`

### `autoCreateConfig`
Whether to automatically create a configuration file when needed. Default: `true`

### `fnName`
The name of the PikaCSS function in source code. Default: `'pika'`

### `transformedFormat`
Format of generated class names.
- `'string'`: Space-separated string (default) - `"a b c"`
- `'array'`: Array of class names - `['a', 'b', 'c']`
- `'inline'`: Object format for style objects

### `tsCodegen`
TypeScript code generation configuration.
- `true`: Auto-generate as `pika.gen.ts` (default)
- `string`: Custom file path - `'src/pika.gen.ts'`
- `false`: Disable

### `cssCodegen`
CSS code generation configuration.
- `true`: Auto-generate as `pika.gen.css` (default)
- `string`: Custom file path - `'src/styles/generated.css'`

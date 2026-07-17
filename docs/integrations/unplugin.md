---
title: Unplugin
description: Configure PikaCSS with any bundler using the universal unplugin integration.
relatedPackages:
  - '@pikacss/unplugin-pikacss'
relatedSources:
  - 'packages/unplugin/src/index.ts'
  - 'packages/unplugin/src/types.ts'
category: integrations
order: 10
---

# Unplugin

PikaCSS uses [unplugin](https://github.com/unjs/unplugin) to provide a single build plugin that works across all major bundlers.

The Vite entry supports Vite 7 and 8 only.

## Supported Tools

| Bundler | Import Path |
|---------|-------------|
| Vite | `@pikacss/unplugin-pikacss/vite` |
| Webpack | `@pikacss/unplugin-pikacss/webpack` |
| Rspack | `@pikacss/unplugin-pikacss/rspack` |
| esbuild | `@pikacss/unplugin-pikacss/esbuild` |
| Rollup | `@pikacss/unplugin-pikacss/rollup` |
| Rolldown | `@pikacss/unplugin-pikacss/rolldown` |

Example with Vite:

```ts
// vite.config.ts
import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    PikaCSS({
      // options
    }),
  ],
})
```

:::tip Vite plugin order
The Vite entry registers with `enforce: 'pre'`. PikaCSS still runs before framework compiler plugins even if your Vite `plugins` array is ordered as `[vue(), pikacss()]`, so you do not need to reorder the array just to avoid template compile errors.
:::

## Config

| Property | Description |
|---|---|
| cwd | Explicit working directory for path resolution. Overrides the bundler-detected project root. |
| scan | File glob patterns controlling which source files are scanned for `pika()` call sites. When `scan.include` is not set, the default covers `**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}`; the default `exclude` skips `node_modules`, `dist`, `.git`, `.nuxt`, `.output`, and `coverage`. |
| config | PikaCSS engine configuration, either as an inline object or a path to a config module. When omitted, a config file is discovered in the project root only (candidates `pika.config.*` then `pikacss.config.*`, TS variants first). |
| autoCreateConfig | When `true`, auto-creates a `pika.config.js` file if none is found. Default: `false` — a build plugin should not write files into your repo; create a config yourself or opt in. |
| fnName | Function identifier the scanner looks for when extracting call sites. Default: `'pika'`. |
| transformedFormat | Output shape of transformed `pika()` calls: `'string'` or `'array'`. |
| tsCodegen | Controls TypeScript type-definition code generation. |
| cssCodegen | Controls CSS code-generation output. CSS codegen cannot be fully disabled. |

> See [API Reference — Unplugin](/api/unplugin) for full type signatures and defaults.

## TypeScript and `import 'pika.css'`

In Vite projects, the ambient `*.css` module declaration from `vite/client` covers the `pika.css` specifier. PikaCSS itself ships no ambient declaration for it, so TypeScript projects on other bundlers (webpack, Rspack, esbuild) may report `TS2307: Cannot find module 'pika.css'`. Add a two-line shim to any `.d.ts` file in your program:

```ts
// pika-css.d.ts
declare module 'pika.css'
```

## Next

- [Nuxt](/integrations/nuxt) — zero-config Nuxt integration.
- [Setup](/getting-started/setup) — basic project setup.

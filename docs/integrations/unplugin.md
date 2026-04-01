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

## Config

| Property | Description |
|---|---|
| cwd | Explicit working directory for path resolution. Overrides the bundler-detected project root. |
| scan | File glob patterns controlling which source files are scanned for `pika()` call sites. |
| config | PikaCSS engine configuration, either as an inline object or a path to a config module. |
| autoCreateConfig | When `true`, auto-creates a PikaCSS config file if none is found. |
| fnName | Function identifier the scanner looks for when extracting call sites. Default: `'pika'`. |
| transformedFormat | Output shape of transformed `pika()` calls: `'string'` or `'array'`. |
| tsCodegen | Controls TypeScript type-definition code generation. |
| cssCodegen | Controls CSS code-generation output. CSS codegen cannot be fully disabled. |

> See [API Reference — Unplugin](/api/unplugin) for full type signatures and defaults.

## Next

- [Nuxt](/integrations/nuxt) — zero-config Nuxt integration.
- [Setup](/getting-started/setup) — basic project setup.

---
title: Setup
description: Install PikaCSS and configure your build tool to start using atomic CSS-in-JS.
relatedPackages:
  - '@pikacss/core'
  - '@pikacss/unplugin-pikacss'
relatedSources:
  - 'packages/unplugin/src/index.ts'
category: getting-started
order: 20
---

# Setup

Install PikaCSS and add the build plugin to start generating atomic CSS from your style definitions.

## Install

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/core @pikacss/unplugin-pikacss
```

```sh [npm]
npm install -D @pikacss/core @pikacss/unplugin-pikacss
```

```sh [yarn]
yarn add -D @pikacss/core @pikacss/unplugin-pikacss
```

:::

## Apply Vite Plugin

Add the PikaCSS Vite plugin to your `vite.config.ts`:

```ts
// vite.config.ts
import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    PikaCSS(),
  ],
})
```

For other build tools, see [Integrations](/integrations/unplugin).

## Import `pika.css`

Import the generated CSS file in your application entry point:

```ts
// main.ts
import 'pika.css'
```

This import resolves to the generated `pika.gen.css` file that contains all your atomic styles.

## Generated Files

### pika.gen.ts

A TypeScript declaration file generated automatically by the build plugin. It provides type definitions and autocomplete support for the `pika()` function, including all custom selectors, shortcuts, variables, and plugin-contributed properties.

You do not need to import this file directly — it is referenced automatically by the plugin.

### pika.gen.css

The generated CSS file containing:

- Layer order declarations
- Preflight styles (resets, variables, keyframes)
- Atomic utility classes

This file is imported via `import 'pika.css'` and is updated automatically when your source code or configuration changes.

## Next

- [Usage](/getting-started/usage) — learn how to write styles with `pika()`.
- [Engine Config](/getting-started/engine-config) — configure layers, preflights, and plugins.
- [ESLint Config](/getting-started/eslint-config) — enable static analysis for style definitions.

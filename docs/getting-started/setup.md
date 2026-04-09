---
title: Setup
description: Install PikaCSS and configure your build tool to start using atomic CSS-in-JS.
relatedPackages:
  - '@pikacss/core'
  - '@pikacss/unplugin-pikacss'
relatedSources:
  - 'packages/unplugin/package.json'
  - 'packages/unplugin/src/vite.ts'
  - 'packages/unplugin/src/index.ts'
  - 'packages/unplugin/src/types.ts'
  - 'packages/integration/src/ctx.ts'
  - 'packages/integration/src/tsCodegen.ts'
  - 'packages/core/src/internal/plugins/selectors.ts'
  - 'packages/core/src/internal/plugins/shortcuts.ts'
  - 'packages/core/src/internal/plugins/variables.ts'
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

<<< @/.examples/getting-started/setup.vite.example.ts

For other build tools, see [Integrations](/integrations/unplugin).

## Import `pika.css`

Import the generated CSS file in your application entry point:

<<< @/.examples/getting-started/setup.main.example.ts

This import resolves to the generated CSS output that contains all your atomic styles. By default that file is `pika.gen.css`, but `cssCodegen` can point it to a different output path.

## Generated Files

By default, the build plugin writes `pika.gen.ts` and `pika.gen.css`. Setting `tsCodegen` or `cssCodegen` to a string writes the same outputs to custom paths. Setting `tsCodegen` to `false` disables TypeScript declaration codegen entirely.

### pika.gen.ts

When `tsCodegen` is enabled, the build plugin generates a TypeScript declaration file. By default this file is named `pika.gen.ts`, but a string value can write it to a custom path. It provides type definitions and autocomplete support for the `pika()` function, including all custom selectors, shortcuts, variables, and plugin-contributed properties.

You do not usually import this file directly. The integration generates it for you, but TypeScript only sees its declarations when the generated path is part of your project through your `tsconfig`/`include`. In scaffolded configs, PikaCSS may also add a triple-slash reference to the generated declaration file, but that is a convenience of the scaffolded file rather than the guarantee.

### pika.gen.css

The generated CSS file containing:

- Layer order declarations
- Preflight styles (resets, variables, keyframes)
- Atomic utility classes

By default this file is named `pika.gen.css`. It is imported via `import 'pika.css'` and is updated automatically when your source code or configuration changes, even if you customize `cssCodegen` to write a different filename.

## Next

- [Usage](/getting-started/usage) — learn how to write styles with `pika()`.
- [Engine Config](/getting-started/engine-config) — configure layers, preflights, and plugins.
- [ESLint Config](/getting-started/eslint-config) — enable static analysis for style definitions.

---
title: Fonts
description: Manage web font loading with provider abstraction using the fonts plugin.
relatedPackages:
  - '@pikacss/plugin-fonts'
relatedSources:
  - 'packages/plugin-fonts/src/index.ts'
category: official-plugins
order: 40
---

# Fonts

Manage web font loading with a provider abstraction layer.

The fonts plugin handles web font loading through configurable providers. It generates `@font-face` rules and CSS imports as preflight CSS, with built-in support for Google Fonts and extensible provider architecture.

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/plugin-fonts
```

```sh [npm]
npm install -D @pikacss/plugin-fonts
```

```sh [yarn]
yarn add -D @pikacss/plugin-fonts
```

:::

```ts
import { defineEngineConfig } from '@pikacss/core'
import { fonts } from '@pikacss/plugin-fonts'

export default defineEngineConfig({
  plugins: [fonts()],
  fonts: {
    provider: 'google',
    families: [
      { name: 'Inter', weights: [400, 500, 600, 700] },
      { name: 'Fira Code', weights: [400, 500] },
    ],
  },
})
```

## Config

| Property | Description |
|---|---|
| provider | Default font provider service. Built-in options: `'google'`, `'none'`. |
| fonts | Font metadata entries describing families to load with weights and variants. |
| families | Font family configurations with name, weights, italic variants, and optional per-font provider. |
| imports | Raw CSS `@import` URLs for font stylesheets to inject. |
| faces | Explicit `@font-face` rule definitions for self-hosted or custom fonts. |
| display | `font-display` property value for generated `@font-face` rules. Default: `'swap'`. |
| providers | Custom font provider definitions created with `defineFontsProvider()`. |
| providerOptions | Per-provider configuration options passed to the provider resolver. |

> See [API Reference — Plugin Fonts](/api/plugin-fonts) for full type signatures and defaults.

## Next

- [Reset](/official-plugins/reset) — CSS reset stylesheets.
- [Typography](/official-plugins/typography) — semantic prose styling.

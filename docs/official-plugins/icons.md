---
title: Icons
description: Resolve icon shortcut classes via Iconify with the icons plugin.
relatedPackages:
  - '@pikacss/plugin-icons'
relatedSources:
  - 'packages/plugin-icons/src/index.ts'
category: official-plugins
order: 30
---

# Icons

Resolve icon shortcut classes into CSS via Iconify integration.

The icons plugin resolves shortcut patterns like `i-mdi:home` into CSS declarations that display icons using `mask-image` or `background-image`. Icons are loaded from three sources in order: custom collections, locally installed `@iconify-json/*` packages, and an optional CDN fallback.

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/plugin-icons
```

```sh [npm]
npm install -D @pikacss/plugin-icons
```

```sh [yarn]
yarn add -D @pikacss/plugin-icons
```

:::

```ts
import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  plugins: [icons()],
  icons: {
    prefix: 'i-',
    mode: 'auto',
  },
})
```

Usage:

```ts
// Use an icon
pika('i-mdi:home')

// Force mask mode (colorable with currentColor)
pika('i-mdi:home?mask')

// Force background mode
pika('i-mdi:home?bg')
```

Install icon collections as needed:

::: code-group

```sh [pnpm]
pnpm add -D @iconify-json/mdi
```

```sh [npm]
npm install -D @iconify-json/mdi
```

```sh [yarn]
yarn add -D @iconify-json/mdi
```

:::

## Config

| Property | Description |
|---|---|
| prefix | Shortcut prefix(es) that trigger icon resolution, e.g. `'i-'`. |
| mode | CSS rendering technique: `'mask'` (colorable via `currentColor`), `'bg'` (background-image), or `'auto'`. |
| scale | Scaling factor applied to icon SVGs. Combined with `unit` for final dimensions. |
| collections | Custom icon collections resolved before local or CDN sources. |
| customizations | Iconify SVG customizations applied during icon loading. |
| autoInstall | When `true`, auto-installs missing `@iconify-json/*` packages on first use. |
| cwd | Working directory for resolving locally installed icon packages. |
| cdn | CDN URL template for fetching remote icon collections as a fallback. |
| unit | CSS unit appended to icon dimensions, e.g. `'em'`. |
| extraProperties | Additional CSS properties injected into every icon's style declaration. |
| processor | Post-processing hook invoked after the icon CSS style item is built. |
| autocomplete | Extra icon names to include in IDE autocomplete suggestions. |

> See [API Reference — Plugin Icons](/api/plugin-icons) for full type signatures and defaults.

## Processor Metadata

`processor` receives the mutable generated style item and metadata describing the resolved icon:

```ts
import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  plugins: [icons()],
  icons: {
    processor(styleItem, meta) {
      // meta.collection: resolved Iconify collection
      // meta.name: resolved icon name
      // meta.svg: loaded SVG source
      // meta.source: 'custom' | 'local' | 'cdn'
      // meta.mode: final 'mask' or 'bg' mode after resolving 'auto'
    },
  },
})
```

The callback may mutate `styleItem` to inject or replace declarations before the shortcut result is returned.

## Loading and Retry Behavior

Resolution checks custom collections first, then locally installed packages, then the configured CDN. A missing or temporarily unavailable icon logs a warning but is not cached as a permanent miss. Later resolutions retry the load, and failed CDN requests are removed from the collection cache before the next attempt.

Custom collection values are opaque Iconify loader functions or inline SVG maps. Their backing file paths are therefore not known to PikaCSS and cannot currently be registered as config dependencies. Editing files used by a custom collection does not automatically trigger a config reload; restart the dev process or touch the PikaCSS config after changing those files.

## Next

- [Fonts](/official-plugins/fonts) — web font loading and management.
- [Reset](/official-plugins/reset) — CSS reset stylesheets.

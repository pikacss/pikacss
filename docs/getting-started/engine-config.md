---
title: Engine Config
description: Complete reference for all PikaCSS engine configuration options.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/types.ts'
  - 'packages/core/src/internal/engine.ts'
category: getting-started
order: 40
---

# Engine Config

The engine configuration controls every aspect of PikaCSS. Create a `pika.config.ts` file in your project root:

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  // options here
})
```

## Config

### Core

| Property | Description |
|---|---|
| prefix | Class name prefix prepended to every generated atomic class name. Default: `'pk-'`. |
| defaultSelector | CSS selector template for atomic styles. `$` is replaced with the generated class ID. Default: `'.$'`. |
| plugins | Array of engine plugins to load in resolution order. See [Plugin Development](/plugin-development/create-a-plugin). |
| layers | Map of CSS `@layer` names to numeric priorities. Lower numbers render earlier. See [Layers](/customizations/layers). |
| defaultPreflightsLayer | Layer name for preflight styles. Default: `'preflights'`. |
| defaultUtilitiesLayer | Layer name for atomic utility styles. Default: `'utilities'`. |
| preflights | Base styles injected before utilities. See [Preflights](/customizations/preflights). |
| cssImports | Array of CSS `@import` rules included at the top of generated output. |
| important | When `true`, all generated declarations include `!important`. See [Important](/customizations/important). |

### Customizations

| Property | Description |
|---|---|
| autocomplete | IDE autocomplete configuration. See [Autocomplete](/customizations/autocomplete). |
| selectors | Custom selector mappings for nested selectors. See [Selectors](/customizations/selectors). |
| shortcuts | Reusable style definition aliases. See [Shortcuts](/customizations/shortcuts). |
| variables | CSS custom properties injected under `:root`. See [Variables](/customizations/variables). |
| keyframes | CSS `@keyframes` animation definitions. See [Keyframes](/customizations/keyframes). |

### Plugin Config

::: tip
These fields are added by official plugins via [type augmentation](/plugin-development/type-augmentation). Install the corresponding plugin package to use them.
:::

| Property | Description |
|---|---|
| reset | See [Reset plugin](/official-plugins/reset). |
| typography | See [Typography plugin](/official-plugins/typography). |
| icons | See [Icons plugin](/official-plugins/icons). |
| fonts | See [Fonts plugin](/official-plugins/fonts). |

> See [API Reference — Core](/api/core) for full type signatures and defaults.

## Examples

<<< @/.examples/customizations/selectors.example.ts

## Next

- [ESLint Config](/getting-started/eslint-config) — set up linting for PikaCSS.
- [Customizations](/customizations/layers) — explore all customization options.
- [Official Plugins](/official-plugins/reset) — add CSS resets, icons, fonts, and more.

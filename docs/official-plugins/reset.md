---
title: Reset
description: Inject community CSS reset stylesheets as preflight using the reset plugin.
relatedPackages:
  - '@pikacss/plugin-reset'
relatedSources:
  - 'packages/plugin-reset/src/index.ts'
category: official-plugins
order: 10
---

# Reset

Inject a community CSS reset stylesheet as preflight CSS.

The reset plugin injects a CSS reset as preflight, ensuring a consistent baseline across browsers. It supports several well-known community resets and adds a dedicated `reset` layer with priority `-1` so reset styles always render first.

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/plugin-reset
```

```sh [npm]
npm install -D @pikacss/plugin-reset
```

```sh [yarn]
yarn add -D @pikacss/plugin-reset
```

:::

```ts
import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
  plugins: [reset()],
})
```

## Config

| Property | Description |
|---|---|
| reset | CSS reset preset to inject. Options: `'andy-bell'`, `'eric-meyer'`, `'modern-normalize'`, `'normalize'`, `'the-new-css-reset'`. Default: `'modern-normalize'`. |

> See [API Reference — Plugin Reset](/api/plugin-reset) for full type signatures and defaults.

## Next

- [Typography](/official-plugins/typography) — semantic prose styling.
- [Icons](/official-plugins/icons) — icon integration via Iconify.

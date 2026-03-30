---
title: Important
description: Make all generated atomic CSS declarations use !important.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/plugins/important.ts'
category: customizations
order: 20
---

# Important

Force all generated atomic CSS declarations to include `!important`.

When integrating PikaCSS into an existing project with high-specificity styles, you may need all generated atomic classes to win the cascade. Setting `important: true` appends `!important` to every generated CSS value.

## Config

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  important: true,
})
```

## Examples

::: code-group

<<< @/.examples/customizations/important.example.pikain.ts [Input]

<<< @/.examples/customizations/important.example.pikaout.css [Output]

:::

## Next

- [Preflights](/customizations/preflights) — inject base CSS before utilities.
- [Layers](/customizations/layers) — control cascade ordering.

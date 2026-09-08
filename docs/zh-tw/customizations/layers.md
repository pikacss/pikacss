---
title: Layers
description: 在 PikaCSS 中，用 @layer 宣告控制 CSS 層疊順序。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/engine.ts
  - packages/core/src/plugins/layers.ts
category: customizations
order: 10
translation:
  sourceFile: docs/customizations/layers.md
  sourceBlob: ebe119332bc4a55839355dbf911fb8945c143ee1
---

# Layers {#layers}

PikaCSS 使用 CSS `@layer` 來建立 preflight 樣式與 utility class 之間的層疊順序。

CSS layer 讓你能明確控制層疊順序。PikaCSS 會在 CSS 輸出的最上方產生一段 `@layer` 宣告。使用預設 priority 時，preflight 會排在 utility 之前；自訂 priority 可以重新排列這兩個預設 layer，也可以把其他 layer 插入任意位置。

預設情況下，PikaCSS 會建立兩個 layer：`preflights`（優先度 1）與 `utilities`（優先度 10）。數字越小，在 layer 順序中就越早輸出。

## 設定 {#config}

透過引擎設定中的 `layers` 來設定 layer：

```ts
import { defineConfig } from '@pikacss/unplugin-pikacss'

export default defineConfig({
  engine: {
    layers: {
      reset: -1, // 在 preflights 之前
      preflights: 1, // 預設
      components: 5, // 介於 preflights 與 utilities 之間
      utilities: 10, // 預設
    },
  },
})
```

在樣式定義中使用 `__layer` 這個 meta-property，把樣式指派到特定的 layer：

```ts
pika({
  __layer: 'components',
  display: 'flex',
  padding: '1rem',
})
```

相關的設定選項：

- `defaultPreflightsLayer`：沒有指定 layer 的 preflight 所使用的 layer（預設：`'preflights'`）。
- `defaultUtilitiesLayer`：utility 樣式的備用 layer（預設：`'utilities'`）。

## 範例 {#examples}

::: code-group

<<< @/zh-tw/.examples/customizations/layers.example.pikain.ts [輸入]

<<< @/zh-tw/.examples/customizations/layers.example.pikaout.css [輸出]

:::

## 下一步 {#next}

- [Important](/zh-tw/customizations/important)：為所有樣式加上 `!important`。
- [Preflights](/zh-tw/customizations/preflights)：在 utility 之前注入基礎 CSS。

---
title: 引擎設定
description: PikaCSS 引擎所有設定選項的完整參考。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/types/public.ts
  - packages/core/src/engine.ts
category: getting-started
order: 40
translation:
  sourceFile: docs/getting-started/engine-config.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: a0a7bc80c7252574ae4ba98f2a05f1c120fab60d
---

# 引擎設定 {#engine-config}

引擎設定掌控 PikaCSS 的每一個面向。在你的專案根目錄建立一個 `pika.config.ts`（或 `.js`）；除非你用 `autoCreateConfig: true` 主動啟用，否則外掛不會幫你建立（見 [安裝與設定](/zh-tw/getting-started/setup#pika-config-js)）。絕對不要同時保留 `pika.config.ts` 與 `pika.config.js`：設定探索會載入優先順序最高的根目錄層級候選檔案，其餘則忽略。

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  // 在這裡填入設定選項
})
```

## 設定 {#config}

### 核心 {#core}

| 屬性 | 說明 |
|---|---|
| prefix | 加在每一個產生的原子 class 名稱前面的 class 名稱前綴。預設：`'pk-'`。 |
| defaultSelector | 原子樣式使用的 CSS 選擇器範本。`%` 會替換成產生的原子 class ID，因此範本裡必須包含 `%`。預設：`'.%'`。 |
| plugins | 依解析順序載入的引擎外掛陣列。見 [外掛開發](/zh-tw/plugin-development/create-a-plugin)。 |
| layers | CSS `@layer` 名稱與數字優先權的對應。數字越小越早渲染。見 [Layers](/zh-tw/customizations/layers)。 |
| defaultPreflightsLayer | preflight 樣式使用的 layer 名稱。預設：`'preflights'`。 |
| defaultUtilitiesLayer | 原子 utility 樣式使用的 layer 名稱。預設：`'utilities'`。 |
| preflights | 在 utilities 之前注入的基礎樣式。見 [Preflights](/zh-tw/customizations/preflights)。 |
| cssImports | 一組 CSS `@import` 規則的陣列，會放在產生輸出的最上方。 |
| important | 設成 `{ default: true }` 時，所有產生的宣告都會加上 `!important`。見 [Important](/zh-tw/customizations/important)。 |

::: tip 兩個 placeholder
`%` 是用在 `defaultSelector` 裡的原子 class ID placeholder（例如 `'.%'` 會變成 `.pk-a`），而 `$` 則是用在樣式定義與自訂選擇器裡的巢狀選擇器 placeholder，會展開成整個 `defaultSelector`。
:::

### 客製化 {#customizations}

| 屬性 | 說明 |
|---|---|
| autocomplete | IDE 自動完成設定。見 [自動完成](/zh-tw/customizations/autocomplete)。 |
| selectors | 巢狀選擇器的自訂選擇器對應。見 [選擇器](/zh-tw/customizations/selectors)。 |
| shortcuts | 可重複使用的樣式定義別名。見 [Shortcuts](/zh-tw/customizations/shortcuts)。 |
| variables | 注入到 `:root` 底下的 CSS 自訂屬性。見 [變數](/zh-tw/customizations/variables)。 |
| keyframes | CSS `@keyframes` 動畫定義。見 [Keyframes](/zh-tw/customizations/keyframes)。 |

### 外掛設定 {#plugin-config}

::: tip 提示
這些欄位是官方外掛透過 [型別擴增](/zh-tw/plugin-development/type-augmentation) 加入的。安裝對應的外掛套件即可使用。
:::

| 屬性 | 說明 |
|---|---|
| reset | 見 [Reset 外掛](/zh-tw/official-plugins/reset)。 |
| typography | 見 [Typography 外掛](/zh-tw/official-plugins/typography)。 |
| icons | 見 [Icons 外掛](/zh-tw/official-plugins/icons)。 |
| fonts | 見 [Fonts 外掛](/zh-tw/official-plugins/fonts)。 |
| designTokens | 見 [Design Tokens 外掛](/zh-tw/official-plugins/design-tokens)。 |

> 完整的型別簽章與預設值請見 [API 參考 — Core](/api/core)。

## 範例 {#examples}

<<< @/zh-tw/.examples/customizations/selectors.example.ts

## 下一步 {#next}

- [ESLint 設定](/zh-tw/getting-started/eslint-config)：為 PikaCSS 設定 lint。
- [客製化](/zh-tw/customizations/layers)：探索所有客製化選項。
- [官方外掛](/zh-tw/official-plugins/reset)：加入 CSS reset、圖示、字型等更多功能。

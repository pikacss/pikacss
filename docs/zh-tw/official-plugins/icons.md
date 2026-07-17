---
title: 圖示
description: 使用 icons 外掛，透過 Iconify 解析圖示 shortcut class。
relatedPackages:
  - '@pikacss/plugin-icons'
relatedSources:
  - packages/plugin-icons/src/index.ts
category: official-plugins
order: 30
translation:
  sourceFile: docs/official-plugins/icons.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: b7a3e5cd12068e6232ab3d0f641a27ee3b71dbfe
---

# 圖示 {#icons}

透過 Iconify 整合，把圖示 shortcut class 解析成 CSS。

icons 外掛會把像 `i-mdi:home` 這樣的 shortcut pattern 解析成 CSS 宣告，並用 `mask-image` 或 `background-image` 顯示圖示。圖示會依序從三個來源載入：自訂 collection、本機安裝的 `@iconify-json/*` 套件，以及選用的 CDN 備用來源。

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

使用方式：

```ts
// 使用一個圖示
pika('i-mdi:home')

// 強制使用 mask 模式（可用 currentColor 上色）
pika('i-mdi:home?mask')

// 強制使用 background 模式
pika('i-mdi:home?bg')
```

視需要安裝圖示 collection：

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

## 設定 {#config}

| 屬性 | 說明 |
|---|---|
| prefix | 觸發圖示解析的 shortcut 前綴，例如 `'i-'`。 |
| mode | CSS 呈現技術：`'mask'`（可透過 `currentColor` 上色）、`'bg'`（background-image），或 `'auto'`。 |
| scale | 套用到圖示 SVG 的縮放係數。會與 `unit` 結合以決定最終尺寸。 |
| collections | 自訂圖示 collection，會在本機或 CDN 來源之前解析。 |
| customizations | 載入圖示時套用的 Iconify SVG 自訂設定。 |
| autoInstall | 設為 `true` 時，會在第一次使用時自動安裝缺少的 `@iconify-json/*` 套件。 |
| cwd | 解析本機安裝的圖示套件時使用的工作目錄。 |
| cdn | 作為備用來源、用來抓取遠端圖示 collection 的 CDN URL 範本。 |
| unit | 附加到圖示尺寸的 CSS 單位，例如 `'em'`。 |
| extraProperties | 注入到每個圖示樣式宣告中的額外 CSS 屬性。 |
| processor | 在圖示 CSS 樣式項目建置完成後呼叫的後處理 hook。 |
| autocomplete | 要加入 IDE 自動完成建議中的額外圖示名稱。 |

> 完整的型別簽章與預設值請見 [API 參考 — Plugin Icons](/api/plugin-icons)。

## 下一步 {#next}

- [字型](/zh-tw/official-plugins/fonts)：網頁字型的載入與管理。
- [Reset](/zh-tw/official-plugins/reset)：CSS reset 樣式表。

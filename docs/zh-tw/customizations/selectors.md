---
title: 選擇器
description: 定義自訂選擇器對應，讓巢狀樣式定義更簡潔。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/plugins/selectors.ts
category: customizations
order: 60
translation:
  sourceFile: docs/customizations/selectors.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: 19197d66dbeca50b49afd3abb379e0c4f2f58241
---

# 選擇器 {#selectors}

把簡短的名稱對應到 CSS 選擇器模式，讓巢狀樣式定義更簡潔。

自訂選擇器讓你為複雜的 CSS 選擇器定義簡短、好讀的名稱。與其反覆撰寫完整的 `@media` 查詢或複合選擇器，你可以定義一次，然後在樣式定義中用名稱來參照它們。

PikaCSS 會把選擇器值中的 `$` placeholder 換成產生出來的原子 class 選擇器。

## 設定 {#config}

一個選擇器定義可以接受好幾種形式：

- **靜態 tuple** `[name, cssSelector]`：把一個明確的名稱對應到一個或多個解析後的 CSS 選擇器。
- **動態 tuple** `[RegExp, resolver, autocomplete?]`：比對一個模式，並延遲計算選擇器。選填的第三個元素會列出這個模式的自動完成建議（例如 `'@container-${name}'`）。resolver 可以回傳 `undefined`／`null` 來表示「目前尚未解析」：此時不會快取任何內容，這條規則會在之後的解析呼叫中重試。
- **物件形式** `{ selector, value }`（靜態）或 `{ selector, value, autocomplete? }`（動態），與 tuple 形式等效。
- **純字串**：只會把該名稱註冊成自動完成建議，適合用來重導向到在其他地方解析的選擇器。

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  selectors: {
    definitions: [
      // 靜態配對：[name, cssSelector]
      ['@dark', 'html.dark $'],
      ['@light', 'html:not(.dark) $'],

      // 媒體查詢選擇器
      ['@sm', '@media (min-width: 640px)'],
      ['@md', '@media (min-width: 768px)'],
      ['@lg', '@media (min-width: 1024px)'],
      ['@xl', '@media (min-width: 1280px)'],

      // 動態模式：[RegExp, resolver, autocomplete?]
      [/^@container-(.+)$/, ([, name]) => `@container ${name}`, '@container-${name}'],

      // 物件形式
      {
        selector: '@print',
        value: '@media print',
      },
    ],
  },
})
```

在樣式定義中使用自訂選擇器：

```ts
pika({
  'color': 'black',
  '@dark': { color: 'white' },
  '@sm': { fontSize: '14px' },
  '@lg': { fontSize: '18px' },
})
```

## 範例 {#examples}

<<< @/zh-tw/.examples/customizations/selectors.example.ts

## 下一步 {#next}

- [Shortcuts](/zh-tw/customizations/shortcuts)：建立可重複使用的樣式別名。
- [變數](/zh-tw/customizations/variables)：定義 CSS 自訂屬性。

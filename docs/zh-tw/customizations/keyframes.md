---
title: Keyframes
description: 在 PikaCSS 引擎設定中定義 CSS @keyframes 動畫。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/plugins/keyframes.ts
category: customizations
order: 50
translation:
  sourceFile: docs/customizations/keyframes.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: 12c606f54a3a48f5320bcfe66638954ab61c58aa
---

# Keyframes {#keyframes}

向引擎註冊 CSS `@keyframes` 動畫。

PikaCSS 讓你在引擎設定中定義關鍵影格動畫。動畫名稱會註冊到自動完成，而每一條 `@keyframes` 規則只有在某個 `animation` 或 `animation-name` 原子樣式參照到它的名稱時，才會以 preflight CSS 的形式輸出，未使用的關鍵影格會從輸出中剔除。把 `pruneUnused: false` 設起來（設定層級的預設值，或透過 tuple 的第四個元素／物件形式的 `pruneUnused` 欄位針對個別定義設定），就能一律輸出某條 keyframes 規則，例如當它被外部 CSS 使用時。

## 設定 {#config}

keyframes 可以定義成 tuple 或物件：

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  keyframes: {
    definitions: [
      // tuple 形式：[name, frames]
      ['fade-in', {
        from: { opacity: '0' },
        to: { opacity: '1' },
      }],

      // 使用百分比
      ['slide-in', {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      }],

      // 只有名稱（影格定義在別處，例如在 CSS 中）
      'spin',
    ],
  },
})
```

在你的樣式中使用動畫名稱：

```ts
pika({
  animation: 'fade-in 0.3s ease-in-out',
})
```

## 範例 {#examples}

<<< @/zh-tw/.examples/customizations/keyframes.example.ts

## 下一步 {#next}

- [選擇器](/zh-tw/customizations/selectors)：建立自訂的選擇器對應。
- [變數](/zh-tw/customizations/variables)：定義 CSS 自訂屬性。

---
title: Shortcuts
description: 定義可重複使用的樣式別名，會展開成完整的樣式定義。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/plugins/shortcuts.ts
category: customizations
order: 70
translation:
  sourceFile: docs/customizations/shortcuts.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: fe4d211ab900616fd3ef57c936a2aad9e2d8264c
---

# Shortcuts {#shortcuts}

建立可重複使用的別名，會展開成完整的樣式定義。

shortcut 讓你定義具名的樣式組合，可以在 `pika()` 呼叫中以字串引數的形式參照。它們的運作方式就像 utility class 的 preset：定義一次，就能到處重複使用。

## 設定 {#config}

一個 shortcut 定義可以接受好幾種形式（與 [選擇器](/zh-tw/customizations/selectors) 相同）：

- **靜態 tuple** `[name, styleDefinition]`：把一個明確的名稱對應到一個或多個樣式項目。
- **動態 tuple** `[RegExp, resolver, autocomplete?]`：比對一個模式，並延遲計算樣式項目。選填的第三個元素會列出這個模式的自動完成建議（例如 `'size-${length}'`）。resolver 可以回傳 `undefined`／`null` 來表示「目前尚未解析」：此時不會快取任何內容，這條規則會在之後的解析呼叫中重試。
- **物件形式** `{ shortcut, value }`（靜態）或 `{ shortcut, value, autocomplete? }`（動態），與 tuple 形式等效。
- **純字串**：只會把該名稱註冊成自動完成建議。

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  shortcuts: {
    definitions: [
      // 靜態配對：[name, styleDefinition]
      ['flex-center', {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }],

      // 帶有巢狀選擇器的靜態配對
      ['btn', {
        'padding': '0.5rem 1rem',
        'borderRadius': '0.25rem',
        'cursor': 'pointer',
        '$:hover': { opacity: '0.8' },
      }],

      // 動態模式：[RegExp, resolver, autocomplete?]
      [/^size-(.+)$/, ([, size]) => ({
        width: size,
        height: size,
      }), 'size-${length}'],

      // 物件形式
      {
        shortcut: 'card',
        value: { padding: '1rem', borderRadius: '0.5rem' },
      },
    ],
  },
})
```

使用 shortcut：

```ts
// 用名稱參照
pika('flex-center')

// 與行內樣式結合
pika('flex-center', { gap: '1rem' })
```

## `__shortcut` 屬性 {#the-shortcut-property}

在樣式定義中，`__shortcut` 偽屬性會就地展開一個或多個 shortcut。當你想用單一個定義物件，把 shortcut 展開與覆寫混在一起時，這會很有用：

```ts
pika({
  __shortcut: 'btn',
  backgroundColor: 'navy',
})

// 多個 shortcut
pika({
  __shortcut: ['flex-center', 'btn'],
  gap: '1rem',
})
```

展開後的宣告會插入在定義自身屬性的前面，所以當兩者重疊時，你明確指定的屬性會勝出。定義上明確設定的 `__important` 旗標會傳遞到展開後的宣告（見 [Important](/zh-tw/customizations/important)）。

## 範例 {#examples}

<<< @/zh-tw/.examples/customizations/shortcuts.example.ts

## 下一步 {#next}

- [自動完成](/zh-tw/customizations/autocomplete)：自訂 IDE 自動完成。
- [選擇器](/zh-tw/customizations/selectors)：定義自訂選擇器對應。

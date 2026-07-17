---
title: 自動完成
description: 為 PikaCSS 的屬性與值自訂 IDE 的自動完成建議。
relatedPackages:
  - '@pikacss/core'
  - '@pikacss/unplugin-pikacss'
relatedSources:
  - packages/core/src/types/autocomplete.ts
  - packages/core/src/utils.ts
  - packages/integration/src/tsCodegen.ts
  - packages/unplugin/src/types.ts
category: customizations
order: 80
translation:
  sourceFile: docs/customizations/autocomplete.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: e4d2eab5700e07f8f670076c1264a5d77f769961
---

# 自動完成 {#autocomplete}

為 CSS 屬性與值自訂 IDE 的自動完成建議。

在支援 `tsCodegen` 的整合中，啟用該選項會產生一個給編輯器自動完成用的 TypeScript 宣告檔。在 unplugin 中，`tsCodegen` 預設會寫出 `pika.gen.ts`，設成字串會把宣告寫到自訂路徑，設成 `false` 則會完全停用 TypeScript codegen。下面的 `autocomplete` 引擎設定會用自訂的屬性值、額外的屬性，以及以模式為基礎的建議，來擴充那些產生出來的建議。

外掛也可以貢獻自動完成項目。自動完成設定會合併來自所有來源的貢獻。

## 設定 {#config}

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  autocomplete: {
    // 為 CSS 屬性建議值。鍵可以是 camelCase 或
    // hyphen-case，與你在樣式定義中撰寫它們的方式一致。
    cssProperties: {
      'display': ['flex', 'grid', 'block', 'inline-block', 'none'],
      'position': ['relative', 'absolute', 'fixed', 'sticky'],
      'font-weight': ['400', '500', '600', '700'],
    },

    // 註冊額外的非 CSS 屬性（通常由外掛透過
    // `transformStyleDefinitions` 使用，而不是輸出成 CSS）
    extraProperties: ['__variant'],

    // 把額外的屬性對應到 TypeScript 型別字串。這些值會
    // 原封不動地當成型別輸出到產生出來的 `pika.gen.ts` 中，
    // 所以它們必須是有效的 TypeScript 型別運算式。
    // （核心就是用這種方式註冊 `__layer`、`__shortcut` 與 `__important`。）
    properties: {
      __variant: ['\'primary\' | \'secondary\''],
    },

    // 註冊來自外掛、類似 CSS 的額外屬性
    extraCssProperties: ['--brand'],

    // 註冊額外的選擇器與 shortcut 建議
    selectors: ['@dark', '@light', '@sm', '@md', '@lg'],
    shortcuts: ['flex-center', 'btn'],
  },
})
```

::: warning `properties` 不是用來做 CSS 值建議的
`properties` 裡的項目會以原始 TypeScript 型別的形式寫進 `pika.gen.ts`（例如核心外掛註冊了 `__important: 'boolean'`）。如果把像 `'flex'` 這樣的 CSS 值字串放在那裡，會在產生出來的檔案中產生無效的型別參考。CSS 值建議請改用 `cssProperties`，它的項目會以字串常值型別的形式輸出。
:::

## 自動完成是建議，不是驗證 {#autocomplete-is-suggestions-not-validation}

PikaCSS 的輸入型別刻意設計得很開放：屬性的鍵與值都用 `string & {}` 放寬了，所以像 `colr: 'red'` 這樣的錯字在型別檢查時仍然不會出錯。自動完成設定會縮小你的編輯器*建議*的範圍，但它不會拒絕未知的屬性或值。那些額外屬性的型別（`__shortcut`、`__important`，以及你透過 `properties` 加入的項目）來自產生出來的 `pika.gen.ts`，所以只有在 `tsCodegen` 啟用、而且產生出來的檔案屬於你的 TypeScript 專案時，它們才會生效。

## 範例 {#examples}

<<< @/zh-tw/.examples/customizations/autocomplete.example.ts

## 下一步 {#next}

- [引擎設定](/zh-tw/getting-started/engine-config)：完整的設定參考。
- [選擇器](/zh-tw/customizations/selectors)：自訂選擇器也會註冊自動完成項目。

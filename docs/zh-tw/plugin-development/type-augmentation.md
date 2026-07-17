---
title: 型別擴增
description: 透過模組擴增擴充 PikaCSS 的 TypeScript 介面。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/types/engine.ts
  - packages/core/src/types/shared.ts
  - packages/core/src/types/autocomplete.ts
  - packages/core/src/types/public.ts
category: plugin-development
order: 30
translation:
  sourceFile: docs/plugin-development/type-augmentation.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: d5748d79fa4eb2f8412e6987ab44fb978d252fb4
---

# 型別擴增 {#type-augmentation}

擴充 PikaCSS 的 TypeScript 介面，讓你外掛的設定選項享有完整的型別檢查與自動完成。

## EngineConfig {#engineconfig}

擴增 `EngineConfig` 介面，以加入外掛專屬的設定欄位：

```ts
declare module '@pikacss/core' {
  interface EngineConfig {
    /** 我的外掛設定 */
    myPlugin?: {
      enabled?: boolean
      theme?: 'light' | 'dark'
    }
  }
}
```

擴增之後，使用者在設定引擎時就能取得自動完成：

```ts
defineEngineConfig({
  plugins: [myPlugin()],
  myPlugin: {
    enabled: true, // ✅ 自動完成正常運作
    theme: 'dark', // ✅ 有經過型別檢查
  },
})
```

本頁沿用了 [建立外掛](/zh-tw/plugin-development/create-a-plugin) 中使用的同一個 `myPlugin()` 工廠名稱，好讓擴增用的鍵與使用者的設定在各份外掛開發指南之間保持一致。

## Engine {#engine}

擴增 `Engine` 介面，為引擎實例加入方法或屬性：

```ts
declare module '@pikacss/core' {
  interface Engine {
    /** 由我的外掛加入的自訂方法 */
    getTheme: () => string
  }
}
```

接著在你的 `configureEngine` hook 中：

```ts
defineEnginePlugin({
  name: 'my-plugin',
  configureEngine: (engine) => {
    engine.getTheme = () => 'dark'
  },
})
```

## PikaAugment {#pikaaugment}

`PikaAugment` 介面（在 `packages/core/src/types/shared.ts` 中宣告為空）是 PikaCSS 型別層級的擴充樞紐。核心型別會從它解析出五個成員（`Autocomplete`、`Selector`、`Properties`、`StyleDefinition` 與 `StyleItem`，見 `packages/core/src/types/resolved.ts`），並在某個成員不存在時改用內部的預設值。

有兩種方式可以為它提供資料，請依你的使用者是否會執行建置整合來選擇。

### 使用 codegen（官方外掛的做法） {#with-codegen-how-official-plugins-do-it}

沒有任何官方外掛會手寫 `PikaAugment` 擴增。取而代之的是，外掛會在**執行階段**貢獻自動完成資料，再由整合的 `tsCodegen` 把 `PikaAugment` 擴增寫進產生的 `pika.gen.ts`（見 `packages/integration/src/tsCodegen.ts`）。你的外掛透過引擎註冊的一切，都會自動出現在使用者的 IDE 中：

```ts
defineEnginePlugin({
  name: 'my-plugin',
  configureEngine: (engine) => {
    engine.appendAutocomplete({
      // 常值建議：會產生為字串常值型別
      selectors: '@my-selector',
      shortcuts: 'my-shortcut',
      // 模式建議：未經處理的 TypeScript 型別原始碼，會照原樣輸出
      // （template literal 型別在這裡很好用）
      patterns: {
        shortcuts: '`my-shortcut-${string}`',
      },
    })
  },
})
```

規則層級的 `autocomplete` 選項也會匯集到同一個資料池：`engine.selectors.add`、`engine.shortcuts.add`，以及對應的設定 `definitions`，都能在動態（RegExp）規則之外一併接受自動完成項目；`@pikacss/plugin-icons` 用的正是這套流程：`appendAutocomplete` 搭配 shortcut 模式，再加上一條動態的 shortcut 規則。

### 不使用 codegen（手動擴增） {#without-codegen-manual-augmentation}

如果你的外掛針對的是只使用引擎、不會產生 `pika.gen.ts` 的情境（`tsCodegen: false`，或直接使用 `createEngine()`），可以手動擴增 `PikaAugment.Autocomplete`：

```ts
import type { DefineAutocomplete } from '@pikacss/core'

declare module '@pikacss/core' {
  interface PikaAugment {
    Autocomplete: DefineAutocomplete<{
      Selector: '@my-selector'
      Shortcut: 'my-shortcut'
      Layer: never
      PropertyValue: never
      CSSPropertyValue: never
    }>
  }
}
```

::: warning 與產生的檔案衝突
產生的 `pika.gen.ts` 會在 `PikaAugment` 上宣告同一個 `Autocomplete` 成員。TypeScript 要求名稱相同的合併介面成員必須具有完全相同的型別，因此手寫的 `Autocomplete` 擴增與啟用的 `tsCodegen` 會發生衝突。手動擴增只該用於沒有 codegen 的情境；若有搭配整合，請改用上面的執行階段流程。
:::

其餘的成員（`Selector`、`Properties`、`StyleDefinition`、`StyleItem`）也能用同樣的方式擴增，以擴大或替換 `pika()` 接受的結構。它們通常由產生的檔案提供；只在沒有 codegen 的情境中才手動覆寫它們，並同樣要留意上述的衝突問題。

## 下一步 {#next}

- [Define 輔助函式](/zh-tw/plugin-development/define-helpers)：`defineEngineConfig` 與 `defineEnginePlugin`。
- [建立外掛](/zh-tw/plugin-development/create-a-plugin)：外掛結構與 defineEnginePlugin 輔助函式。
- [可用的 Hook](/zh-tw/plugin-development/available-hooks)：所有你可以實作的生命週期 hook。

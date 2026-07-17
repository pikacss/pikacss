---
title: 變數
description: 在 PikaCSS 引擎設定中定義 CSS 自訂屬性（變數）。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/index.ts
  - packages/core/src/plugins/variables.ts
category: customizations
order: 40
translation:
  sourceFile: docs/customizations/variables.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: 8085403b12ce3f662cec18ecd21e5f21824b2173
---

# 變數 {#variables}

定義以 preflight 樣式形式注入的 CSS 自訂屬性。

CSS 自訂屬性（變數）讓你能在各個樣式之間套用主題與重複使用動態值。PikaCSS 預設會把變數註冊成 `:root` 底下的 preflight CSS。只有真正被參照到的變數才會出現在輸出中，詳見 [剔除未使用的變數](#unused-variables-are-pruned)。

把變數註冊在 `variables.definitions` 底下。純值預設會為所有 CSS 屬性產生 `var(--token)` 建議。當你想縮小自動完成的目標、停用值的建議，或選擇不剔除時，請使用物件形式。

## 設定 {#config}

```ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': '#3b82f6',
      '--color-secondary': '#64748b',
      '--spacing-sm': '0.5rem',
      '--spacing-md': '1rem',
      '--spacing-lg': '2rem',
      '--shadow-elevated': '0 12px 40px rgb(0 0 0 / 0.12)',
    },
  },
})
```

當你需要手動控制自動完成時，請使用物件形式：

```ts
defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': {
        value: '#3b82f6',
        autocomplete: { asValueOf: ['color', 'backgroundColor'] },
      },
      '--shadow-elevated': {
        value: '0 12px 40px rgb(0 0 0 / 0.12)',
        autocomplete: { asValueOf: '-' },
      },
    },
  },
})
```

變數可以限定在特定的選擇器範圍內：

```ts
defineEngineConfig({
  variables: {
    definitions: {
      ':root': {
        '--color-bg': '#ffffff',
        '--color-text': '#000000',
      },
      '.dark': {
        '--color-bg': '#1a1a1a',
        '--color-text': '#ffffff',
      },
    },
  },
})
```

在你的樣式定義中使用變數：

```ts
pika({
  color: 'var(--color-primary)',
  padding: 'var(--spacing-md)',
})
```

## 剔除未使用的變數 {#unused-variables-are-pruned}

預設情況下，一個已定義的變數只有在被某個原子樣式或其他 preflight 透過 `var(...)` 參照時才會輸出（參照會以遞移方式展開，因此已使用的變數會連帶保留其值所依賴的變數）。這讓輸出維持精簡，但也代表只被*外部* CSS（PikaCSS 輸出以外的樣式表）使用的變數會被悄悄捨棄。

若要把這類變數保留在輸出中：

```ts
defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': '#3b82f6',
      // 針對個別變數選擇不剔除
      '--external-theme': {
        value: '#64748b',
        pruneUnused: false,
      },
    },

    // 或列出必須一律輸出的名稱
    safeList: ['--color-primary'],

    // 或停用所有變數的剔除（預設：true）
    pruneUnused: false,
  },
})
```

- `pruneUnused`（設定層級）會為所有變數設定預設策略。預設：`true`。
- `pruneUnused`（個別變數，物件形式）會針對該變數覆寫設定層級的預設值。
- `safeList` 會列出無論是否使用都一律輸出的變數名稱。

## 範例 {#examples}

<<< @/zh-tw/.examples/customizations/variables.example.ts

## 下一步 {#next}

- [Keyframes](/zh-tw/customizations/keyframes)：定義 CSS 動畫。
- [選擇器](/zh-tw/customizations/selectors)：建立自訂的選擇器對應。

# Variables

`core:variables` 插件管理 CSS 自訂屬性（變數）。它負責處理作為前置樣式 CSS 的宣告輸出、用於主題設定的巢狀選擇器、自動補齊整合，以及未使用變數的清除。

## 運作原理

1. 變數定義在 `rawConfigConfigured` 期間從 `config.variables.variables` 收集。
2. 在 `configureEngine` 期間，每個變數會被解析並註冊：
   - 新增自動補齊條目（例如，將 `var(--name)` 作為值建議）。
   - 具有值的變數儲存於 `engine.variables.store`。
3. 前置樣式函式掃描所有原子化樣式中的 `var(--name)` 模式，以確定哪些變數實際被使用。
4. 只有已使用的變數（加上安全清單中的）才會輸出至 CSS。

## 設定

<<< @/.examples/guide/built-ins/variables-config-interface.ts

### `VariablesDefinition`

一個遞迴物件，其中：
- 以 `--` 開頭的鍵定義 CSS 變數。
- 其他鍵被視為用於限定範圍的 CSS 選擇器。
- 值可以是簡單的 CSS 值，或用於精細控制的 `VariableObject`。

### `VariableObject`

<<< @/.examples/guide/built-ins/variables-object-interface.ts

若以原始碼層級的精準型別來看，`VariableObject.value` 的型別是 `ResolvedCSSProperties[`--${string}`]`。上方範例為了可讀性做了簡化，但實際型別仍會與引擎解析後的 CSS 自訂屬性值模型保持一致。

同樣地，`autocomplete.asValueOf` 可接受單一 CSS 屬性名稱、屬性名稱陣列、萬用字元 `'*'`，或用 `'-'` 完全停用該變數的 CSS 值自動補齊。

`autocomplete.asProperty` 則控制是否要在自動補齊中，將變數名稱顯示為額外的 CSS 屬性建議。若某個變數只應該作為值被建議，可將它設為 `false`。

## 基本用法

在你的 `pika.config.ts` 中定義變數。頂層變數預設放置於 `:root` 下：

<<< @/.examples/guide/variables-config.ts

在你的樣式中使用變數：

<<< @/.examples/guide/variables-usage.ts

產生的 CSS 輸出（前置樣式 + 原子化樣式）：

<<< @/.examples/guide/variables-output.css

## 物件形式的變數

使用物件值對自動補齊和清除進行精細控制：

<<< @/.examples/guide/variables-object-form.ts

::: tip Null 值變數
`value: null` 的變數提供自動補齊建議，但不輸出任何 CSS 宣告。這對於由外部定義的變數（例如第三方樣式表）非常有用。
:::

## 未使用變數清除

預設情況下，`pruneUnused` 為 `true`。當以下**任一**條件成立時，變數會保留在 CSS 輸出中：

- 在原子化樣式值中透過 `var(--name)` 被參照
- 出現在 `safeList` 陣列中
- 其每個變數的 `pruneUnused` 明確設定為 `false`

`safeList` 中的每個項目都必須是包含 `--` 前綴的 CSS 自訂屬性名稱，例如 `--color-primary`。

在原始碼中，`safeList` 的型別是 ``(`--${string}` & {})[]``，用來保留字面值推斷，避免自訂屬性名稱被 TypeScript 拓寬成一般 `string`。

::: tip 傳遞性依賴追蹤
PikaCSS 會傳遞性地追蹤變數依賴。若你的樣式參照了 `--color-primary`，而 `--color-primary` 的值參照了 `--color-base`，`--color-base` 又參照了 `--color-raw`，則三個變數都會自動保留在 CSS 輸出中——即使只有 `--color-primary` 直接出現在你的樣式中。
:::

## 透過 Engine API 動態新增變數

插件可以在執行階段以程式方式新增變數：

<<< @/.examples/guide/built-ins/variables-engine-api.ts

`engine.variables.store` 是一個 `Map<string, ResolvedVariable[]>`，保存所有已註冊的變數，以變數名稱為鍵。

## 行為摘要

| 面向 | 說明 |
| --- | --- |
| 插件名稱 | `core:variables` |
| 預設選擇器 | `:root`（用於頂層變數） |
| `pruneUnused` 預設值 | `true` |
| `autocomplete.asValueOf` 預設值 | `['*']` |
| `autocomplete.asProperty` 預設值 | `true` — 將變數名稱作為額外的 CSS 屬性建議顯示 |
| Null 值變數 | 僅供自動補齊使用，不輸出至 CSS |
| 偵測方式 | 掃描原子化樣式值中的 `var(--name)` 模式（傳遞性）|

## `defineVariables()` 輔助函式

使用 `defineVariables()` 可獲得具備完整 TypeScript 自動補齊的型別安全變數定義。這是從 `@pikacss/core` 匯出的恆等函式，特別適合將變數抽取至獨立檔案以便跨設定檔重複使用：

<<< @/.examples/guide/built-ins/variables-define-helper.ts

## 原始碼參考

- `packages/core/src/internal/plugins/variables.ts`

## 下一步

- 繼續閱讀 [Keyframes](/zh-TW/guide/built-ins/keyframes)
- 回到 [內建插件](/zh-TW/guide/built-in-plugins)
- 了解 [插件系統概覽](/zh-TW/plugin-system/overview)

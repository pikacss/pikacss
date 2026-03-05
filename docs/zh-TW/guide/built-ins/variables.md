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

```ts
interface VariablesConfig {
  /** Variable definitions — a single object or an array of objects. */
  variables: VariablesDefinition | VariablesDefinition[]
  /** Whether to prune unused variables from CSS output. @default true */
  pruneUnused?: boolean
  /** Variables that are always included regardless of usage. @default [] */
  safeList?: `--${string}`[]
}
```

### `VariablesDefinition`

一個遞迴物件，其中：
- 以 `--` 開頭的鍵定義 CSS 變數。
- 其他鍵被視為用於限定範圍的 CSS 選擇器。
- 值可以是簡單的 CSS 值，或用於精細控制的 `VariableObject`。

### `VariableObject`

```ts
interface VariableObject {
  value?: string | number | null
  autocomplete?: {
    /** Which CSS properties suggest var(--name). @default ['*'] */
    asValueOf?: string | string[]
    /** Register --name as a CSS property in autocomplete. @default true */
    asProperty?: boolean
  }
  /** Override pruning for this specific variable. */
  pruneUnused?: boolean
}
```

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

::: tip 傳遞性依賴追蹤
PikaCSS 會傳遞性地追蹤變數依賴。若你的樣式參照了 `--color-primary`，而 `--color-primary` 的值參照了 `--color-base`，`--color-base` 又參照了 `--color-raw`，則三個變數都會自動保留在 CSS 輸出中——即使只有 `--color-primary` 直接出現在你的樣式中。
:::

## 透過 Engine API 動態新增變數

插件可以在執行階段以程式方式新增變數：

```ts
engine.variables.add({
  '--dynamic-color': '#ff007f',
})
```

`engine.variables.store` 是一個 `Map<string, ResolvedVariable[]>`，保存所有已註冊的變數，以變數名稱為鍵。

## 行為摘要

| 面向 | 說明 |
| --- | --- |
| 插件名稱 | `core:variables` |
| 預設選擇器 | `:root`（用於頂層變數） |
| `pruneUnused` 預設值 | `true` |
| `autocomplete.asValueOf` 預設值 | `['*']` |
| `autocomplete.asProperty` 預設值 | `true` |
| Null 值變數 | 僅供自動補齊使用，不輸出至 CSS |
| 偵測方式 | 掃描原子化樣式值中的 `var(--name)` 模式（傳遞性）|

## `defineVariables()` 輔助函式

使用 `defineVariables()` 可獲得具備完整 TypeScript 自動補齊的型別安全變數定義。這是從 `@pikacss/core` 匯出的恆等函式，特別適合將變數抽取至獨立檔案以便跨設定檔重複使用：

<<< @/.examples/guide/built-ins/variables-define-helper.ts

## 原始碼參考

- `packages/core/src/internal/plugins/variables.ts`

## 下一步

- 繼續閱讀 [Keyframes](/zh-TW/guide/built-ins/keyframes)

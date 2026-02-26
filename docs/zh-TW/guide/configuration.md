# 設定

PikaCSS 透過兩個層次進行設定：

1. **Engine Config** — 控制 CSS 引擎（前綴、選擇器、變數、關鍵影格等）
2. **Build Plugin Options** — 控制建置整合（檔案掃描、程式碼產生、轉換格式）

## 設定檔

PikaCSS 會自動偵測符合以下模式的設定檔：

```text
**/pika.config.{js,ts,mjs,mts}
**/pikacss.config.{js,ts,mjs,mts}
```

使用 `defineEngineConfig()` 包裝你的設定，以獲得型別安全的 IntelliSense。這是從 `@pikacss/core` 匯出的恆等函式：

<<< @/.examples/guide/config-basic.ts

## Engine Config

### `plugins`

- **型別：** `EnginePlugin[]`
- **預設值：** `[]`

註冊插件以擴展 PikaCSS 的功能。核心內建插件（`important`、`variables`、`keyframes`、`selectors`、`shortcuts`）始終會自動載入——你只需在此新增外部插件。

<<< @/.examples/guide/config-plugins.ts

### `prefix`

- **型別：** `string`
- **預設值：** `''`

附加在每個產生的原子化樣式 ID 前面的前綴。適合用來避免與其他 CSS 框架的命名衝突。

<<< @/.examples/guide/config-prefix.ts

### `defaultSelector`

- **型別：** `string`
- **預設值：** `'.%'`

用於產生原子化樣式的選擇器範本。`%` 字元是佔位符（`ATOMIC_STYLE_ID_PLACEHOLDER`），在渲染時會被實際的原子化樣式 ID 取代。

<<< @/.examples/guide/config-default-selector.ts

### `preflights`

- **型別：** `Preflight[]`
- **預設值：** `[]`

在原子化樣式之前注入的全域 CSS。每個項目可以是：

1. **CSS 字串** — 直接注入
2. **前置樣式定義物件** — CSS-in-JS 物件（如 `{ ':root': { fontSize: '16px' } }`）
3. **函式** `(engine, isFormatted) => string | PreflightDefinition` — 使用引擎實例動態產生 CSS
4. **`WithLayer` 包裝器** `{ layer, preflight }` — 將以上任意形式指派至特定的 CSS `@layer`

<<< @/.examples/guide/config-preflights.ts

若要將前置樣式指派至特定的 CSS `@layer`，請使用 `WithLayer` 包裝器：

<<< @/.examples/guide/config-preflights-with-layer.ts

### `layers`

- **型別：** `Record<string, number>`
- **預設值：** `{ preflights: 1, utilities: 10 }`

設定 CSS `@layer` 的順序。鍵為層名稱，值為順序數字——數字越小越先渲染。自訂項目會與預設值合併，未指定的層保留其預設順序。

::: tip
從 `@pikacss/core` 匯出的 `sortLayerNames` 會回傳依順序值排列的層名稱陣列——適用於除錯或插件開發。
:::

<<< @/.examples/guide/config-layers.ts

### `defaultPreflightsLayer`

- **型別：** `string`
- **預設值：** `'preflights'`

未明確指定 `layer` 屬性的前置樣式（preflights）所放入的 CSS `@layer`。

### `defaultUtilitiesLayer`

- **型別：** `string`
- **預設值：** `'utilities'`

原子化工具樣式預設放入的 CSS `@layer`。

## Core Plugin 設定

這些欄位是透過 [模組擴增](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) 由 PikaCSS 核心插件新增至 `EngineConfig` 的。它們始終可用，因為核心插件會在 `createEngine()` 中自動載入。

### `important`

- **型別：** `{ default?: boolean }`
- **預設值：** `{ default: false }`

控制是否在所有產生的 CSS 宣告後附加 `!important`。個別樣式可透過 `__important` 屬性進行覆寫。

<<< @/.examples/guide/config-important.ts

### `variables`

- **型別：** `{ variables: Arrayable<VariablesDefinition>, pruneUnused?: boolean, safeList?: string[] }`
- **預設值：** `undefined`

定義 CSS 自訂屬性（變數），支援作用域選擇器、自動補齊設定及未使用項目清除。

| 子選項 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `variables` | `Arrayable<VariablesDefinition>` | （必填） | 變數定義。可為單一物件或物件陣列（依序合併）。 |
| `pruneUnused` | `boolean` | `true` | 從最終 CSS 中移除未使用的變數。 |
| `safeList` | `string[]` | `[]` | 無論是否使用都始終包含的變數。 |

每個變數的值可以是：
- **字串／數字** — CSS 值（預設渲染於 `:root` 下）
- **`null`** — 僅供自動補齊使用，不產生 CSS 輸出
- **`VariableObject`** — 對值、自動補齊行為及清除進行精細控制

<<< @/.examples/guide/config-variables.ts

你也可以傳入一個變數定義陣列，依序合併：

<<< @/.examples/guide/config-variables-array.ts

### `keyframes`

- **型別：** `{ keyframes: Keyframes[], pruneUnused?: boolean }`
- **預設值：** `undefined`

定義 CSS `@keyframes` 動畫，包含影格定義與自動補齊建議。

| 子選項 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `keyframes` | `Keyframes[]` | （必填） | 關鍵影格定義。 |
| `pruneUnused` | `boolean` | `true` | 從最終 CSS 中移除未使用的關鍵影格。 |

每個關鍵影格可定義為：
- **字串** — 僅動畫名稱（供自動補齊使用，不產生影格）
- **元組** `[name, frames?, autocomplete?, pruneUnused?]`
- **物件** `{ name, frames?, autocomplete?, pruneUnused? }`

<<< @/.examples/guide/config-keyframes.ts

### `selectors`

- **型別：** `{ selectors: Selector[] }`
- **預設值：** `undefined`

定義可在樣式定義中作為鍵使用的自訂選擇器。替換值中的 `$` 代表目前元素的選擇器。

| 選擇器形式 | 說明 |
|---|---|
| `string` | 僅供自動補齊使用 |
| `[name, replacement]` | 靜態對應 |
| `[pattern, handler, autocomplete?]` | 動態（基於正規表示式）對應 |
| `{ selector, value }` | 物件形式（靜態） |
| `{ selector, value, autocomplete? }` | 物件形式（動態） |

<<< @/.examples/guide/config-selectors.ts

### `shortcuts`

- **型別：** `{ shortcuts: Shortcut[] }`
- **預設值：** `undefined`

定義可重複使用的樣式捷徑——樣式屬性或其他捷徑的具名組合。

| 捷徑形式 | 說明 |
|---|---|
| `string` | 僅供自動補齊使用 |
| `[name, styleDefinition]` | 靜態對應 |
| `[pattern, handler, autocomplete?]` | 動態（基於正規表示式）對應 |
| `{ shortcut, value }` | 物件形式（靜態） |
| `{ shortcut, value, autocomplete? }` | 物件形式（動態） |

<<< @/.examples/guide/config-shortcuts.ts

## Build Plugin Options（`PluginOptions`）

這些選項傳遞給建置插件（例如在你的 Vite／Webpack／Rollup 設定中的 `pikacss()`）。它們控制 PikaCSS 如何與你的建置工具整合。

| 選項 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `scan` | `{ include?, exclude? }` | 見下方 | 掃描 `pika()` 呼叫的檔案模式 |
| `config` | `EngineConfig \| string` | `undefined` | 行內引擎設定或設定檔路徑 |
| `autoCreateConfig` | `boolean` | `true` | 若無設定檔則自動建立 |
| `fnName` | `string` | `'pika'` | 在原始碼中偵測的函式名稱 |
| `transformedFormat` | `'string' \| 'array' \| 'inline'` | `'string'` | 產生的 class 名稱輸出格式 |
| `tsCodegen` | `boolean \| string` | `true` | TypeScript 程式碼產生檔路徑（`true` = `'pika.gen.ts'`，`false` = 停用） |
| `cssCodegen` | `true \| string` | `true` | CSS 程式碼產生檔路徑（`true` = `'pika.gen.css'`） |

### `scan`

預設值：
- `include`：`['**/*.{js,ts,jsx,tsx,vue}']`
- `exclude`：`['node_modules/**', 'dist/**']`

### `transformedFormat`

控制 `pika()` 呼叫在建置時期的轉換方式：

- **`'string'`** — `"a b c"`（以空格分隔的字串）
- **`'array'`** — `['a', 'b', 'c']`（class 名稱陣列）
- **`'inline'`** — 行內樣式物件格式

<<< @/.examples/guide/config-plugin-options.ts

## 完整範例

使用所有可用選項的完整設定檔：

<<< @/.examples/guide/config-full-example.ts

## Next

- 繼續閱讀 [內建插件](/zh-TW/guide/built-in-plugins)

# 設定

PikaCSS 透過兩個層次進行設定：

1. **Engine Config** — 控制 CSS 引擎（前綴、選擇器、變數、關鍵影格等）
2. **Build Plugin Options** — 控制建置整合（檔案掃描、程式碼產生、轉換格式）

## 設定檔

PikaCSS 會從整合的工作目錄自動偵測符合 `{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}` 的設定檔，通常這就是你的專案根目錄。

使用 `defineEngineConfig()` 包裝你的設定，以獲得型別安全的 IntelliSense。此函式從 `@pikacss/core` 匯出，並以 `const T` 回傳，保留設定的精確字面值型別，以便進行準確的型別檢查：

<<< @/.examples/guide/config-basic.ts

::: tip 所有 `define*` 輔助函式的 Const 型別推斷
所有輔助函式 — `defineEngineConfig`、`defineStyleDefinition`、`definePreflight`、`defineKeyframes`、`defineSelector`、`defineShortcut` 以及 `defineVariables` — 均以 `<const T>` 定義型別。它們會回傳輸入的精確字面值型別，讓你的設定與樣式定義都能獲得精準的型別推斷。
:::

## Engine Config

### `plugins`

- **型別：** `EnginePlugin[]`
- **預設值：** `[]`

註冊插件以擴展 PikaCSS 的功能。核心內建插件（`important`、`variables`、`keyframes`、`selectors`、`shortcuts`）始終會自動載入——你只需在此新增外部插件。

<<< @/.examples/guide/config-plugins.ts

### `prefix`

- **型別：** `string`
- **預設值：** `''`

附加在每個產生的原子化樣式 ID 前面的前綴。適合用來避免與其他 CSS 工具鏈或既有 class 命名空間發生命名衝突。

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
3. **函式** `(engine, isFormatted) => string | PreflightDefinition | Promise<string | PreflightDefinition>` — 使用引擎實例動態產生 CSS，亦支援非同步流程
4. **`WithLayer` 包裝器** `{ layer, preflight }` — 將以上任意形式指派至特定的 CSS `@layer`
5. **`WithId` 包裝器** `{ id, preflight }` — 指派識別符，讓重複的前置樣式可被偵測並略過

<<< @/.examples/guide/config-preflights.ts

若要將前置樣式指派至特定的 CSS `@layer`，請使用 `WithLayer` 包裝器：

<<< @/.examples/guide/config-preflights-with-layer.ts

::: info 非同步前置樣式與 `isFormatted`
前置樣式函式可以是非同步並回傳 `Promise`。`isFormatted` 布林值表示目前輸出是否應保持可讀格式（`true`）或採用緊湊／壓縮格式（`false`），當你手動組合 CSS 字串時特別有用。
:::

::: tip `definePreflight()` 輔助函式
使用來自 `@pikacss/core` 的 `definePreflight()` 可獲得型別安全的前置樣式定義。這是恆等函式，會對引數層焧型別，便於抽取或跨設定檔共用前置樣式：

<<< @/.examples/guide/built-ins/preflights-define-helper.ts
:::

### `layers`

- **型別：** `Record<string, number>`
- **預設值：** `{ preflights: 1, utilities: 10 }`

設定 CSS `@layer` 的順序。鍵為層名稱，值為順序數字——數字越小越先渲染。自訂項目會與預設值合併，未指定的層保留其預設順序。

::: tip
從 `@pikacss/core` 匯出的 `sortLayerNames` 會回傳依順序值排列的層名稱陣列——適用於除錯或插件開發。
:::

<<< @/.examples/guide/config-layers.ts

### 樣式定義中的 `__layer`

`__layer` 是引擎內建的樣式層級能力。當你希望某個樣式定義所提取出的原子化規則被渲染到特定、已設定的 `@layer` 時，可在該樣式定義上加入它。

<<< @/.examples/guide/config-style-layer.ts

在引擎提取 CSS 宣告之前，`__layer` 會先被移除，接著產生出的原子化樣式會帶上對應的 layer 名稱。這表示相同的 CSS 宣告若出現在不同 layer 中，可能會產生不同的原子化 class ID。

它與 layer 設定的互動方式如下：

- `config.layers` 定義有順序的已知 layer 名稱清單。PikaCSS 會將你的項目合併到內建預設值 `{ preflights: 1, utilities: 10 }` 之上。
- `defaultUtilitiesLayer` 控制未指定 `__layer` 的原子化樣式會渲染到哪裡。預設為 `utilities`。
- `__layer` 只會影響目前這個樣式定義，不會全域改變 `defaultUtilitiesLayer`。
- 若 `__layer` 使用的名稱不存在於 `config.layers` 中，該樣式會回退為未分 layer 的輸出，而不會自動建立新的有序 layer。

若要改變未分 layer 的 utility 樣式預設輸出位置，請將 `defaultUtilitiesLayer` 設定為你已知 layer 名稱之一：

<<< @/.examples/guide/config-style-layer-defaults.ts

### `defaultPreflightsLayer`

- **型別：** `string`
- **預設值：** `'preflights'`

未明確指定 `layer` 屬性的前置樣式（preflights）所放入的 CSS `@layer`。

### `defaultUtilitiesLayer`

- **型別：** `string`
- **預設值：** `'utilities'`

未明確指定 `__layer` 的原子化工具樣式，預設會放入的 CSS `@layer`。

## Core Plugin 設定

這些欄位是透過 [模組擴增](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) 由 PikaCSS 核心插件新增至 `EngineConfig` 的。它們始終可用，因為核心插件會在 `createEngine()` 中自動載入。

### `important`

- **型別：** `{ default?: boolean }`
- **預設值：** `{ default: false }`

控制是否在所有產生的 CSS 宣告後附加 `!important`。個別樣式可透過 `__important` 屬性進行覆寫。

<<< @/.examples/guide/config-important.ts

### `variables`

- **型別：** ``{ variables: Arrayable<VariablesDefinition>, pruneUnused?: boolean, safeList?: (`--${string}` & {})[] }``
- **預設值：** `undefined`

定義 CSS 自訂屬性（變數），支援作用域選擇器、自動補齊設定及未使用項目清除。

| 子選項 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `variables` | `Arrayable<VariablesDefinition>` | （必填） | 變數定義。可為單一物件或物件陣列（依序合併）。 |
| `pruneUnused` | `boolean` | `true` | 從最終 CSS 中移除未使用的變數。 |
| `safeList` | `` (`--${string}` & {})[] `` | `[]` | 無論是否使用都始終包含的變數。每個項目都必須是包含 `--` 前綴的 CSS 自訂屬性名稱。 |

每個變數的值可以是：
- **字串／數字** — CSS 值（預設渲染於 `:root` 下）
- **`null`** — 僅供自動補齊使用，不產生 CSS 輸出
- **`VariableObject`** — 對值、自動補齊行為及清除進行精細控制

原始碼中的 `VariableObject.value` 型別是 `ResolvedCSSProperties[`--${string}`]`，因此變數值會與引擎解析後的 CSS 自訂屬性型別保持一致。

`VariablesDefinition` 也支援巢狀選擇器鍵（例如 `'[data-theme="dark"]'`），可將變數作用域設定在 `:root` 之外。使用 `safeList` 時，每個項目都必須是像 `--color-text` 這樣的 CSS 變數名稱。原始碼型別中的 `& {}` 交集是為了避免 TypeScript 將自訂屬性名稱拓寬成一般 `string`。

<<< @/.examples/guide/config-variables.ts

::: tip 遞移式變數追蹤
當 `pruneUnused` 為 `true` 時，PikaCSS 會使用廣度優先搜尋（BFS）遞移地展開 `var()` 參照。若變數 `A` 的值中參照了變數 `B`（例如 `--size-lg: calc(var(--size-base) * 4)`），而 `A` 被用於你的樣式中，則 `B` 會自動被保留 — 即使它並未直接出現在任何原子化樣式中。
:::

<<< @/.examples/guide/config-variables-transitive.ts

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

對於動態選擇器規則，`autocomplete` 可以是單一字串，也可以是字串陣列。

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

對於動態捷徑規則，`autocomplete` 可以是單一字串，也可以是字串陣列。

<<< @/.examples/guide/config-shortcuts.ts

## 型別輔助函式

`@pikacss/core` 匯出了一組恆等函式，用於層焧 TypeScript 型別並提供完整的自動補齊。每個函式對應一個特定的設定概念：

| 輔助函式 | 用途 |
|---|---|
| `defineEngineConfig()` | 型別安全的引擎設定物件 |
| `definePreflight()` | 型別安全的 `Preflight` 定義 |
| `defineStyleDefinition()` | 型別安全的樣式定義物件（傳入 `pika()`） |
| `defineSelector()` | 型別安全的 `Selector` 定義 |
| `defineShortcut()` | 型別安全的 `Shortcut` 定義 |
| `defineKeyframes()` | 型別安全的 `Keyframes` 定義 |
| `defineVariables()` | 型別安全的 `VariablesDefinition` 物件 |
| `defineEnginePlugin()` | 型別安全的引擎插件 |

所有輔助函式均從 `@pikacss/core` 匯出。`defineStyleDefinition()` 特別適合當你希望跨多個 `pika()` 呼叫重用同一個樣式定義物件時：

<<< @/.examples/guide/built-ins/style-definition-define-helper.ts

## Build Plugin Options（`PluginOptions`）

這些選項傳遞給建置插件（例如在你的 Vite／Webpack／Rollup 設定中的 `pikacss()`）。它們控制 PikaCSS 如何與你的建置工具整合。

| 選項 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `scan` | `{ include?, exclude? }` | 見下方 | 掃描 `pika()` 呼叫的檔案模式 |
| `config` | `EngineConfig \| string` | `undefined` | 行內引擎設定或設定檔路徑 |
| `autoCreateConfig` | `boolean` | `true` | 若無設定檔則自動建立 |
| `fnName` | `string` | `'pika'` | 在原始碼中偵測的函式名稱 |
| `transformedFormat` | `'string' \| 'array'` | `'string'` | 產生的 class 名稱輸出格式 |
| `tsCodegen` | `boolean \| string` | `true` | TypeScript 程式碼產生檔路徑（`true` = `'pika.gen.ts'`，`false` = 停用） |
| `cssCodegen` | `true \| string` | `true` | CSS 程式碼產生檔路徑（`true` = `'pika.gen.css'`；不支援 `false`） |

::: info `cssCodegen` 不能停用
和 `tsCodegen` 不同，`cssCodegen` 不接受 `false`。若你要使用預設路徑，請設為 `true`；若要改變輸出位置，請提供自訂字串路徑。
:::

### `scan`

預設值：
- `include`：`['**/*.{js,ts,jsx,tsx,vue}']`
- `exclude`：`['node_modules/**', 'dist/**']`

### `transformedFormat`

控制 `pika()` 呼叫在建置時期的轉換方式：

- **`'string'`** — `"a b c"`（以空格分隔的字串）
- **`'array'`** — `['a', 'b', 'c']`（class 名稱陣列）

<<< @/.examples/guide/config-plugin-options.ts

## 型別匯出

PikaCSS 從 `@pikacss/core` 匯出以下型別，供插件開發、型別標註及共用樣式定義使用。

### `PropertyValue<T>`

- **定義：** `T | [value: T, fallback: T[]] | null | undefined`

表示一個 CSS 屬性值。支援純值、回退值元組（渲染為 `property: primary, fallback`）或 `null`/`undefined`（用於省略該屬性）。此型別由 `Properties` 與所有 `StyleDefinitionMap` 項目在內部使用。

### `StyleDefinition` 與 `StyleDefinitionMap`

`StyleDefinition` 是以下兩種形式的聯集型別：

<<< @/.examples/guide/type-style-definition-union.ts

- **`Properties`** — 使用駝峰式或連字號格式鍵的 CSS 屬性-值對應。
- **`StyleDefinitionMap`** — 以選擇器為鍵的物件，用於巢狀樣式規則。鍵為選擇器字串（包括 `config.selectors` 中定義的自訂別名）；值為 `Properties`、巢狀的 `StyleDefinition` 或樣式項目陣列。

在 `pika()` 呼叫之外定義樣式時，請使用 `defineStyleDefinition()` 以獲得 const 保留的型別推斷：

<<< @/.examples/guide/type-style-definition-map.ts

## 完整範例

使用所有可用選項的完整設定檔：

<<< @/.examples/guide/config-full-example.ts

## 下一步

- 繼續閱讀 [內建插件](/zh-TW/guide/built-in-plugins)
- 回頭查看 [什麼是 PikaCSS？](/zh-TW/getting-started/what-is-pikacss)
- 延伸閱讀 [整合概覽](/zh-TW/integrations/overview)

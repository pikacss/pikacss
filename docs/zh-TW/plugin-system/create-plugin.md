# 建立插件

本指南帶你從零開始建立 PikaCSS 插件。插件可以擴充引擎，加入自訂變數、捷徑、選擇器、關鍵影格、前置樣式和自動補齊項目——全部具備完整的 TypeScript 型別安全。

## 最簡單的插件

插件是一個包含 `name` 和可選鉤子的純物件，使用 `defineEnginePlugin()` 包裝以確保型別安全：

<<< @/.examples/plugin-system/minimal-plugin.ts

慣例是匯出一個回傳插件物件的**工廠函式**。這讓使用者可以傳入選項：

<<< @/.examples/plugin-system/plugin-with-options.ts

## 插件結構

每個插件都有：

| 屬性 | 類型 | 必要 | 說明 |
|----------|------|----------|-------------|
| `name` | `string` | 是 | 插件的唯一識別符 |
| `order` | `'pre' \| 'post'` | 否 | 控制相對於其他插件的執行順序 |
| 鉤子函式 | — | 否 | 在各個生命週期階段呼叫的函式 |

### 執行順序

插件在鉤子執行前依 `order` 排序。執行順序為：`pre` → (預設) → `post`。

<<< @/.examples/plugin-system/plugin-order.ts

::: info 插件陣列不可變性
傳入引擎設定的插件陣列**不會被原地排序**。引擎在排序前會先建立副本，因此原始陣列永遠不會被修改。這意味著同一個插件陣列可以安全地在多個引擎實例中重複使用，不會產生意外的副作用。
:::

## 生命週期鉤子

在 `createEngine(config)` 期間，鉤子按以下順序觸發：

### 1. `configureRawConfig` (async)

在解析原始設定前修改它。回傳修改後的設定以傳遞給下一個插件。

<<< @/.examples/plugin-system/hook-configure-raw-config.ts

### 2. `rawConfigConfigured` (sync)

在所有 `configureRawConfig` 鉤子執行後呼叫。用於讀取最終確定的原始設定。回傳值會被忽略。

### 3. `configureResolvedConfig` (async)

在套用預設值和插件解析後，修改已解析的設定。

<<< @/.examples/plugin-system/hook-configure-resolved-config.ts

### 4. `configureEngine` (async)

最常用的鉤子。在引擎完全建構後呼叫。用於新增變數、捷徑、選擇器、關鍵影格、前置樣式和自動補齊項目。

<<< @/.examples/plugin-system/hook-configure-engine.ts

### Transform Hooks (runtime)

這些鉤子在執行期間樣式提取時呼叫：

<<< @/.examples/plugin-system/hook-transform.ts

### Notification Hooks (sync)

這些鉤子通知插件狀態變更——它們無法修改有效載荷：

<<< @/.examples/plugin-system/hook-notifications.ts

::: info 鉤子執行模型
- 鉤子會依排序順序逐插件執行。
- 若非同步鉤子回傳非 null 值，該值將取代下一個插件的有效載荷。
- 鉤子錯誤會被捕捉並記錄；執行將繼續至下一個插件。
:::

## 模組擴增

使用 TypeScript 模組擴增來新增自訂設定選項，為終端使用者提供型別安全。這是官方插件（icons、reset、typography）將其設定欄位新增至 `EngineConfig` 的方式。

<<< @/.examples/plugin-system/module-augmentation.ts

使用者在設定引擎時即可獲得完整的自動補齊：

<<< @/.examples/plugin-system/use-plugin-in-config.ts

## 新增前置樣式

前置樣式是在原子化樣式之前注入的全域 CSS 樣式。`engine.addPreflight()` 方法接受三種形式：

### 字串前置樣式

原始 CSS 字串直接注入：

<<< @/.examples/plugin-system/preflight-string.ts

### PreflightDefinition 物件

以選擇器為鍵、CSS 屬性為值的結構化物件：

<<< @/.examples/plugin-system/preflight-definition.ts

### PreflightFn 函式

接收引擎實例並回傳字串或 `PreflightDefinition` 的函式。適用於需要讀取引擎狀態的動態前置樣式：

<<< @/.examples/plugin-system/preflight-function.ts

### WithLayer 包裝器

使用 `WithLayer<T>`——`{ layer, preflight }`——將任何前置樣式指定到特定的 CSS `@layer`。型別參數 `T` 可以是 `string`、`PreflightDefinition` 或 `PreflightFn`。三種前置樣式變體均支援：

<<< @/.examples/plugin-system/preflight-with-layer.ts

::: tip 層級順序
層級渲染順序由 `EngineConfig` 中的 `layers` 設定決定。數值較小的層級會先渲染。命名層級中的前置樣式一律渲染在對應的 `@layer` 區塊內。
:::

### WithId 包裝器

使用 `WithId<T>`——`{ id, preflight }`——為任何前置樣式指定一個字串識別符。`id` 讓其他插件或引擎能夠識別並去重前置樣式：

<<< @/.examples/plugin-system/preflight-with-id.ts

::: tip 去重
指定 `id` 對於可能被初始化多次的插件、或多個插件註冊相同基礎樣式的情境特別有用。若已有相同 `id` 的前置樣式被註冊，引擎會略過後續相同 `id` 的前置樣式。
:::

## 自動補齊 API

插件可以透過新增自訂項目來豐富 TypeScript 自動補齊體驗。這些 API 可在 `configureEngine` 中的 `engine` 實例上使用：

<<< @/.examples/plugin-system/autocomplete-api.ts

| 方法 | 用途 |
|--------|---------|
| `appendAutocompleteSelectors(...selectors)` | 新增選擇器字串至自動補齊 |
| `appendAutocompleteStyleItemStrings(...strings)` | 新增樣式項目字串（捷徑名稱等） |
| `appendAutocompleteExtraProperties(...properties)` | 新增額外 TypeScript 屬性 |
| `appendAutocompleteExtraCssProperties(...properties)` | 新增額外 CSS 屬性（例如自訂 CSS 變數） |
| `appendAutocompletePropertyValues(property, ...tsTypes)` | 為屬性值新增 TypeScript 型別聯合 |
| `appendAutocompleteCssPropertyValues(property, ...values)` | 為 CSS 屬性新增具體 CSS 值 |

### 層名稱自動補齊

引入命名 CSS 層的插件可以擴增 `PikaAugment['Autocomplete']`，為那些層名稱提供 TypeScript 自動補齊。安裝該插件的使用者在指定 `WithLayer` 前置樣式的 `layer` 欄位時即可獲得建議：

<<< @/.examples/plugin-system/autocomplete-layer-augmentation.ts

::: info
`ResolvedLayerName`（從 `@pikacss/core` 匯出）在有設定擴增的情況下會解析為擴增的 `Layer` 聯合型別，否則會回退到 `UnionString`（`string & {}`）。
:::

## 內建引擎 API

在 `configureEngine` 中，引擎公開了來自內建核心插件的 API：

| API | 說明 |
|-----|-------------|
| `engine.variables.add(definition)` | 新增具有自動補齊支援的 CSS 變數 |
| `engine.shortcuts.add(...shortcuts)` | 新增靜態或動態捷徑 |
| `engine.selectors.add(...selectors)` | 新增靜態或動態選擇器對應 |
| `engine.keyframes.add(...keyframes)` | 新增 `@keyframes` 動畫 |
| `engine.addPreflight(preflight)` | 新增全域前置樣式 CSS（接受 string、`PreflightDefinition`、`PreflightFn`、`WithLayer<T>` 或 `WithId<T>`）|
| `engine.config` | 存取已解析的引擎設定 |
| `engine.store.atomicStyleIds` | 內容雜湊 → 原子化樣式 ID 的對應表 |
| `engine.store.atomicStyles` | ID → `AtomicStyle` 物件的對應表 |

## 真實範例

### Reset 插件（簡化版）

基於 `@pikacss/plugin-reset`——使用 `order: 'pre'`、`configureRawConfig`、模組擴增和 `engine.addPreflight()`：

<<< @/.examples/plugin-system/real-world-reset.ts

### Typography 插件（簡化版）

基於 `@pikacss/plugin-typography`——使用變數、捷徑和模組擴增：

<<< @/.examples/plugin-system/real-world-typography.ts

## 腳手架插件套件

Monorepo 包含一個互動式腳手架腳本：

<<< @/.examples/plugin-system/scaffold-command.sh{bash}

腳手架會產生：

- `packages/plugin-<name>/` 資料夾
- 包含 `defineEnginePlugin` 樣板的 `src/index.ts`
- 以 `@pikacss/core` 為同級相依的 `package.json`
- TypeScript 和 Vitest 設定檔
- 基本測試檔案

產生的工廠函式遵循 `create<PascalName>Plugin(options)` 的模式，插件 `name` 設定為 slug。

## 發布慣例

| 類型 | 套件名稱模式 |
|------|---------------------|
| 官方 | `@pikacss/plugin-xxx` |
| 社群 | `pikacss-plugin-xxx` |

- 匯出回傳 `EnginePlugin` 的工廠函式
- 使用模組擴增來擴充設定型別
- 在 `package.json` 的 `keywords` 中加入 `pikacss` 和 `pikacss-plugin`

## 下一步

- [Icons 插件](/zh-TW/plugins/icons)
- [Reset 插件](/zh-TW/plugins/reset)
- [Typography 插件](/zh-TW/plugins/typography)

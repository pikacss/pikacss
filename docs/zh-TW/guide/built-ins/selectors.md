# Selectors

`core:selectors` 插件在渲染前解析選擇器別名。它支援靜態對應和基於 RegExp 的動態模式，並具備遞迴解析功能。

## 運作原理

1. 選擇器定義在 `rawConfigConfigured` 期間從 `config.selectors.selectors` 收集。
2. 在 `configureEngine` 期間，每個定義會被解析並註冊：
   - 靜態規則儲存供精確比對查找。
   - 動態規則儲存供基於 RegExp 的比對。
   - 為已知選擇器新增自動補齊條目。
3. 在 `transformSelectors` 期間，每個選擇器字串透過 `SelectorResolver` 遞迴解析。
4. 若選擇器不符合任何規則，則原始字串保持不變並回傳。
5. 動態解析結果會透過 `onResolved` 自動回饋至自動補齊。

## 設定

<<< @/.examples/guide/built-ins/selectors-config-interface.ts

## 選擇器定義格式

有四種定義選擇器的方式。

### 字串形式

純字串僅作為自動補齊建議登錄——不會建立解析規則。

<<< @/.examples/guide/built-ins/selectors-string-form.ts

### 元組形式——靜態

雙元素元組將選擇器名稱對應至一個或多個替換字串。使用 `$` 作為元素預設選擇器的佔位符（見下方的 [`$` 佔位符](#the-placeholder)）。

<<< @/.examples/guide/built-ins/selectors-tuple-static-type.ts

<<< @/.examples/guide/built-ins/selectors-tuple-static.ts

### 元組形式——動態

具有 `RegExp` 模式和解析函式的元組。函式接收 `RegExpMatchArray` 並回傳一個或多個替換字串。可選的第三個元素提供自動補齊提示，且可以是單一字串或陣列。

<<< @/.examples/guide/built-ins/selectors-tuple-dynamic-type.ts

<<< @/.examples/guide/built-ins/selectors-tuple-dynamic.ts

### 物件形式

等同於元組形式，但使用具名屬性。支援靜態和動態兩種變體：

<<< @/.examples/guide/built-ins/selectors-object-form.ts

## 完整範例

<<< @/.examples/guide/built-ins/selectors-config.ts

## 與 `pika()` 搭配使用

在樣式定義中使用選擇器名稱作為鍵。任何不是 CSS 屬性的鍵都會被視為選擇器：

<<< @/.examples/guide/built-ins/selectors-usage.ts

產生的 CSS 輸出：

<<< @/.examples/guide/built-ins/selectors-output.css

## `$` 佔位符 {#the-placeholder}

在選擇器值中，`$` 會被替換為元素的**預設選擇器**（預設為 `.%`，其中 `%` 是原子化樣式 ID 佔位符）。這使得偽類、祖先選擇器等得以實現。

<<< @/.examples/guide/built-ins/selectors-placeholder-pseudo.ts

### 佔位符行為摘要

| 定義 | `$` → defaultSelector | 最終 CSS |
| --- | --- | --- |
| `['hover', '$:hover']` | `.%:hover` | `.a:hover { ... }` |
| `['before', '$::before']` | `.%::before` | `.a::before { ... }` |
| `['dark', '[data-theme="dark"] $']` | `[data-theme="dark"] .%` | `[data-theme="dark"] .a { ... }` |
| `['md', '@media (min-width: 768px)']` | _（無 `$`）_ | `@media (min-width: 768px) { .a { ... } }` |

::: tip At-Rules
對於 CSS at-rules，如 `@media` 或 `@container`，**請勿**在值中包含 `$`。當解析後的選擇器不包含 `%` 佔位符時，引擎會自動將預設選擇器（`.%`）作為巢狀層級附加，產生正確的兩層結構：

<<< @/.examples/guide/built-ins/selectors-at-rule-output.css
:::

::: warning
請勿將 `$` 嵌入 at-rule 字串中（例如 `@media (...) { $ }`）。這會產生 `@media (...) { .a }` 作為**單一區塊選擇器**，導致無效的 CSS。
:::

## 遞迴解析

選擇器解析是遞迴的。選擇器值可以參照另一個選擇器名稱，並透過鏈式關係進行解析：

<<< @/.examples/guide/built-ins/selectors-recursive.ts

::: tip 循環安全機制
解析器會偵測像 `a -> b -> a` 這樣的循環參照。發生時，引擎會記錄警告，並安全地回退為未解析字串，而不是無限遞迴或讓建置卡住。
:::

## `defineSelector` 輔助函式

使用 `defineSelector()` 輔助函式，可獲得具備完整自動補齊的型別安全選擇器定義：

<<< @/.examples/guide/built-ins/selectors-define-helper.ts

## Engine API

插件可以用程式方式管理選擇器：

- `engine.selectors.resolver` — `SelectorResolver` 實例
- `engine.selectors.add(...list)` — 在執行階段新增選擇器定義

## 行為說明

- 無效的選擇器設定形式會被靜默略過。
- 動態解析結果在首次解析後會被快取。
- 靜態和動態規則都儲存在繼承自 `AbstractResolver` 的 `SelectorResolver` 中。
- `$` 佔位符遵循引擎的 `defaultSelector` 選項（預設為 `.%`）。

## 原始碼參考

- `packages/core/src/internal/plugins/selectors.ts`

## 下一步

- 繼續閱讀 [Shortcuts](/zh-TW/guide/built-ins/shortcuts)
- 回到 [內建插件](/zh-TW/guide/built-in-plugins)
- 了解 [插件系統概覽](/zh-TW/plugin-system/overview)

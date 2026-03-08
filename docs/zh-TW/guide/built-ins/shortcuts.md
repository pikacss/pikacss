# Shortcuts

`core:shortcuts` 插件支援可重複使用的樣式組合。定義具名樣式捷徑，並以字串樣式項目的形式傳入 `pika()`，或在樣式定義中透過 `__shortcut` 屬性來使用它們。

## 運作原理

1. 捷徑定義在 `rawConfigConfigured` 期間從 `config.shortcuts.shortcuts` 收集。
2. 在 `configureEngine` 期間，每個定義會被解析並註冊：
   - 靜態規則儲存供精確比對查找。
   - 動態規則儲存供基於 RegExp 的比對。
   - 為已知捷徑新增自動補齊條目。
3. 插件在兩個鉤子上運作：
   - **`transformStyleItems`** — 字串樣式項目會透過 `ShortcutResolver` 進行檢查。若符合，解析後的項目會取代原始字串。
   - **`transformStyleDefinitions`** — 當樣式定義包含 `__shortcut` 屬性時，捷徑會被解析，產生的樣式定義會插入在目前定義其餘屬性的**前面**。
4. 未匹配的捷徑字串保持不變（直接傳遞）。

## 設定

<<< @/.examples/guide/built-ins/shortcuts-config-interface.ts

## 捷徑定義格式

共有 **5 種**定義捷徑的形式：1 種字串形式、2 種元組形式和 2 種物件形式。

### 字串形式

純字串僅作為自動補齊建議登錄——不會建立解析規則。

<<< @/.examples/guide/built-ins/shortcuts-string-form.ts

### 元組形式——靜態

<<< @/.examples/guide/built-ins/shortcuts-tuple-static-type.ts

值可以是 `StyleDefinition` 物件、參照另一個捷徑的 `string`，或兩者的陣列：

<<< @/.examples/guide/built-ins/shortcuts-tuple-static.ts

### 元組形式——動態

<<< @/.examples/guide/built-ins/shortcuts-tuple-dynamic-type.ts

解析函式接收來自模式比對的 `RegExpMatchArray`，可同步回傳一個或多個 `ResolvedStyleItem`，也可回傳 `Promise`。可選的自動補齊提示為動態模式提供 IDE 建議，且可以是單一字串或陣列：

<<< @/.examples/guide/built-ins/shortcuts-tuple-dynamic.ts

### 物件形式

等同於元組形式，但使用具名屬性。動態物件解析器同樣可回傳 `Promise`。靜態和動態兩種變體均支援：

<<< @/.examples/guide/built-ins/shortcuts-object-form.ts

## 完整範例

<<< @/.examples/guide/built-ins/shortcuts-config.ts

## 與 `pika()` 搭配使用

捷徑可以兩種方式使用：

### 作為字串引數

將捷徑名稱作為字串引數傳入 `pika()`。它們會與其他樣式項目一起被解析：

<<< @/.examples/guide/built-ins/shortcuts-usage-string-arg.ts

產生的 CSS 輸出：

<<< @/.examples/guide/built-ins/shortcuts-output-string-arg.css

### `__shortcut` 屬性

在樣式定義中使用 `__shortcut` 套用一個或多個捷徑。解析後的樣式會在定義中的其他屬性**之前**合併：

<<< @/.examples/guide/built-ins/shortcuts-usage-property.ts

產生的 CSS 輸出：

<<< @/.examples/guide/built-ins/shortcuts-output-property.css

::: tip 屬性順序
使用 `__shortcut` 時，捷徑樣式會插入在定義其餘屬性的**前面**。這意味著與 `__shortcut` 一起定義的屬性可以覆寫捷徑的值。
:::

## `defineShortcut()` 輔助函式

使用 `defineShortcut()` 作為個別捷徑定義的型別安全恆等輔助函式。它提供完整的 TypeScript 自動補齊：

<<< @/.examples/guide/built-ins/shortcuts-define-helper.ts

## 遞迴解析

捷徑可以透過名稱參照其他捷徑。解析是遞迴的——捷徑的值可以是指向另一個已登錄捷徑的字串：

<<< @/.examples/guide/built-ins/shortcuts-recursive.ts

當呼叫 `pika('btn')` 時，引擎會先解析 `'flex-center'`，再將結果與其餘的行內樣式合併。

::: tip 循環安全機制
解析器會偵測像 `btn -> flex-center -> btn` 這樣的循環參照。發生時，引擎會記錄警告，並安全地將未解析項目視為一般字串，而不是進入無限迴圈。
:::

## 自動補齊

插件會登錄：

- `__shortcut` 作為樣式定義的額外屬性，接受 `string | string[]` 值。
- 所有靜態捷徑名稱作為自動補齊建議。
- 動態解析結果會透過 `onResolved` 自動回饋至自動補齊。

## Engine API

插件可以用程式方式管理捷徑：

- `engine.shortcuts.resolver` — `ShortcutResolver` 實例
- `engine.shortcuts.add(...list)` — 在執行階段新增捷徑定義

## 行為說明

- 動態解析結果在首次解析後會被快取。
- 靜態和動態規則都儲存在繼承自 `AbstractResolver` 的 `ShortcutResolver` 中。
- 無效的捷徑設定形式會被靜默略過。
- 捷徑可以參照其他捷徑——解析是遞迴的。
- 解析錯誤會被捕捉並記錄為警告；原始字串將被回傳。

## 原始碼參考

- `packages/core/src/internal/plugins/shortcuts.ts`

## 下一步

- 繼續閱讀 [Plugin System Overview](/zh-TW/plugin-system/overview)
- 回到 [內建插件](/zh-TW/guide/built-in-plugins)
- 對照 [Selectors](/zh-TW/guide/built-ins/selectors)

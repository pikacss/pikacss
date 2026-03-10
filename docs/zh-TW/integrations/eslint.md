# ESLint 設定

PikaCSS 提供一個 ESLint 設定套件，用於強制執行 `pika()` 函式呼叫的「可預測靜態子集合」。轉換器會在建置時期求值符合條件的引數，而這條規則的目標，是把 `pika()` 的使用限制在 literal-only 的範圍內，讓建置流程更明確且避免副作用。

此套件為 **ESLint 9+** 提供一個即用型 flat config 預設。它無法與舊版 `.eslintrc` 設定搭配使用。

## 安裝

::: code-group
<<< @/.examples/integrations/eslint-install.sh [pnpm]
<<< @/.examples/integrations/eslint-install-npm.sh [npm]
<<< @/.examples/integrations/eslint-install-yarn.sh [yarn]
<<< @/.examples/integrations/eslint-install-bun.sh [bun]
:::

::: warning 需要 ESLint 9+
此插件需要 ESLint 9.0.0 或更高版本，並使用 flat config 格式。它與 `.eslintrc.*` 設定檔不相容。
:::

## 基本設定

將設定新增至你的 `eslint.config.mjs`（或 `.js`、`.ts`）：

<<< @/.examples/integrations/eslint-basic-config.mjs

這會自動套用 `pikacss/no-dynamic-args: 'error'` 規則，驗證所有 `pika()` 呼叫都維持在這條規則強制的可預測 literal 子集合中。

::: tip 簡潔性
新的 flat config 格式將設定從 5+ 行精簡至僅 2 行。`pikacss()` 函式回傳一個預設定好的 ESLint 設定物件，可直接用於設定陣列。
:::

## 替代設定

### 使用具名匯出

若你偏好明確匯入，可使用 `recommended` 具名匯出：

<<< @/.examples/integrations/eslint-recommended-config.mjs

這與預設匯出在功能上完全相同，但讓設定檔中的意圖更為清晰。

### 手動設定

若需要精細控制，可匯入 `plugin` 物件並手動設定規則：

<<< @/.examples/integrations/eslint-advanced-config.mjs

::: info 何時使用手動設定
手動設定在以下情況下很有用：
- 需要按檔案自訂規則嚴重性或選項
- 與複雜的 ESLint 設定整合
- 與需要特定順序的其他插件組合使用
:::

## 規則參考

### `pikacss/no-dynamic-args`

**禁止在 ESLint 規則所要求的較嚴格靜態子集合中，使用動態引數。**

PikaCSS 會在建置時期求值符合條件的 `pika()` 引數，而這條規則刻意採用更窄、更可預測的限制：字面值、包含靜態值的物件/陣列字面值、靜態展開，以及其他可遞迴驗證的靜態結構。

**有效**（靜態）：

<<< @/.examples/integrations/eslint-valid-example.ts

**無效**（動態）：

<<< @/.examples/integrations/eslint-invalid-example.ts

**錯誤輸出範例：**

<<< @/.examples/integrations/eslint-error-output.txt

### 這條規則允許什麼？

當一個表達式維持在可由 AST 直接判斷的 literal-only 子集合內時，就會被這條規則接受。這包括：

- **字面值**：`'red'`、`16`、`-1`、`null`、`` `red` ``
- **物件字面值**：`{ color: 'red', fontSize: 16 }`
- **陣列字面值**：`['color-red', 'font-bold']`
- **巢狀結構**：`{ '&:hover': { color: 'blue' } }`
- **靜態展開**：`{ ...{ color: 'red' } }`（靜態物件字面值的展開）
- **一元表達式**：`-1`、`+2`

以下會被這條規則拒絕：

- **變數**：`pika({ color: myColor })`
- **函式呼叫**：`pika({ color: getColor() })`
- **含表達式的樣板字面值**：`` pika({ fontSize: `${size}px` }) ``
- **條件式**：`pika({ color: isDark ? 'white' : 'black' })`
- **成員存取**：`pika({ color: theme.primary })`
- **二元/邏輯表達式**：`pika({ width: x + 10 })`
- **動態展開**：`pika({ ...baseStyles })`
- **動態計算鍵**：`pika({ [key]: 'value' })`

::: info 規則的範圍
這條規則刻意比轉換器本身更嚴格。它的目的不是列出轉換器在技術上「可能」於建置時求值的所有表達式，而是讓團隊與 CI 中的 `pika()` 使用維持可預測。
:::

::: tip 為何有此限制？
PikaCSS 在建置時期而非執行期編譯樣式。將引數限制在 literal-only 子集合中，可讓轉換更容易推理，也能避免意外的建置時期副作用。概念性詳細說明請參閱[建置時期編譯](/zh-TW/principles/build-time-compile)。
:::

## 設定

### `fnName`

若 `pika` 與你專案中的其他識別符衝突，可自訂偵測的函式名稱：

<<< @/.examples/integrations/eslint-custom-fnname.mjs

當 `fnName` 設定為 `'css'` 時，規則將偵測：

- `css()`、`cssp()`
- `css.str()`、`css.arr()`
- `css['str']()`、`css['arr']()`
- `cssp.str()`、`cssp.arr()`

使用 `recommended()` 函式時也可傳入選項：

<<< @/.examples/integrations/eslint-recommended-with-options.mjs

::: info 預設值
預設情況下，`fnName` 為 `'pika'`，可偵測 `pika()`、`pikap()`、`pika.str()`、`pika.arr()`，以及對應的靜態 bracket-access 變體。
:::

## 運作原理

ESLint 設定套件分析原始碼的抽象語法樹（AST），以偵測對 `pika()`（或變體如 `pika.str()`、`pika['str']()`、`pikap()` 等）的呼叫。對每個偵測到的呼叫：

1. **遍歷引數**：規則遞迴地檢查每個引數節點及其巢狀結構（物件屬性、陣列元素、展開操作）。
2. **檢查 literal 子集合**：對每個值節點，規則驗證它是否符合允許的靜態規則之一（字面值、包含靜態值的物件字面值等）。
3. **回報違規**：若發現非靜態表達式，規則會回報一個 ESLint 錯誤，說明該節點為何落在這條規則的靜態子集合之外。

套件會根據基本 `fnName` 選項自動推導所有函式名稱變體：
- 一般：`pika`、`pika.str`、`pika.arr`
- 預覽：`pikap`、`pikap.str`、`pikap.arr`
- 靜態 bracket access：`pika['str']`、`pika['arr']` 以及對應的預覽變體

這確保了全面的覆蓋範圍，無需手動設定每個變體。

## 下一步

- [建置時期編譯原則](/zh-TW/principles/build-time-compile)
- [Vite 整合](/zh-TW/integrations/vite)
- [整合概覽](/zh-TW/integrations/overview)

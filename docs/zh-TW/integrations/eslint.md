# ESLint 設定

PikaCSS 提供一個 ESLint 設定套件，用於強制執行 `pika()` 函式呼叫的建置時期限制。它確保所有引數都是**靜態可分析的**——防止使用執行期值、變數或動態表達式，以免破壞 PikaCSS 的建置時期編譯。

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

將設定新增至你的 `eslint.config.mjs`（或 `.js`、`.ts`、`.cjs`）：

<<< @/.examples/integrations/eslint-basic-config.mjs

這會自動套用 `pikacss/no-dynamic-args: 'error'` 規則，驗證所有 `pika()` 呼叫只使用靜態的、建置時期可求值的引數。

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

**禁止在 PikaCSS 函式呼叫中使用動態（非靜態）引數。**

PikaCSS 在建置時期使用 `new Function('return ...')` 求值所有 `pika()` 引數。這表示引數必須是**靜態可分析的**——只允許字面值、包含靜態值的物件/陣列字面值，以及靜態展開。

**有效**（靜態）：

<<< @/.examples/integrations/eslint-valid-example.ts

**無效**（動態）：

<<< @/.examples/integrations/eslint-invalid-example.ts

**錯誤輸出範例：**

<<< @/.examples/integrations/eslint-error-output.txt

### 何謂「靜態可分析」？

一個表達式若可在建置時期求值而無需執行應用程式執行期程式碼，則為靜態可分析的。這包括：

- **字面值**：`'red'`、`16`、`-1`、`null`、`` `red` ``
- **物件字面值**：`{ color: 'red', fontSize: 16 }`
- **陣列字面值**：`['color-red', 'font-bold']`
- **巢狀結構**：`{ '&:hover': { color: 'blue' } }`
- **靜態展開**：`{ ...{ color: 'red' } }`（靜態物件字面值的展開）
- **一元表達式**：`-1`、`+2`

以下**不是**靜態可分析的：

- **變數**：`pika({ color: myColor })`
- **函式呼叫**：`pika({ color: getColor() })`
- **含表達式的樣板字面值**：`` pika({ fontSize: `${size}px` }) ``
- **條件式**：`pika({ color: isDark ? 'white' : 'black' })`
- **成員存取**：`pika({ color: theme.primary })`
- **二元/邏輯表達式**：`pika({ width: x + 10 })`
- **動態展開**：`pika({ ...baseStyles })`
- **動態計算鍵**：`pika({ [key]: 'value' })`

::: tip 為何有此限制？
PikaCSS 在建置時期而非執行期編譯樣式。所有值都必須在打包期間已知，引擎才能提取並產生原子化 CSS class。概念性詳細說明請參閱[建置時期編譯](/zh-TW/principles/build-time-compile)。
:::

## 設定

### `fnName`

若 `pika` 與你專案中的其他識別符衝突，可自訂偵測的函式名稱：

<<< @/.examples/integrations/eslint-custom-fnname.mjs

當 `fnName` 設定為 `'css'` 時，規則將偵測：

- `css()`、`cssp()`
- `css.str()`、`css.arr()`
- `cssp.str()`、`cssp.arr()`

使用 `recommended()` 函式時也可傳入選項：

<<< @/.examples/integrations/eslint-recommended-with-options.mjs

::: info 預設值
預設情況下，`fnName` 為 `'pika'`，可偵測 `pika()`、`pikap()`、`pika.str()`、`pika.arr()` 及預覽變體。
:::

## 運作原理

ESLint 設定套件分析原始碼的抽象語法樹（AST），以偵測對 `pika()`（或變體如 `pika.str()`、`pikap()` 等）的呼叫。對每個偵測到的呼叫：

1. **遍歷引數**：規則遞迴地檢查每個引數節點及其巢狀結構（物件屬性、陣列元素、展開操作）。
2. **檢查靜態限制**：對每個值節點，規則驗證它是否符合允許的靜態規則之一（字面值、包含靜態值的物件字面值等）。
3. **回報違規**：若發現非靜態表達式，規則會回報一個 ESLint 錯誤，說明該值不是靜態可分析的原因。

套件會根據基本 `fnName` 選項自動推導所有函式名稱變體：
- 一般：`pika`、`pika.str`、`pika.arr`
- 預覽：`pikap`、`pikap.str`、`pikap.arr`

這確保了全面的覆蓋範圍，無需手動設定每個變體。

## 下一步

- [建置時期編譯原則](/zh-TW/principles/build-time-compile)
- [Vite 整合](/zh-TW/integrations/vite)
- [整合概覽](/zh-TW/integrations/overview)

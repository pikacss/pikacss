# 建置時期編譯

PikaCSS 是一個**建置時期** CSS 引擎。原始碼中的每個 `pika()` 呼叫都會在建置過程中被求值並替換——在應用程式於瀏覽器執行之前。結果是 JavaScript 中的純字串字面值，以及一個預先產生的 CSS 檔案。不存在任何執行期樣式引擎。

## 建置流程的運作方式

當你的打包器（Vite、Webpack、Rollup、esbuild、Rspack 或 Rolldown）處理原始檔案時，PikaCSS unplugin 會攔截這些檔案並執行多階段轉換：

### 階段一：函式呼叫偵測

插件使用 regex 掃描每個原始檔案，尋找所有 `pika()` 呼叫，包含格式變體（`pika.str()`、`pika.arr()`）和預覽變體（`pikap()`）。它使用括號深度解析器來正確提取完整的函式呼叫，處理巢狀括號、字串、註解和樣板字面值。

::: info 全域函式
`pika()` 是一個全域函式——你無需匯入它。建置插件透過靜態分析來尋找並替換這些呼叫。產生的 `pika.gen.ts` 透過 `declare global` 提供 TypeScript 支援，而非透過模組匯出。
:::

### 階段二：引數求值

提取的引數字串會在建置時使用 `new Function(...)` 進行求值。例如，`pika({ color: 'red', fontSize: '16px' })` 的引數會被解析為 JavaScript 物件字面值並執行。這就是為什麼**所有引數都必須是靜態可分析的**——它們在建置期間會被直接執行，而非在執行期。

### 階段三：原子化樣式提取

求值後的引數被傳遞給 `engine.use()`，它會：

1. **透過插件鉤子流程轉換樣式項目**（解析捷徑、處理巢狀選擇器等）
2. **提取原子化樣式內容**——每個 CSS 屬性-值對成為一個獨立單元，擁有自己的選擇器、屬性和值
3. **去重複化**——若同一個選擇器下同一屬性出現多次，只有最後一個值有效（CSS 覆寫語意）

### 階段四：原子化 ID 產生

每個唯一的 `[selector, property, value]` 組合都會獲得一個簡短且唯一的 class 名稱。ID 使用雙射 base-52 編碼（`a`–`z`、`A`–`Z`、`aa`、`ba`…）透過 `numberToChars()` 函式依序產生。若相同的屬性-值-選擇器組合再次出現（即使在不同檔案中），也會重用既有的 ID。

### 階段五：程式碼替換

使用 MagicString，插件將每個 `pika()` 呼叫替換為其輸出——以設定格式產生的 class 名稱。原始函式呼叫會從程式碼中完全移除。並產生 source map 以保留除錯能力。

### 階段六：CSS 程式碼產生

所有檔案處理完成後，引擎將收集到的所有原子化樣式渲染至 CSS 檔案（預設為 `pika.gen.css`）。產生的檔案開頭為 `@layer` 順序宣告（`@layer preflights, utilities;`），其後為 preflight 樣式與原子化 utility 樣式——各自包裹在對應的 `@layer` 區塊中。TypeScript 型別定義也會寫入 `pika.gen.ts` 以支援自動補齊。

## 前後對比

**原始碼（你撰寫的內容）：**

<<< @/.examples/principles/build-source.ts

**編譯輸出（在瀏覽器中執行的內容）：**

<<< @/.examples/principles/build-compiled.ts

**產生的 CSS（`pika.gen.css`）：**

<<< @/.examples/principles/build-generated.css

## 輸出格式

PikaCSS 支援兩種轉換後 `pika()` 呼叫的輸出格式。格式可透過 `transformedFormat` 插件選項全域設定，或使用方法變體強制指定每次呼叫的格式。

### String 格式（預設）

`pika()` 或 `pika.str()` 會產生以空格連接的 class 名稱字串：

<<< @/.examples/principles/build-format-string.ts

### Array 格式

`pika.arr()` 會產生 class 名稱字串的陣列，適用於接受 class 陣列的框架：

<<< @/.examples/principles/build-format-array.ts

## 靜態可分析性限制

由於引數在建置時使用 `new Function(...)` 求值，它們**必須是靜態可分析的**。這表示引數只能包含可在不執行應用程式的情況下解析的值。

**有效——建置時可求值的靜態值：**

<<< @/.examples/principles/build-valid-usage.ts

**無效——建置期間無法求值的執行期值：**

<<< @/.examples/principles/build-invalid-usage.ts

::: tip
若你需要動態樣式，可在 `pika()` 定義中使用 CSS 自訂屬性（變數），並在執行期透過 JavaScript 或行內樣式修改其值。
:::

## 原子化 CSS 去重複化

PikaCSS 產生**原子化 CSS**——每個唯一的 CSS 屬性-值對對應到唯一一個 class。當同一個宣告出現在多個元件中時，會自動在整個應用程式中進行去重複化。

**兩個共用樣式的元件：**

<<< @/.examples/principles/build-dedup-source.ts

**產生的 CSS——只有 4 個 class，而非 6 個：**

<<< @/.examples/principles/build-dedup-output.css

這種方法可最小化 CSS 輸出大小：隨著應用程式成長，CSS 檔案的成長是對數級而非線性的，因為大多數新元件都會重用既有的屬性-值對。

## 建置模式 vs. 服務模式

unplugin 的行為會依模式而有所不同：

- **建置模式**（`production`）：在 `buildStart` 時執行 `fullyCssCodegen()`，掃描所有匹配的檔案、收集所有樣式使用情況，並在打包開始前寫入完整的 CSS 檔案。
- **服務模式**（`development`）：按需轉換被請求的檔案。CSS 和 TypeScript 程式碼產生檔案在檔案變更時以防抖（300ms）方式遞增寫入。

## 下一步

- [零副作用](/zh-TW/principles/zero-sideeffect)

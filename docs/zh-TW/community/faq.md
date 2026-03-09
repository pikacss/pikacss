# 常見問題

## 什麼是原子化 CSS？

原子化 CSS 是一種策略，每個 CSS class 只包含**一個** CSS 屬性-值對。當你使用 PikaCSS 撰寫樣式時，它們會被分解為這些小型原子化 class。多個元素若共享相同的屬性-值對，則會重用同一個 class，使 CSS 輸出隨著專案成長而保持較小。

**輸入：**

<<< @/.examples/community/faq-atomic-input.ts

**產生的 CSS：**

<<< @/.examples/community/faq-atomic-output.css

## class 名稱是如何產生的？

PikaCSS 使用 base-52 編碼（`a`–`z`、`A`–`Z`）為每個唯一的屬性-值-選擇器組合指派一個短 class 名稱。預設情況下，引擎會先加上 `pk-` 前綴，因此第一個原子化樣式是 `pk-a`，第二個是 `pk-b`，依此類推。超過 52 個 class 後，名稱會變成 `pk-aa`、`pk-ba` 等。若想使用不帶前綴的 `a`、`b`、`c`，可在引擎設定中明確指定 `prefix: ''`。

## 為何 `pika(...)` 的引數必須是靜態可分析的？

PikaCSS 完全在建置時期運作。整合轉換透過正規表達式找到 `pika(...)` 呼叫，並使用 `new Function('return [...]')` 評估其引數表達式。這意味著引數必須在沒有任何執行期上下文的情況下可解析——不支援變數、函式呼叫或動態表達式。

**✅ 這樣可以：**

<<< @/.examples/community/faq-static-ok.ts

**❌ 這樣不行：**

<<< @/.examples/community/faq-static-bad.ts

## 「零執行期」是什麼意思？

PikaCSS 在建置步驟中完成所有工作。每個 `pika(...)` 呼叫都會在建置時期被替換為產生的 class 名稱字串（或陣列），而對應的 CSS 會寫入產生的檔案。你的生產套件**不包含任何 PikaCSS 執行期程式碼**——只有純 class 名稱字串和標準 CSS 檔案。

## 我可以同時使用 camelCase 和 kebab-case 作為 CSS 屬性嗎？

可以。PikaCSS 接受兩種格式。內部會將 camelCase 屬性轉換為 kebab-case。兩者都會產生相同的原子化 class。

<<< @/.examples/community/faq-case.ts

## PikaCSS 支援巢狀選擇器嗎？

支援。你可以在樣式定義中巢狀偽類別、偽元素、媒體查詢和自訂選擇器：

<<< @/.examples/community/faq-nested.ts

## 我需要匯入 `pika()` 嗎？

不需要。`pika()` 是一個**全域函式**——你可以直接在任何原始檔案中使用它，無需匯入。建置插件透過正規表達式靜態找到所有 `pika()` 呼叫，並在建置時期將它們替換為產生的 class 名稱。`pika.gen.ts` 檔案透過 `declare global` 提供 TypeScript 自動補齊，但它不是可以匯入的模組。你不應該撰寫 `import { pika } from '...'`。

## 為何我需要匯入 `pika.css`？

unplugin 處理符合 `pika.css` 的虛擬模組 ID，並將其解析為產生的 CSS 程式碼產生檔案。在入口檔案中匯入 `pika.css` 是將產生的 CSS 納入打包器模組圖的方式。請注意，這是一個 **CSS 匯入**（用於樣式表），而非針對 `pika` 函式的 JavaScript 匯入。

## 為何設定檔會自動建立？

當找不到設定檔且 `autoCreateConfig` 為 `true`（預設值）時，整合會寫入新的 `pika.config.js`（或你指定的路徑），並預填 `defineEngineConfig({})` 範本。這確保自動補齊的 TypeScript 參考路徑從一開始就正確設定。

## 我可以停用設定檔自動建立嗎？

可以。在插件選項中設定 `autoCreateConfig: false`。當不存在設定檔時，整合會記錄警告並繼續使用預設引擎設定。

## 支援哪些建置工具？

PikaCSS 透過 `@pikacss/unplugin-pikacss` 支援所有主要的 JavaScript 打包器：

| 建置工具 | 匯入路徑 |
|---|---|
| Vite | `@pikacss/unplugin-pikacss/vite` |
| Rollup | `@pikacss/unplugin-pikacss/rollup` |
| Webpack | `@pikacss/unplugin-pikacss/webpack` |
| esbuild | `@pikacss/unplugin-pikacss/esbuild` |
| Rspack | `@pikacss/unplugin-pikacss/rspack` |
| Rolldown | `@pikacss/unplugin-pikacss/rolldown` |

此外，**Nuxt** 透過專用的 `@pikacss/nuxt-pikacss` 模組獲得支援。

## 內建插件有哪些？

核心引擎包含 5 個始終啟用的內建插件。你透過 `defineEngineConfig()` 欄位設定它們——無需額外安裝：

| 插件 | 用途 |
|---|---|
| `important` | 為選定的樣式加入 `!important` |
| `variables` | 定義帶有 preflight 產生的 CSS 自訂屬性 |
| `keyframes` | 定義 `@keyframes` 動畫，並可選擇性地修剪未使用的部分 |
| `selectors` | 註冊自訂選擇器簡寫 |
| `shortcuts` | 定義可重用的樣式捷徑字串 |

## 有哪些插件 hook 可用？

Hook 按照所有已註冊插件的順序執行（`pre` → 預設 → `post`）：

| Hook | 類型 | 描述 |
|---|---|---|
| `configureRawConfig` | async | 在解析前修改原始設定 |
| `rawConfigConfigured` | sync | 原始設定設置後呼叫（唯讀） |
| `configureResolvedConfig` | async | 修改已解析的設定 |
| `configureEngine` | async | 建立後修改引擎實例 |
| `transformSelectors` | async | 轉換選擇器字串 |
| `transformStyleItems` | async | 在提取前轉換樣式項目 |
| `transformStyleDefinitions` | async | 轉換樣式定義 |
| `preflightUpdated` | sync | 當 preflight 變更時呼叫 |
| `atomicStyleAdded` | sync | 當新的原子化樣式被註冊時呼叫 |
| `autocompleteConfigUpdated` | sync | 當自動補齊設定變更時呼叫 |

## 插件執行順序衝突如何解決？

插件按其 `order` 屬性排序：`'pre'` 最先執行，預設（無 `order`）在中間執行，`'post'` 最後執行。此順序適用於內建和使用者插件。

## 為何產生的 CSS 只包含已使用的樣式？

變數和 keyframe 系統有 `pruneUnused` 選項（預設為 `true`）。啟用時，preflight 產生只會輸出實際被使用中的原子化樣式所參照的變數和 keyframe。這使 CSS 輸出保持最小化。

## 下一步

- 返回[插件系統概覽](/zh-TW/plugin-system/overview)
- 重新閱讀[建置時期編譯](/zh-TW/principles/build-time-compile)
- 閱讀 [PikaCSS 是什麼](/zh-TW/getting-started/what-is-pikacss)

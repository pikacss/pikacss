# 第一個 Pika

在[安裝](/zh-TW/getting-started/installation)建置插件並匯入 `pika.css` 之後，你就可以開始使用 `pika(...)` 撰寫樣式了。

## 前置作業

請確保你已完成以下步驟：

1. 安裝 `@pikacss/unplugin-pikacss` 並在打包器設定中註冊插件。
2. 在應用程式進入點中匯入 `pika.css`。

<<< @/.examples/getting-started/first-pika-entry.ts

## 最簡單的範例

`pika()` 是一個全域函式，接受以 camelCase CSS 屬性組成的樣式物件，並回傳可繫結至元素的 class 名稱。

::: tip 全域函式 — 無需匯入
`pika()` 由建置插件註冊為**全域函式**。你**不需要**匯入它 — 直接在任何原始碼檔案中使用即可。建置插件會在建置時期轉換符合條件的 `pika()` 呼叫，並以產生的 class 名稱取代它們。`pika.gen.ts` 檔案為編輯器自動補齊提供 TypeScript 型別宣告（透過 `declare global`），但它不是你匯入來源的模組。
:::

::: code-group
<<< @/.examples/getting-started/first-pika-basic.vue [Vue SFC]
<<< @/.examples/getting-started/first-pika-basic.ts [Vanilla TS]
:::

## 建置時期的行為

PikaCSS 完全在建置時期運作 — **零執行期負擔**。當你執行建置時，PikaCSS 會：

1. **掃描**你的原始碼檔案，尋找 `pika(...)` 呼叫。
2. **在建置時期求值**符合條件的樣式引數。
3. **產生原子化 CSS 類別** — 每個 CSS 屬性值對成為各自的 class。
4. **替換**每個 `pika(...)` 呼叫為對應的 class 名稱字串。
5. **寫入**原子化 CSS 規則至產生的樣式表（`pika.gen.css`）。

### 原始碼與編譯輸出

原始碼中的 `pika()` 呼叫：

<<< @/.examples/getting-started/first-pika-basic.vue{3-12}

在輸出中被編譯為靜態 class 名稱：

<<< @/.examples/getting-started/first-pika-compiled.html

而產生的 `pika.gen.css` 每個屬性包含一個原子化規則：

<<< @/.examples/getting-started/first-pika-output.css

::: tip 為什麼使用原子化 CSS？
每個 CSS 屬性值對都被提取為**單一可重複使用的 class**。如果另一個元素也使用 `color: 'white'`，它將共用相同的 `.pk-d` class。這種去重複化機制讓樣式表隨著應用程式成長而保持精簡。
:::

## 巢狀選擇器

樣式物件支援用於偽類別、媒體查詢和自訂選擇器的巢狀語法。將它們作為樣式物件的鍵進行巢狀 — PikaCSS 會將每個巢狀屬性編譯為各自的原子化 class。

<<< @/.examples/getting-started/first-pika-nested.vue{12-18}

這將產生以下原子化 CSS：

<<< @/.examples/getting-started/first-pika-nested-output.css

## 多個引數

`pika()` 接受多個引數（每個都是 `StyleItem`）。一個引數可以是**樣式物件**或**字串**（用於設定中定義的捷徑）。它們會按順序合併：

<<< @/.examples/getting-started/first-pika-multiple-args.vue{5-12}

## 輸出格式變體

預設情況下，`pika()` 回傳以空格分隔的 class 名稱字串（例如 `"pk-a pk-b pk-c"`）。它也提供不同輸出格式的變體：

<<< @/.examples/getting-started/first-pika-variants.ts

| 變體 | 回傳型別 | 使用情境 |
| --- | --- | --- |
| `pika()` | 已設定值 | 預設（通常為 `string`） |
| `pika.str()` | `string` | 強制使用空格分隔的字串 |
| `pika.arr()` | `string[]` | 強制使用 class 名稱陣列 |

### 使用 `pikap` 進行 IDE 預覽

`pikap` 是偏向預覽用途的 `pika` 變體。它支援與 `pika()` 相同的呼叫形式，包含 `pikap.str()` 與 `pikap.arr()`，同時會在產生的 TypeScript 宣告中加入 IDE 內的 CSS 預覽提示。建置時期，`pikap(...)` 和 `pika(...)` 一樣都會被轉換移除，不會作為執行期 helper 留在正式版本中。

## 設定（選用）

PikaCSS 可以在零設定情況下運作，但你可以建立 `pika.config.ts`（或 `.js`、`.cjs`、`.mjs`、`.cts`、`.mts`）來自訂行為。使用 `defineEngineConfig()` 輔助函式以獲得完整的 TypeScript 自動補齊：

<<< @/.examples/getting-started/first-pika-config.ts

設定檔會由插件自動偵測。所有可用選項請參閱[設定](/zh-TW/guide/configuration)。

## 為什麼這樣設計

你保留了 **CSS-in-JS 的撰寫體驗** — 標準 CSS 屬性、TypeScript 自動補齊、物件組合 — 同時輸出**靜態 CSS**，無任何執行期樣式產生的負擔。

## 下一步

- [建置時期編譯](/zh-TW/principles/build-time-compile) — 深入了解編譯策略
- [設定](/zh-TW/guide/configuration) — 自訂選擇器、捷徑、變數等
- [內建插件](/zh-TW/guide/built-in-plugins) — 了解插件系統

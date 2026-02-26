# 零設定

PikaCSS 的設計宗旨是以合理的預設值開箱即用 — 無需設定檔即可開始使用。「零設定」意味著你可以安裝 PikaCSS、加入建置插件，並立即開始使用 `pika()` 函式撰寫樣式。引擎、程式碼產生、檔案掃描和設定檔建立均會自動處理。

## 插件啟動時的行為

當 PikaCSS 建置插件初始化時，它會自動執行以下步驟：

1. **設定檔探索** — 在你的專案中搜尋現有的設定檔。
2. **自動建立設定** — 如果找不到設定檔，則建立一個包含空白設定結構的 `pika.config.js`。
3. **引擎初始化** — 以內建插件和預設設定建立核心引擎。
4. **檔案掃描** — 掃描你的原始碼檔案，尋找 `pika()` 函式呼叫。
5. **程式碼產生** — 產生 `pika.gen.css`（編譯後的原子化 CSS）與 `pika.gen.ts`（TypeScript 自動補齊支援）。

所有這些步驟均無需任何手動設定。

## 設定檔探索

PikaCSS 會在你的專案中搜尋符合以下 glob 模式的檔案：

```text
**/{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}
```

這表示以下任何檔案名稱都可被識別：`pika.config.js`、`pika.config.ts`、`pikacss.config.mjs` 等。

如果找不到設定檔且 `autoCreateConfig` 已啟用（預設為啟用），PikaCSS 會自動在你的專案根目錄建立一個 `pika.config.js`：

<<< @/.examples/getting-started/auto-created-config.js

`/// <reference path="..." />` 指令會連結至產生的 TypeScript 檔案，讓你的編輯器能在設定中提供自動補齊。

## 內建插件

即使是零設定狀態，PikaCSS 也會載入五個驅動其基礎功能的內建核心插件：

| 插件 | 說明 |
| --- | --- |
| `core:important` | 處理樣式的 `!important` 修飾符 |
| `core:variables` | CSS 自訂屬性（變數），具有未使用項目的移除功能 |
| `core:keyframes` | `@keyframes` 動畫定義，具有未使用項目的移除功能 |
| `core:selectors` | 自訂選擇器解析（例如偽類別、媒體查詢） |
| `core:shortcuts` | 可重複使用的樣式捷徑解析 |

這些插件始終處於啟用狀態 — 你無需將它們加入設定。

## 預設引擎設定

當不存在設定檔（或設定物件為空）時，引擎使用以下預設值：

<<< @/.examples/getting-started/default-engine-config.ts

重點說明：

- **`prefix`** — 預設為空。產生的 class 名稱為簡短識別符，如 `a`、`b`、`c`。設定前綴（例如 `'pk-'`）可為其加上命名空間。
- **`defaultSelector`** — `.%` 將每個原子化樣式轉換為 class 選擇器，其中 `%` 會被樣式 ID 取代（例如 `.a { color: red }`）。
- **`plugins`** — 空陣列。內建插件會分別自動載入。
- **`preflights`** — 無全域基礎樣式。`plugin-reset` 等插件可以新增它們。
- **`important.default`** — `false`。除非明確指定，否則樣式不會加上 `!important`。
- **`variables.pruneUnused`** / **`keyframes.pruneUnused`** — `true`。未使用的變數和關鍵影格會從最終 CSS 輸出中移除。

## 預設插件選項

建置插件（例如 Vite 的）也有自己的預設值：

<<< @/.examples/getting-started/plugin-options-defaults.ts

重點說明：

- **`autoCreateConfig`** — `true`。如果不存在設定檔，會自動建立。
- **`fnName`** — `'pika'`。這是插件在原始碼中尋找的函式名稱。
- **`transformedFormat`** — `'string'`。`pika()` 呼叫在建置時期會被替換為以空格分隔的 class 名稱字串。
- **`tsCodegen`** — `true`。產生 `pika.gen.ts` 以支援 TypeScript 自動補齊。
- **`cssCodegen`** — `true`。產生包含所有編譯後原子化樣式的 `pika.gen.css`。
- **`scan.include`** — 預設掃描所有 `js`、`ts`、`jsx`、`tsx` 和 `vue` 檔案。
- **`scan.exclude`** — 排除 `node_modules` 和 `dist` 目錄。

## 產生的輸出

預設情況下，PikaCSS 在你的專案根目錄產生兩個檔案：

- **`pika.gen.css`** — 包含你原始碼中所有找到樣式的已編譯原子化 CSS。透過虛擬模組 `pika.css` 在應用程式進入點中匯入。
- **`pika.gen.ts`** — 根據你設定的選擇器、捷徑、變數和圖層，為 `pika()` 函式提供自動補齊支援的 TypeScript 宣告檔。此檔案使用 `declare global` 將 `pika` 註冊為全域函式 — 你**不**需要從此檔案匯入 `pika`。

## 何時需要自訂

只有在你想要以下操作時，才需要建立或編輯設定檔：

- 為產生的 class 名稱加上**前綴**
- 定義自訂**選擇器**（例如 `hover`、響應式斷點）
- 建立可重複使用的**捷徑**（例如 `flex-center`）
- 宣告具有主題支援的 CSS **變數**
- 加入**插件**（圖示、重置、排版）
- 設定**前置樣式**（全域基礎樣式）
- 變更程式碼產生的檔案路徑

以下是一個自訂設定的範例：

<<< @/.examples/getting-started/custom-config.ts

## 下一步

- 繼續閱讀[第一個 Pika](/zh-TW/getting-started/first-pika)

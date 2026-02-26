# 什麼是 PikaCSS？

PikaCSS 是一款即時按需的 **Atomic CSS-in-JS 引擎**。它讓你使用熟悉的 CSS 屬性物件搭配完整的 TypeScript 自動補齊來撰寫樣式，並在建置時期將其編譯為最佳化的原子化 CSS 類別 — **零執行期負擔**。

## 核心概念

你透過全域 `pika(...)` 函式，以 camelCase 格式的標準 CSS 屬性來撰寫樣式。建置插件會靜態分析每個 `pika()` 呼叫，將每個 CSS 屬性值對提取為各自的原子化 class，並以產生的 class 名稱取代原本的呼叫。

<<< @/.examples/getting-started/pika-basic-usage.ts

這意味著：

- **無執行期負擔** — 所有樣式產生均在建置步驟中完成。`pika()` 呼叫在最終打包產物中會被替換為純粹的字串。
- **無需自訂詞彙** — 你撰寫真實的 CSS 屬性（`color`、`fontSize`、`padding` 等），而非背誦工具 class 名稱。
- **完整的 TypeScript 自動補齊** — 建置插件會產生一個型別宣告檔（`pika.gen.ts`），為所有 CSS 屬性、自訂選擇器、捷徑以及 CSS 變數提供精確的自動補齊。

## 運作原理

PikaCSS 結合了兩個概念：

1. **CSS-in-JS 撰寫方式** — 具有巢狀結構、組合能力與 TypeScript 型別推論的樣式物件，帶來良好的可讀性與開發體驗。
2. **原子化 CSS 輸出** — 每個唯一的 CSS 屬性值對恰好產生一個小型且可重複使用的 class 規則，使最終樣式表保持精簡。

產生的 CSS 每個宣告對應一個 class：

<<< @/.examples/getting-started/atomic-output.css

當多個元件共用相同的宣告（例如 `color: red`）時，它們會重複使用相同的原子化 class。這種去重複化機制讓 CSS 打包大小保持最小，無論有多少元件使用相同的樣式。

## 巢狀選擇器與響應式設計

樣式定義支援使用偽類別、媒體查詢以及設定中定義的自訂選擇器進行巢狀：

<<< @/.examples/getting-started/pika-nested-selectors.ts

如 `@dark` 或 `@screen-md` 等自訂選擇器需在你的 `pika.config.ts` 中設定。PikaCSS 會在建置時期將它們解析為對應的實際 CSS（例如 `html.dark .a { ... }` 或 `@media screen and (min-width: 768px) { ... }`）。

## 捷徑

你可以在設定中將可重複使用的樣式組合定義為**捷徑**，並透過傳遞字串名稱給 `pika()` 來使用它們：

<<< @/.examples/getting-started/pika-shortcuts-usage.ts

捷徑在建置時期解析 — 不涉及任何執行期查詢。

## 內建插件

引擎內建五個始終載入的插件：

| 插件 | 用途 |
| --- | --- |
| **important** | 為所有宣告加上 `!important`（透過設定啟用） |
| **variables** | 定義具有自動補齊的 CSS 自訂屬性（`--var`），以選擇器為範圍，並移除未使用的變數 |
| **keyframes** | 註冊具有 `animation` / `animationName` 自動補齊的 `@keyframes` 動畫 |
| **selectors** | 註冊自訂選擇器別名（靜態或使用正規表達式的動態方式） |
| **shortcuts** | 註冊可重複使用的樣式組合（靜態或使用正規表達式的動態方式） |

## 設定

PikaCSS 會自動在你的專案根目錄偵測名為 `pika.config.{js,ts,mjs,mts}` 的設定檔。使用 `defineEngineConfig()` 來確保型別安全：

<<< @/.examples/getting-started/pika-config-example.ts

## 框架整合

PikaCSS 透過基於 [unplugin](https://github.com/unjs/unplugin) 的通用插件，整合所有主流建置工具。預設函式名稱為 `pika`，並以**全域函式**的形式提供 — 你的原始碼中無需任何匯入。建置插件會在建置時期靜態找到並替換所有 `pika()` 呼叫。

支援的建置工具：**Vite**、**Rollup**、**Webpack**、**esbuild**、**Rspack**、**Rolldown** 以及 **Nuxt**（透過專用模組）。

以下是在 Vue 單一檔案元件中的使用方式：

<<< @/.examples/getting-started/pika-vue-example.vue

## 什麼情況適合使用 PikaCSS

在以下情況時使用 PikaCSS：

- 你希望在應用程式碼中直接進行**型別安全的樣式撰寫**，並享有完整的 IDE 支援。
- 你希望使用**建置時期編譯**，而非任何執行期的樣式處理工作。
- 你需要**框架無關的整合**，支援 Vite、Webpack、Rspack、Rollup、esbuild、Rolldown 與 Nuxt。
- 你希望憑藉原子化去重複化獲得**最小化的 CSS 輸出**。

## 重要限制

`pika()` 呼叫是以**靜態方式**編譯的。建置插件使用 `new Function(...)` 來求值引數，因此所有引數必須是確定性的 JavaScript 運算式 — 不能參照僅在執行期才存在的變數、元件狀態或動態匯入。

## 下一步

- 繼續閱讀[安裝](/zh-TW/getting-started/installation)

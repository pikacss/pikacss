# Typography 插件

`@pikacss/plugin-typography` 為 prose 內容提供優美的排版預設值。它註冊 CSS 變數和一組模組化的捷徑，用於樣式化標題、段落、連結、程式碼區塊、表格等——類似於 Tailwind CSS Typography，但專為 PikaCSS 打造。

## 安裝

::: code-group
<<< @/.examples/plugins/typography-install.sh [pnpm]
<<< @/.examples/plugins/typography-install-npm.sh [npm]
<<< @/.examples/plugins/typography-install-yarn.sh [yarn]
:::

## 基本用法

<<< @/.examples/plugins/typography-basic-config.ts

接著在你的元件中使用 `prose` 捷徑：

<<< @/.examples/plugins/typography-usage-prose.ts

## Config 欄位

此插件透過[模組擴增](/zh-TW/plugin-system/overview)將 `typography` 欄位加入 `EngineConfig`：

<<< @/.examples/plugins/typography-engine-config-interface.ts

## 自訂變數

Prose 排版的所有視覺面向均由 CSS 變數控制。你可以透過 `typography.variables` 選項覆寫其中任何一個：

<<< @/.examples/plugins/typography-custom-variables.ts

### CSS 變數參考

此插件註冊了 18 個 CSS 變數。所有變數預設為 `currentColor`（或背景使用 `transparent`），因此 prose 內容會直接繼承頁面的配色方案。

| 變數 | 預設值 | 說明 |
| --- | --- | --- |
| `--pk-prose-color-body` | `currentColor` | 正文文字顏色 |
| `--pk-prose-color-headings` | `currentColor` | 標題文字顏色（h1–h4） |
| `--pk-prose-color-lead` | `currentColor` | 引言段落顏色 |
| `--pk-prose-color-links` | `currentColor` | 連結文字顏色 |
| `--pk-prose-color-bold` | `currentColor` | 粗體/強調文字顏色 |
| `--pk-prose-color-counters` | `currentColor` | 清單計數器顏色 |
| `--pk-prose-color-bullets` | `currentColor` | 清單符號顏色 |
| `--pk-prose-color-hr` | `currentColor` | 水平線顏色 |
| `--pk-prose-color-quotes` | `currentColor` | 引用區塊文字顏色 |
| `--pk-prose-color-quote-borders` | `currentColor` | 引用區塊邊框顏色 |
| `--pk-prose-color-captions` | `currentColor` | 圖片說明顏色 |
| `--pk-prose-color-code` | `currentColor` | 行內程式碼顏色 |
| `--pk-prose-color-pre-code` | `currentColor` | 程式碼區塊文字顏色 |
| `--pk-prose-color-pre-bg` | `transparent` | 程式碼區塊背景顏色 |
| `--pk-prose-color-th-borders` | `currentColor` | 表格標頭邊框顏色 |
| `--pk-prose-color-td-borders` | `currentColor` | 表格儲存格邊框顏色 |
| `--pk-prose-color-kbd` | `currentColor` | 鍵盤標籤文字顏色 |
| `--pk-prose-kbd-shadows` | `currentColor` | 鍵盤標籤陰影顏色 |

## 捷徑

### 模組化捷徑

每個捷徑為 prose 內容的特定面向套用樣式。它們全部以 `prose-base` 作為基礎。

| 捷徑 | 說明 |
| --- | --- |
| `prose-base` | 基礎 prose 樣式：正文顏色、最大寬度（`65ch`）、字體大小（`1rem`）、行高（`1.75`），以及首末子元素的 margin 重置 |
| `prose-paragraphs` | 段落間距和引言段落樣式 |
| `prose-links` | 連結顏色、底線和字體粗細 |
| `prose-emphasis` | 粗體和斜體文字樣式 |
| `prose-kbd` | `<kbd>` 元素樣式，含 box-shadow 邊框 |
| `prose-lists` | 有序清單、無序清單、定義清單和巢狀清單樣式 |
| `prose-hr` | 水平線邊框和邊距 |
| `prose-headings` | h1–h4 樣式，包含字體大小、字體粗細、顏色、邊距和行高 |
| `prose-quotes` | 含左側邊框和引號的引用區塊樣式 |
| `prose-media` | 圖片、影片、picture 和 figure/figcaption 樣式 |
| `prose-code` | 行內程式碼和 `<pre>` 程式碼區塊樣式 |
| `prose-tables` | 表格、thead、tbody 和儲存格樣式 |

### 聚合捷徑

| 捷徑 | 說明 |
| --- | --- |
| `prose` | 將上述所有模組化捷徑（`prose-paragraphs` 至 `prose-tables`）合併為單一捷徑，提供完整的排版樣式 |

### 尺寸變體

尺寸變體捷徑繼承 `prose`，並調整 `fontSize` 和 `lineHeight`：

| 捷徑 | 字體大小 | 行高 |
| --- | --- | --- |
| `prose-sm` | `0.875rem` | `1.71` |
| `prose`（預設） | `1rem` | `1.75` |
| `prose-lg` | `1.125rem` | `1.77` |
| `prose-xl` | `1.25rem` | `1.8` |
| `prose-2xl` | `1.5rem` | `1.66` |

### 使用模組化捷徑

你可以只套用特定面向的排版樣式，而非完整的 `prose` 捷徑：

<<< @/.examples/plugins/typography-usage-modular.ts

### 使用尺寸變體

<<< @/.examples/plugins/typography-usage-sizes.ts

## 運作原理

此插件名稱為 `'typography'`。在引擎設定期間：

1. **`configureRawConfig`** — 讀取 `config.typography` 以擷取使用者選項。
2. **`configureEngine`** — 執行兩個動作：
   - 透過 `engine.variables.add()` 新增 CSS 變數（`--pk-prose-*`），合併預設值與任何使用者覆寫。
   - 透過 `engine.shortcuts.add()` 註冊所有捷徑。每個模組化捷徑（例如 `prose-headings`）都包含 `prose-base` 作為依賴項。`prose` 捷徑聚合所有模組化捷徑，尺寸變體則繼承 `prose` 並覆寫尺寸設定。

## 下一步

- 繼續前往 [FAQ](/zh-TW/community/faq)
- 繼續至 [Reset 插件](/zh-TW/plugins/reset)
- 了解 [建立插件](/zh-TW/plugin-system/create-plugin)

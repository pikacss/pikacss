# Icons 插件

`@pikacss/plugin-icons` 讓你可以使用 [Iconify](https://iconify.design/) 上的任何圖示作為原子化 CSS class——由 `@iconify/utils` 和 `@unocss/preset-icons` 提供支援。圖示在建置時期解析並以優化的 CSS data URI 嵌入，零執行期開銷。

## 安裝

此插件需要 `@iconify/utils` 作為 peer dependency：

::: code-group
<<< @/.examples/plugins/icons-install.sh [pnpm]
<<< @/.examples/plugins/icons-install-npm.sh [npm]
<<< @/.examples/plugins/icons-install-yarn.sh [yarn]
:::

## 基本設定

<<< @/.examples/plugins/icons-basic-config.ts

## 圖示命名慣例

圖示遵循以下模式：**`prefix` + `collection:name`**

預設前綴為 `i-`。使用 Iconify collection 和圖示名稱以冒號分隔來參照圖示：

| 簡寫 | Collection | 圖示 |
| --- | --- | --- |
| `i-mdi:home` | Material Design Icons | home |
| `i-lucide:settings` | Lucide | settings |
| `i-carbon:warning` | Carbon | warning |
| `i-tabler:brand-github` | Tabler Icons | brand-github |

瀏覽可用圖示：[Iconify](https://icon-sets.iconify.design/)。

## 使用方式

<<< @/.examples/plugins/icons-usage.ts

在 Vue 元件中：

<<< @/.examples/plugins/icons-usage.vue

## 渲染模式

插件支援兩種渲染模式，決定如何將圖示 SVG 作為 CSS 套用：

### Mask 模式

在 **mask** 模式中，SVG 作為 CSS mask 使用。圖示繼承元素的文字 `color`，便於主題化：

<<< @/.examples/plugins/icons-mask-output.css

### Background 模式

在 **background** 模式中，SVG 作為 CSS 背景圖片使用。圖示保留其原始 SVG 顏色：

<<< @/.examples/plugins/icons-bg-output.css

### Auto 模式（預設）

當 `mode` 為 `'auto'`（預設值）時，插件自動選擇適合的模式：

- **`mask`** — 若 SVG 包含 `currentColor`
- **`bg`** — 否則

你可以在 shortcut 名稱後加上 `?mask`、`?bg` 或 `?auto` 來覆蓋每個圖示的模式。

## 自訂 Collection

你可以在設定中定義內嵌 SVG collection：

<<< @/.examples/plugins/icons-custom-collections.ts

## 自訂處理器

使用 `processor` 選項在 CSS 屬性發出前修改它們：

<<< @/.examples/plugins/icons-processor.ts

## 自動完成

提供圖示名稱清單以增強 IDE 自動完成建議：

<<< @/.examples/plugins/icons-autocomplete.ts

## 進階設定

<<< @/.examples/plugins/icons-advanced-config.ts

## 設定參考

此插件以 `icons` 欄位擴充 `EngineConfig`：

<<< @/.examples/plugins/icons-engine-config-interface.ts

`IconsConfig` 繼承 `@unocss/preset-icons` 的選項（排除 `warn`、`layer` 和 `customFetcher`），並加入 PikaCSS 特定的項目：

| 選項 | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `scale` | `number` | `1` | 圖示縮放係數 |
| `mode` | `'auto' \| 'mask' \| 'bg'` | `'auto'` | 預設渲染模式 |
| `prefix` | `string \| string[]` | `'i-'` | 圖示 shortcut 的 class 名稱前綴 |
| `collections` | `Record<string, IconifyJSON \| (() => Awaitable<IconifyJSON>)>` | — | 自訂圖示 collection |
| `customizations` | `IconCustomizations` | — | 轉換圖示（旋轉、調整大小等） |
| `autoInstall` | `boolean` | `false` | 依需求自動安裝圖示套件 |
| `cdn` | `string` | — | 載入圖示的 CDN 基底 URL |
| `unit` | `string` | — | 圖示尺寸的 CSS 單位（例如 `'em'`） |
| `extraProperties` | `Record<string, string>` | — | 每個圖示的額外 CSS 屬性 |
| `processor` | `(styleItem: StyleItem, meta: Required<IconMeta>) => void` | — | 修改每個圖示的 CSS 輸出 |
| `autocomplete` | `string[]` | — | 額外的自動完成項目 |

## 運作原理

1. 插件註冊一個符合 regex 模式 `/^(?:i-)([\w:-]+)(?:\?(mask|bg|auto))?$/` 的動態 shortcut
2. 當符合的 shortcut 被解析時，它會解析圖示名稱（`collection:name` 格式）
3. SVG 透過 `@iconify/utils` 和 `@unocss/preset-icons` 載入器載入
4. SVG 被編碼為 CSS data URI 並儲存為 CSS 變數（`--<prefix>svg-icon-...`），標記為 `pruneUnused: true`
5. 根據解析的模式，產生以 mask 為基礎或以背景為基礎的 CSS 屬性

## 下一步

- 繼續至 [Reset 插件](/zh-TW/plugins/reset)
- 繼續至 [Typography 插件](/zh-TW/plugins/typography)
- 了解 [建立插件](/zh-TW/plugin-system/create-plugin)

# Reset 插件

`@pikacss/plugin-reset` 將 CSS Reset 樣式表注入至 PikaCSS 前置樣式。它內建 5 種流行的 Reset 預設集，預設使用 `modern-normalize`。

## 安裝

::: code-group
<<< @/.examples/plugins/reset-install.sh [pnpm]
<<< @/.examples/plugins/reset-install-npm.sh [npm]
<<< @/.examples/plugins/reset-install-yarn.sh [yarn]
:::

`@pikacss/core` 為必要的 peer dependency。

## 基本用法

將 `reset()` 插件新增至你的引擎設定。若未設定 `reset` 選項，預設使用 `'modern-normalize'`：

<<< @/.examples/plugins/reset-basic-usage.ts

## 選擇預設集

將 `reset` 設定欄位設為選擇不同的預設集：

<<< @/.examples/plugins/reset-custom-preset.ts

## 可用預設集

此插件內建 5 種 CSS Reset 樣式表：

<<< @/.examples/plugins/reset-all-presets.ts

| 預設集 | 說明 |
|--------|-------------|
| `'modern-normalize'` | **預設。** 為現代瀏覽器標準化樣式。基於 [modern-normalize](https://github.com/sindresorhus/modern-normalize)。 |
| `'normalize'` | 經典的 [Normalize.css](https://necolas.github.io/normalize.css/) — 讓瀏覽器以一致的方式渲染元素。 |
| `'eric-meyer'` | [Eric Meyer 的 CSS Reset](https://meyerweb.com/eric/tools/css/reset/) — 將所有預設的瀏覽器樣式清除至空白狀態。 |
| `'andy-bell'` | [Andy Bell 的現代 CSS Reset](https://piccalil.li/blog/a-modern-css-reset/) — 適用於現代開發的極簡且具主觀性的 Reset。 |
| `'the-new-css-reset'` | [The New CSS Reset](https://elad2412.github.io/the-new-css-reset/) — 使用 `all: unset` 移除所有預設樣式。 |

## 運作原理

此插件使用 `order: 'pre'`，代表它會在其他插件**之前**執行。這確保 Reset CSS 始終是第一個注入的前置樣式，讓你的其他樣式和插件得以建立在一致的基準線之上。

插件內部運作流程：

1. 在 `configureRawConfig` 鉤子期間讀取 `config.reset` 欄位
2. 若未設定值，則回退至 `'modern-normalize'`
3. 預設將 `config.layers.reset` 設為 `-1`，確保 reset layer 最先渲染
4. 從內建的預設集檔案載入對應的 CSS 字串
5. 在 `configureEngine` 鉤子期間透過 `engine.addPreflight({ layer: 'reset', preflight: resetCss })` 注入 CSS

## 與其他插件搭配使用

Reset 插件與其他 PikaCSS 插件自然地搭配使用。由於它以 `order: 'pre'` 執行，其樣式無論插件陣列順序為何，始終會最先被注入：

<<< @/.examples/plugins/reset-with-other-plugins.ts

## 型別擴增

此插件擴增了 `@pikacss/core` 的 `EngineConfig`：

<<< @/.examples/plugins/reset-engine-config-interface.ts

這讓你在設定中指定 `reset` 選項時，能獲得完整的 TypeScript 自動完成功能。

## 插件詳情

| 屬性 | 值 |
|----------|-------|
| 插件名稱 | `'reset'` |
| 順序 | `'pre'` |
| 套件 | `@pikacss/plugin-reset` |
| 預設預設集 | `'modern-normalize'` |

## 下一步

- [Icons 插件](/zh-TW/plugins/icons)
- [Typography 插件](/zh-TW/plugins/typography)
- [建立你自己的插件](/zh-TW/plugin-system/create-plugin)

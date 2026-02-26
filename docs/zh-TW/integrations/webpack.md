# Webpack 整合

PikaCSS 透過 `@pikacss/unplugin-pikacss/webpack` 進入點與 [webpack](https://webpack.js.org/) 整合。

## 安裝

::: code-group
<<< @/.examples/integrations/install-unplugin.sh [pnpm]
<<< @/.examples/integrations/install-unplugin-npm.sh [npm]
<<< @/.examples/integrations/install-unplugin-yarn.sh [yarn]
<<< @/.examples/integrations/install-unplugin-bun.sh [bun]
:::

## 設定 webpack

將 PikaCSS 插件新增至你的 webpack 設定：

::: code-group
<<< @/.examples/integrations/webpack.config.mjs [ESM]
:::

::: tip ESM vs CommonJS
webpack 透過 `.mjs` 副檔名或 `package.json` 中的 `"type": "module"` 支援 ESM 設定檔。插件在兩種模組系統下都能運作。
:::

## 匯入產生的 CSS

在你的應用程式進入點檔案中新增以下匯入：

<<< @/.examples/integrations/entry.ts

`pika.css` 是一個由插件在建置時期解析的虛擬模組。它指向產生的 CSS 輸出檔案（預設為 `pika.gen.css`）。

## 插件選項

所有 unplugin 轉接器共用相同的選項。完整的選項表請參閱 [Rollup 整合](/zh-TW/integrations/rollup#plugin-options)頁面——所有打包器轉接器的選項都是相同的。

## 運作原理

webpack 轉接器是一個輕量的 `createWebpackPlugin(unpluginFactory)` 封裝。它與所有其他 unplugin 轉接器共用相同的轉換流程和程式碼產生邏輯。插件會：

1. 在建置期間掃描原始檔案中的 `pika()` 呼叫。
2. 將每個呼叫替換為產生的原子化 class 名稱字串。
3. 將原子化 CSS 規則寫入程式碼產生輸出檔案。
4. 將 `pika.css` 匯入解析至產生的 CSS 檔案。

在 webpack 中，共用 factory 使用編譯器上下文來決定 `cwd`，並讀取 webpack 的 `mode`（`'development'` → 服務模式，否則 → 建置模式）來設定整合。

## 下一步

- [Rspack](/zh-TW/integrations/rspack)

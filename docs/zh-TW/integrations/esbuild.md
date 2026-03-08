# Esbuild 整合

PikaCSS 透過 `@pikacss/unplugin-pikacss/esbuild` 進入點與 [esbuild](https://esbuild.github.io/) 整合。

## 安裝

::: code-group
<<< @/.examples/integrations/install-unplugin.sh [pnpm]
<<< @/.examples/integrations/install-unplugin-npm.sh [npm]
<<< @/.examples/integrations/install-unplugin-yarn.sh [yarn]
<<< @/.examples/integrations/install-unplugin-bun.sh [bun]
:::

## 設定 esbuild

由於 esbuild 不使用設定檔，請在你的建置腳本中新增 PikaCSS 插件：

<<< @/.examples/integrations/esbuild.build.ts

## 匯入產生的 CSS

在你的應用程式進入點檔案中新增以下匯入：

<<< @/.examples/integrations/entry.ts

`pika.css` 是一個由插件在建置時期解析的虛擬模組。它指向產生的 CSS 輸出檔案（預設為 `pika.gen.css`）。

## 插件選項

所有 unplugin 轉接器共用相同的選項。完整的選項表請參閱 [Rollup 整合](/zh-TW/integrations/rollup#plugin-options)頁面——所有打包器轉接器的選項都是相同的。

## 運作原理

esbuild 轉接器是一個輕量的 `createEsbuildPlugin(unpluginFactory)` 封裝。它與所有其他 unplugin 轉接器共用相同的轉換流程和程式碼產生邏輯。插件會：

1. 在建置期間掃描原始檔案中的 `pika()` 呼叫。
2. 將每個呼叫替換為產生的原子化 class 名稱字串。
3. 將原子化 CSS 規則寫入程式碼產生輸出檔案。
4. 將 `pika.css` 匯入解析至產生的 CSS 檔案。

在 esbuild 中，插件使用 `onResolve` 鉤子來處理 `pika.css` 虛擬模組，將其直接解析至產生的 CSS 程式碼產生檔案路徑。

## 下一步

- [Rolldown](/zh-TW/integrations/rolldown)
- [整合概覽](/zh-TW/integrations/overview)
- [設定](/zh-TW/guide/configuration)

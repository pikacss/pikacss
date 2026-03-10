# Nuxt 整合

PikaCSS 透過 `@pikacss/nuxt-pikacss` 套件為 [Nuxt](https://nuxt.com/) 提供專屬模組。

## 安裝

::: code-group
<<< @/.examples/integrations/install-nuxt.sh [pnpm]
<<< @/.examples/integrations/install-nuxt-npm.sh [npm]
<<< @/.examples/integrations/install-nuxt-yarn.sh [yarn]
<<< @/.examples/integrations/install-nuxt-bun.sh [bun]
:::

## 設定 Nuxt

在你的 `nuxt.config.ts` 中註冊模組：

<<< @/.examples/integrations/nuxt.config.ts

就這樣——不需要額外設定。模組會自動處理一切。

## 自訂選項

你可以透過 Nuxt 設定中的 `pikacss` 鍵來設定 PikaCSS 選項：

<<< @/.examples/integrations/nuxt.config.with-options.ts

`ModuleOptions` 型別與 `@pikacss/unplugin-pikacss` 中的 `PluginOptions` 相同，但省略了 `currentPackageName` 欄位（它在內部被設定為 `'@pikacss/nuxt-pikacss'`）。

## 模組自動設定的內容

Nuxt 模組會自動處理以下事項：

1. **註冊 Nuxt 插件**，匯入 `pika.css`——你**無需**手動匯入產生的 CSS。
2. **新增 Vite 插件**（`@pikacss/unplugin-pikacss/vite`），並設定 `enforce: 'pre'` 以確保正確的轉換順序。
3. **轉送選項**，將 `nuxt.options.pikacss` 中的選項傳遞至底層 Vite 插件。
4. **預設掃描規則**：省略 `pikacss` 設定鍵時，模組會使用與 unplugin 相同的預設：`**/*.{js,ts,jsx,tsx,vue}`。若要縮小掃描範圍，請明確傳入 `pikacss.scan.include`。

::: tip 僅在需要時縮小掃描範圍
Nuxt 模組一開始採用標準 unplugin 掃描模式。若你想將掃描限制在元件檔案內，可明確指定 `scan.include`，例如：

<<< @/.examples/integrations/nuxt.config.scan-all.ts
:::

::: tip 無需匯入 CSS
與其他整合不同，你**無需**在進入點檔案中新增 `import 'pika.css'`。Nuxt 模組會建立一個插件樣板，自動為你匯入它。
:::

## 插件選項

完整的選項表請參閱 [Rollup 整合](/zh-TW/integrations/rollup#plugin-options)頁面——模組透過 `pikacss` 設定鍵接受相同的選項（除了 `currentPackageName`）。

## 下一步

- [Webpack](/zh-TW/integrations/webpack)
- [整合概覽](/zh-TW/integrations/overview)
- [自訂建置工具整合](/zh-TW/integrations/custom-integration)

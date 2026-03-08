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
4. **預設掃描規則**：只有在完全省略 `pikacss` 設定鍵時，預設才會掃描 `**/*.vue`、`**/*.tsx` 和 `**/*.jsx` 檔案。若你傳入 `pikacss: {}`，模組會改用 unplugin 的預設掃描模式：`**/*.{js,ts,jsx,tsx,vue}`。

::: warning Nuxt 預設掃描排除了 `.ts` 與 `.js` 檔案
Nuxt 模組的內建預設有意略過純 `.ts` 與 `.js` 檔案。在 Nuxt 中，建議將 `pika()` 呼叫放在元件檔案（`.vue`、`.tsx`、`.jsx`）中，而非放在 composables 或工具模組裡，因為伺服器端渲染與 Nuxt 的模組解析機制可能導致這些檔案在建置轉換未執行的環境中被求值。

如果你確實需要在 `.ts` composables 中使用 `pika()`，請透過明確設定 `scan.include` 來恢復或自訂較廣泛的掃描模式：

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

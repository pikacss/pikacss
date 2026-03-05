# 安裝

本指南以 **Vite** 作為主要示範路徑。PikaCSS 同樣支援 Rollup、Webpack、Rspack、esbuild、Rolldown 和 Nuxt — 請參閱下方的[其他建置工具](#other-build-tools)。

## 1) 安裝套件

將 `@pikacss/unplugin-pikacss` 安裝為開發依賴。這是將 PikaCSS 整合至你的專案建置流程的通用建置插件。

::: code-group
<<< @/.examples/getting-started/install-unplugin.sh [pnpm]
<<< @/.examples/getting-started/install-unplugin-npm.sh [npm]
<<< @/.examples/getting-started/install-unplugin-yarn.sh [yarn]
<<< @/.examples/getting-started/install-unplugin-bun.sh [bun]
:::

::: tip 這個套件包含什麼？
`@pikacss/unplugin-pikacss` 打包了所有入門所需的內容 — 核心引擎（`@pikacss/core`）與建置整合（`@pikacss/integration`）均作為傳遞依賴包含在內。你**不需要**單獨安裝它們。
:::

## 2) 註冊 Vite 插件

匯入 Vite 專用的進入點並將其加入你的 Vite 設定：

<<< @/.examples/getting-started/vite.config.ts

插件會自動處理檔案掃描、程式碼轉換和 CSS 產生。

## 3) 匯入產生的 CSS

在你的應用程式進入點（例如 `src/main.ts`）中加入以下匯入：

<<< @/.examples/getting-started/main-entry.ts

`pika.css` 是一個由插件在建置時期解析的**虛擬模組**。它指向產生的 CSS 輸出檔案（預設為 `pika.gen.css`），其中包含從你的原始碼中提取的所有原子化 CSS 規則。

## 4) 設定檔（選用）

使用預設設定（`autoCreateConfig: true`）首次執行時，如果專案根目錄中還沒有設定檔，PikaCSS 會自動在專案根目錄中建立 `pika.config.ts` 檔案。你也可以手動建立：

<<< @/.examples/getting-started/pika.config.ts

PikaCSS 會自動偵測符合以下模式的設定檔：
- `pika.config.{js,cjs,mjs,ts,cts,mts}`
- `pikacss.config.{js,cjs,mjs,ts,cts,mts}`

`defineEngineConfig` 已從 `@pikacss/unplugin-pikacss` 重新匯出，方便使用 — 無需額外匯入。

## 產生的檔案

當你啟動開發伺服器或執行建置時，插件預設會產生兩個檔案：

| 檔案 | 說明 |
| --- | --- |
| `pika.gen.css` | 從 `pika()` 呼叫中提取的已編譯原子化 CSS 規則 |
| `pika.gen.ts` | 為你的自訂選擇器、捷徑和變數提供自動補齊的 TypeScript 宣告 |

::: warning pika.gen.ts 是型別宣告，不是匯入來源
`pika.gen.ts` 使用 `declare global` 將 `pika` 註冊為全域函式。它提供 TypeScript 自動補齊支援，但**並非**你匯入 `pika` 的模組。你永遠不需要寫 `import { pika } from './pika.gen'` — `pika()` 在所有被建置插件掃描到的原始碼檔案中均可作為全域函式使用。
:::

你可以透過插件選項自訂輸出路徑：

```ts
PikaCSS({
  tsCodegen: './src/pika.gen.ts',
  cssCodegen: './src/pika.gen.css',
})
```

設定 `tsCodegen: false` 可完全停用 TypeScript 程式碼產生。

## 官方插件（選用） {#official-plugins}

PikaCSS 提供官方插件以滿足常見需求。只需安裝你需要的插件：

<<< @/.examples/getting-started/install-plugins.sh [pnpm]

| 套件 | 說明 |
| --- | --- |
| `@pikacss/plugin-reset` | CSS 重置預設集（`'modern-normalize'`、`'normalize'`、`'eric-meyer'`、`'andy-bell'`、`'the-new-css-reset'`） |
| `@pikacss/plugin-icons` | 透過 [@iconify](https://iconify.design/) 整合提供的圖示支援 |
| `@pikacss/plugin-typography` | 排版 / 文章樣式插件 |

所有插件都以 `@pikacss/core` 作為 peer 依賴，而它已透過 `@pikacss/unplugin-pikacss` 安裝。

在設定檔中註冊插件：

<<< @/.examples/getting-started/pika.config.with-plugins.ts

## 其他建置工具 {#other-build-tools}

`@pikacss/unplugin-pikacss` 為所有主流建置工具提供進入點。匯入路徑決定使用哪個轉接器：

| 建置工具 | 匯入路徑 |
| --- | --- |
| Vite | `@pikacss/unplugin-pikacss/vite` |
| Rollup | `@pikacss/unplugin-pikacss/rollup` |
| Webpack | `@pikacss/unplugin-pikacss/webpack` |
| esbuild | `@pikacss/unplugin-pikacss/esbuild` |
| Rspack | `@pikacss/unplugin-pikacss/rspack` |
| Rolldown | `@pikacss/unplugin-pikacss/rolldown` |

所有轉接器共用相同的插件選項與行為 — 它們都是圍繞相同核心 `unpluginFactory` 的薄包裝。

有關各建置工具的詳細安裝說明，請參閱[整合概覽](/zh-TW/integrations/overview)。

### Nuxt

Nuxt 具有專用的模組包裝：

<<< @/.examples/getting-started/install-nuxt.sh [pnpm]

<<< @/.examples/getting-started/nuxt.config.ts

Nuxt 模組會自動以 `enforce: 'pre'` 方式註冊 Vite 插件，並為你匯入 `pika.css` — 無需手動匯入 CSS。詳情請參閱 [Nuxt 整合](/zh-TW/integrations/nuxt)。

## 下一步

- 繼續閱讀[零設定](/zh-TW/getting-started/zero-config)

# 整合概覽

PikaCSS 透過 [`@pikacss/unplugin-pikacss`](https://www.npmjs.com/package/@pikacss/unplugin-pikacss) 整合至你的建置流程，這是一個由 [unplugin](https://github.com/unjs/unplugin) 驅動的通用建置插件。針對 Nuxt 專案，也提供了專屬的 [Nuxt 模組](#nuxt)。

## 支援的打包器

所有打包器插件都是圍繞相同核心 `unpluginFactory` 的輕量轉接器。它們共用相同的選項、轉換邏輯和程式碼產生行為。

| 打包器 | 套件匯入 | 指南 |
|---|---|---|
| **Vite** | `@pikacss/unplugin-pikacss/vite` | [Vite →](/zh-TW/integrations/vite) |
| **Rollup** | `@pikacss/unplugin-pikacss/rollup` | [Rollup →](/zh-TW/integrations/rollup) |
| **Webpack** | `@pikacss/unplugin-pikacss/webpack` | [Webpack →](/zh-TW/integrations/webpack) |
| **esbuild** | `@pikacss/unplugin-pikacss/esbuild` | [esbuild →](/zh-TW/integrations/esbuild) |
| **Rspack** | `@pikacss/unplugin-pikacss/rspack` | [Rspack →](/zh-TW/integrations/rspack) |
| **Rolldown** | `@pikacss/unplugin-pikacss/rolldown` | [Rolldown →](/zh-TW/integrations/rolldown) |
| **Nuxt** | `@pikacss/nuxt-pikacss` | [Nuxt →](/zh-TW/integrations/nuxt) |

## 開發工具

PikaCSS 也提供開發者工具，用於在開發期間強制執行最佳實踐並捕捉錯誤。

| 工具 | 套件 | 用途 |
|---|---|---|
| **ESLint** | `@pikacss/eslint-config` | 強制執行 `pika()` 呼叫的建置時期限制 |

[ESLint 插件 →](/zh-TW/integrations/eslint)

## 快速設定範例

::: code-group

<<< @/.examples/integrations/vite-setup.ts [Vite]

<<< @/.examples/integrations/rollup-setup.ts [Rollup]

<<< @/.examples/integrations/webpack-setup.ts [Webpack]

<<< @/.examples/integrations/esbuild-setup.ts [esbuild]

<<< @/.examples/integrations/rspack-setup.ts [Rspack]

<<< @/.examples/integrations/rolldown-setup.ts [Rolldown]

<<< @/.examples/integrations/nuxt-setup.ts [Nuxt]

:::

## 插件選項

所有打包器插件都接受相同的 `PluginOptions` 介面：

<<< @/.examples/integrations/plugin-options.ts

### 選項參考

| 選項 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `scan.include` | `string \| string[]` | `['**/*.{js,ts,jsx,tsx,vue}']` | 用於掃描 `pika()` 呼叫的檔案 glob 規則 |
| `scan.exclude` | `string \| string[]` | `['node_modules/**', 'dist/**']` | 排除掃描的檔案 glob 規則 |
| `config` | `EngineConfig \| string` | `undefined` | 行內引擎設定物件，或設定檔路徑 |
| `autoCreateConfig` | `boolean` | `true` | 若不存在設定檔則自動建立 `pika.config.ts` |
| `fnName` | `string` | `'pika'` | 在原始碼中偵測並轉換的函式名稱 |
| `transformedFormat` | `'string' \| 'array'` | `'string'` | 產生的 class 名稱的輸出格式 |
| `tsCodegen` | `boolean \| string` | `true` | TypeScript 程式碼產生檔案路徑（`true` → `'pika.gen.ts'`，`false` 停用） |
| `cssCodegen` | `true \| string` | `true` | CSS 程式碼產生檔案路徑（`true` → `'pika.gen.css'`） |

## 產生的檔案

插件在建置期間會在專案根目錄產生兩個檔案：

- **`pika.gen.css`** — 包含所有提取的原子化 CSS 規則。這是虛擬模組所使用的實際 CSS 輸出。
- **`pika.gen.ts`** — 提供 TypeScript 型別擴充，用於 `pika()` 呼叫的自動補齊和型別檢查（自訂選擇器、捷徑、變數等）。

你應該將這兩個檔案加入 `.gitignore`：

```gitignore
pika.gen.css
pika.gen.ts
```

## 虛擬 CSS 模組（`pika.css`）

PikaCSS 提供一個名為 `pika.css` 的虛擬模組，它會解析至產生的 CSS 檔案。在你的應用程式進入點匯入它以包含所有原子化樣式：

<<< @/.examples/integrations/import-pika-css.ts

::: tip 運作原理
當建置插件遇到 `import 'pika.css'` 時，它會將該匯入解析至產生的 `pika.gen.css` 檔案。這在所有支援的打包器中都適用——你的專案中不需要實際的 `pika.css` 檔案。
:::

## 設定檔

當 `autoCreateConfig` 為 `true`（預設值）時，若不存在設定檔，插件會自動建立一個 `pika.config.ts` 檔案。設定檔會以下列名稱自動偵測：

- `pika.config.js`
- `pika.config.ts`
- `pika.config.mjs`
- `pika.config.mts`
- `pika.config.cts`

插件會監控設定檔的變更，並在修改後自動重新載入。

## Nuxt

`@pikacss/nuxt-pikacss` 套件將 Vite 插件封裝為 Nuxt 模組。它會：

- 自動以 `enforce: 'pre'` 註冊 Vite 插件
- 透過 Nuxt 插件樣板注入 `import 'pika.css'`——無需手動匯入
- 將 `scan.include` 預設為 `['**/*.vue', '**/*.tsx', '**/*.jsx']`
- 在 `nuxt.config.ts` 的 `pikacss` 設定鍵下公開選項

<<< @/.examples/integrations/nuxt-setup.ts

詳細資訊請參閱 [Nuxt 整合指南](/zh-TW/integrations/nuxt)。

## 建議學習路徑

我們建議從 **Vite** 整合作為主要學習路徑，再依需求延伸至其他打包器：

1. [Vite](/zh-TW/integrations/vite) — 首選，最常見的設定
2. [Rollup](/zh-TW/integrations/rollup) / [Rolldown](/zh-TW/integrations/rolldown) — Rollup 系列打包器
3. [esbuild](/zh-TW/integrations/esbuild) — 設定精簡的快速打包器
4. [Webpack](/zh-TW/integrations/webpack) / [Rspack](/zh-TW/integrations/rspack) — Webpack 系列打包器
5. [Nuxt](/zh-TW/integrations/nuxt) — 框架層級整合

# Rollup 整合

PikaCSS 透過 `@pikacss/unplugin-pikacss/rollup` 進入點與 [Rollup](https://rollupjs.org/) 整合。

## 安裝

::: code-group
<<< @/.examples/integrations/install-unplugin.sh [pnpm]
<<< @/.examples/integrations/install-unplugin-npm.sh [npm]
<<< @/.examples/integrations/install-unplugin-yarn.sh [yarn]
<<< @/.examples/integrations/install-unplugin-bun.sh [bun]
:::

## 設定 Rollup

將 PikaCSS 插件新增至你的 Rollup 設定：

<<< @/.examples/integrations/rollup.config.ts

## 匯入產生的 CSS

在你的應用程式進入點檔案中新增以下匯入：

<<< @/.examples/integrations/entry.ts

`pika.css` 是一個由插件在建置時期解析的虛擬模組。它指向產生的 CSS 輸出檔案（預設為 `pika.gen.css`）。

## 插件選項

所有 unplugin 轉接器共用相同的選項。你可以透過傳入選項物件來自訂插件行為：

<<< @/.examples/integrations/rollup.config.with-options.ts

### 預設值

| 選項 | 預設值 | 說明 |
| --- | --- | --- |
| `scan.include` | `['**/*.{js,ts,jsx,tsx,vue}']` | 要掃描的檔案 glob 規則 |
| `scan.exclude` | `['node_modules/**', 'dist/**']` | 要排除的檔案 glob 規則 |
| `fnName` | `'pika'` | 在原始碼中偵測的函式名稱 |
| `transformedFormat` | `'string'` | 輸出格式：`'string'` 或 `'array'` |
| `autoCreateConfig` | `true` | 找不到 `pika.config.js` 時自動建立 |
| `tsCodegen` | `true` → `'pika.gen.ts'` | TypeScript 程式碼產生檔案路徑，或 `false` 停用 |
| `cssCodegen` | `true` → `'pika.gen.css'` | CSS 程式碼產生檔案路徑 |
| `config` | `undefined` | 引擎設定物件或設定檔路徑 |

省略 `config` 時，插件會從整合的工作目錄（通常就是你的專案根目錄）自動偵測 `{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}`。若 `autoCreateConfig` 保持預設值 `true` 且找不到設定檔，首次執行時會在同一位置建立 `pika.config.js`。

## 運作原理

Rollup 轉接器是一個輕量的 `createRollupPlugin(unpluginFactory)` 封裝。它使用與所有其他 unplugin 轉接器相同的轉換流程和程式碼產生邏輯。插件會：

1. 在建置期間掃描原始檔案中的 `pika()` 呼叫。
2. 將每個呼叫替換為產生的原子化 class 名稱字串。
3. 將原子化 CSS 規則寫入程式碼產生輸出檔案。
4. 將 `pika.css` 匯入解析至產生的 CSS 檔案。

## 下一步

- [Rolldown](/zh-TW/integrations/rolldown)
- [插件選項參考](/zh-TW/guide/configuration)

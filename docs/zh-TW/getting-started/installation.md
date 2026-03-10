# Installation

多數專案都應該從 unplugin package 開始。這條路徑透過共享的 integration model，涵蓋了 Vite、Rollup、Webpack、Rspack、Rolldown 與 esbuild。

::: code-group
<<< @/.examples/zh-TW/getting-started/install-unplugin.sh [pnpm]
<<< @/.examples/zh-TW/getting-started/install-unplugin-npm.sh [npm]
<<< @/.examples/zh-TW/getting-started/install-unplugin-yarn.sh [yarn]
:::

如果你使用的是 Nuxt，請直接前往 [Nuxt](/zh-TW/integrations/nuxt)。

## 推薦的第一次設定

除非你的專案已經跑在其他工具上，否則先從 Vite 開始。最小可成功的設定包含三個部分：

1. 在 bundler config 中註冊 PikaCSS plugin。
2. 在應用程式 entry 匯入 virtual module `pika.css`。
3. 在支援的原始碼檔案中寫一個字面值的 `pika()` 呼叫。

<<< @/.examples/zh-TW/integrations/vite-basic-config.ts

<<< @/.examples/zh-TW/integrations/import-pika-css.ts

## 支援的 build tools

- Vite
- Nuxt
- Rollup
- Webpack
- Rspack
- Rolldown
- esbuild

完整對照表請看 [Integrations Overview](/zh-TW/integrations/overview)。

::: warning 在寫正式 styles 之前先讀這段
`pika()` 的 arguments 必須能被靜態分析。不要因為 API 表面看起來像一般 JavaScript，就假設你可以傳入 runtime values。在把它大規模用進整個 codebase 前，先讀 [Static Arguments](/zh-TW/getting-started/static-arguments)。
:::

## Config file discovery

PikaCSS 會自動尋找名為 `pika.config.{js,ts,mjs,mts,cjs,cts}` 的 config files。Zero-config 很適合第一次執行，但大多數真實專案一旦需要 selectors、shortcuts、variables、plugins 或一致的 layer 控制，就應該儘快加入 config file。

<<< @/.examples/zh-TW/getting-started/pika.config.ts

## 會產生哪些檔案

Integration 可能會產生：

- `pika.gen.ts`，用於 autocomplete 與型別擴充。
- `pika.gen.css`，也就是磁碟上的產生 CSS 輸出檔。
- virtual module `pika.css`，它會在 build-time 解析成產生的 CSS。

在編輯任何看起來像是自動建立的內容之前，先讀 [Generated Files](/zh-TW/guide/generated-files)。

## Next

- [First Pika](/zh-TW/getting-started/first-pika)
- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Zero Config](/zh-TW/getting-started/zero-config)
- [Vite](/zh-TW/integrations/vite)

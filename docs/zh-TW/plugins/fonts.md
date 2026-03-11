# Fonts

`@pikacss/plugin-fonts` 讓 hosted fonts、local `@font-face` 定義，以及語意化 font tokens 都能進入和其他 PikaCSS configuration 一樣的 build-time workflow。

## 什麼時候該用它

當你想要下面這些能力時，就用 fonts plugin：

- 用 provider 驅動的方式匯入 web fonts，而不是手動維護 URL
- 使用像 `sans`、`mono`、`display` 這類會變成可重用 utilities 的語意化 tokens
- 用同一份 config 管 hosted fonts 與 local `@font-face` families
- 為 provider-specific options 與 custom provider definitions 保留擴充空間

## Install

::: code-group
<<< @/.examples/zh-TW/plugins/fonts-install.sh [pnpm]
<<< @/.examples/zh-TW/plugins/fonts-install-npm.sh [npm]
<<< @/.examples/zh-TW/plugins/fonts-install-yarn.sh [yarn]
:::

## 最小設定

<<< @/.examples/zh-TW/plugins/fonts-basic-config.ts

每個 token 都會同時產生 `font-{token}` shortcut 與對應的 `--pk-font-{token}` CSS variable。

## Provider-specific options

Google Fonts 是預設 provider，而 Bunny、Fontshare 與 Coollabs 也都已經內建。

當某個 provider 需要自己的 query 參數時，應該透過 `providerOptions` 傳入，而不是把 URL 組裝邏輯直接寫死在 config 裡。

<<< @/.examples/zh-TW/plugins/fonts-provider-options.ts

## Custom providers

v2 provider interface 讓你可以註冊自己的 import builder，同時沿用同一套 token model 與產生出的 utilities。

<<< @/.examples/zh-TW/plugins/fonts-custom-provider.ts

## 手動 `@font-face` 與本地檔案

如果字體檔已經放在你的專案或 CDN 上，就直接定義 `faces`，再把它們映射到語意化 family tokens。

<<< @/.examples/zh-TW/plugins/fonts-font-face.ts

## Next

- [Typography](/zh-TW/plugins/typography)
- [Configuration](/zh-TW/guide/configuration)
- [Theming And Variables](/zh-TW/patterns/theming-and-variables)
- [Create A Plugin](/zh-TW/plugin-system/create-plugin)

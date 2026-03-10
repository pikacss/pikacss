# Vite

即使你的最終目標是其他相容 unplugin 的 bundler，Vite 仍然是最容易理解 PikaCSS integration model 的方式。

## Install

::: code-group
<<< @/.examples/zh-TW/integrations/vite-install.sh [pnpm]
<<< @/.examples/zh-TW/integrations/vite-install-npm.sh [npm]
<<< @/.examples/zh-TW/integrations/vite-install-yarn.sh [yarn]
:::

## 最小設定

<<< @/.examples/zh-TW/integrations/vite-basic-config.ts

<<< @/.examples/zh-TW/integrations/import-pika-css.ts

## Inline config 與 config file

Inline config 只適合非常小的設定或實驗。

<<< @/.examples/zh-TW/integrations/vite-inline-config.ts

對大多數應用程式來說，應該優先使用獨立的 `pika.config.ts`，讓 selectors、shortcuts、variables 與 plugins 有一個穩定的歸屬。

## 實用 options

<<< @/.examples/zh-TW/integrations/vite-all-options.ts

## 一開始應該先驗證什麼

1. `pika.css` 是否已在 app entry 中匯入。
2. Plugin 是否已在 `vite.config.ts` 中註冊。
3. 你的 `pika()` 輸入是否是靜態的。
4. Generated files 是否出現在你預期的位置。

## Next

- [First Pika](/zh-TW/getting-started/first-pika)
- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Generated Files](/zh-TW/guide/generated-files)
- [ESLint](/zh-TW/integrations/eslint)

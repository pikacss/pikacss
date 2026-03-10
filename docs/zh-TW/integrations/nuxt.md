# Nuxt

Nuxt 有自己的 PikaCSS module 路徑，但核心規則仍然一樣：匯入產生的 CSS entry、保持 style 輸入靜態，並把可重用模式移進 config。

## Install

::: code-group
<<< @/.examples/zh-TW/integrations/install-nuxt.sh [pnpm]
<<< @/.examples/zh-TW/integrations/install-nuxt-npm.sh [npm]
<<< @/.examples/zh-TW/integrations/install-nuxt-yarn.sh [yarn]
:::

## 最小設定

<<< @/.examples/zh-TW/integrations/nuxt.config.ts

## 什麼時候要自訂 scanning

如果你的專案有非標準的原始碼位置，請刻意自訂 scanning，不要假設 Nuxt module defaults 會自動找出所有東西。

<<< @/.examples/zh-TW/integrations/nuxt.config.scan-all.ts

## 通常哪裡會出錯

- 缺少 CSS entry import
- styles 寫在 scan patterns 之外的檔案
- 在 `pika()` 裡放了 runtime expressions
- 以為 zero-config 足以涵蓋所有團隊慣例

## Next

- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Integrations Overview](/zh-TW/integrations/overview)
- [Generated Files](/zh-TW/guide/generated-files)
- [Common Problems](/zh-TW/troubleshooting/common-problems)

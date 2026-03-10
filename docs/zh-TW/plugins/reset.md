# Reset

`@pikacss/plugin-reset` 讓你可以在不離開 PikaCSS configuration model 的情況下，以 build-time 方式建立 CSS reset baseline。

## 什麼時候該用它

當你想替整個專案或 design system 建立一套共享的 element defaults baseline 時，就使用 reset plugin。

## Install

::: code-group
<<< @/.examples/zh-TW/plugins/reset-install.sh [pnpm]
<<< @/.examples/zh-TW/plugins/reset-install-npm.sh [npm]
<<< @/.examples/zh-TW/plugins/reset-install-yarn.sh [yarn]
:::

## 最小設定

<<< @/.examples/zh-TW/plugins/reset-basic-usage.ts

## 可用 presets

<<< @/.examples/zh-TW/plugins/reset-all-presets.ts

## Reset 什麼時候有幫助，什麼時候反而有害

如果你希望早點把瀏覽器 defaults 統一起來，reset 會很有幫助。反過來說，若專案本來就已經有一套清楚而刻意的 baseline，reset 反而可能只是多添一層意外。

::: warning 不要把專案 styling 問題藏在 reset 後面
Reset 應該只負責標準化 defaults。它不應該變成把不相關的 typography、spacing 與 component 決策全都累積進去的地方。
:::

## 自訂 preset 範例

<<< @/.examples/zh-TW/plugins/reset-custom-preset.ts

## Next

- [Typography](/zh-TW/plugins/typography)
- [Configuration](/zh-TW/guide/configuration)
- [Create A Plugin](/zh-TW/plugin-system/create-plugin)
- [Common Problems](/zh-TW/troubleshooting/common-problems)

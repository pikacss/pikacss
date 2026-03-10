# Typography

`@pikacss/plugin-typography` 適合內容密集的介面，當你想要 prose defaults、可讀節奏，以及以 tokens 驅動的自訂能力，而不想手動替每個 article block 寫樣式時，就該使用它。

## 什麼時候該用它

Typography plugin 適用於：

- docs sites
- blog content
- CMS-rendered article bodies
- 需要一致 prose defaults 的 markdown containers

## Install

::: code-group
<<< @/.examples/zh-TW/plugins/typography-install.sh [pnpm]
<<< @/.examples/zh-TW/plugins/typography-install-npm.sh [npm]
<<< @/.examples/zh-TW/plugins/typography-install-yarn.sh [yarn]
:::

## 最小設定

<<< @/.examples/zh-TW/plugins/typography-basic-config.ts

## Usage

<<< @/.examples/zh-TW/plugins/typography-usage-prose.ts

## 自訂 variables，而不是手動處理每個 element

<<< @/.examples/zh-TW/plugins/typography-custom-variables.ts

當你把 prose 當成一個可調整 tokens 的內容系統，而不是一長串手動 tag overrides，這個 plugin 才最有價值。

## Next

- [Theming And Variables](/zh-TW/patterns/theming-and-variables)
- [Plugin System Overview](/zh-TW/plugin-system/overview)
- [Configuration](/zh-TW/guide/configuration)
- [FAQ](/zh-TW/community/faq)

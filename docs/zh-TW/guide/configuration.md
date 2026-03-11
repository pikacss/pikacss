# Configuration

PikaCSS configuration 有兩個層次，而把它們混在一起，是最容易誤解整個系統的方式之一。

1. Engine config 控制 styles 要怎麼被理解與輸出。
2. Build plugin options 控制 integration 要怎麼尋找、轉換與產生檔案。

## Engine config

凡是會改變 styling 行為的內容，都應該放在 engine config：

- plugins
- autocomplete
- selectors
- shortcuts
- variables
- keyframes
- layers
- preflights
- prefix 與 selector defaults

<<< @/.examples/zh-TW/guide/config-basic.ts

<<< @/.examples/zh-TW/guide/config-full-example.ts

## Custom autocomplete

當你的 app 或 design system 有一組穩定的自訂 style tokens，而且它們不是由 plugin 提供時，就適合用 `autocomplete` 直接補進 engine config。

這些項目會和 built-in 與 external plugin 的 autocomplete 合併，然後寫進產生的 TypeScript types。

<<< @/.examples/zh-TW/guide/config-autocomplete.ts

## Semantic variable autocomplete

當某個 CSS variable 代表的是一種穩定的值類型，而且你希望 PikaCSS 只在對應的 CSS property autocomplete 中提供 `var(--token)` 時，就用 `variables.*.semanticType`。

目前已經有 runtime 展開的 built-in semantic families 包含：

- `color`
- `length`
- `time`
- `number`
- `easing`
- `font-family`

`semanticType` 會先展開成 built-in property 集合，再和你額外指定的 `autocomplete.asValueOf` 做 union，方便處理專案裡的特殊例外。

<<< @/.examples/zh-TW/guide/config-variables-semantic-type.ts

## Built-in plugins 要用頂層 keys 設定

這一點很重要，因為 built-in plugin configuration 並不是放在 `plugins` 裡。

<<< @/.examples/zh-TW/guide/built-in-plugins-config.ts

| Built-in capability | Where to configure it |
| --- | --- |
| variables | `variables` |
| keyframes | `keyframes` |
| selectors | `selectors` |
| shortcuts | `shortcuts` |
| important | `important` |

## External plugins 要放進 `plugins`

<<< @/.examples/zh-TW/guide/config-plugins.ts

::: warning 常見誤解
如果你把官方 external plugins 放進 built-in config keys，什麼有用的事情都不會發生。Built-in plugin config 與 external plugin registration 是兩種不同機制。
:::

## Build plugin options

像是 scanning、config path resolution、generated file locations 與 function name detection 這種 integration 行為，應該放在 build plugin options。

<<< @/.examples/zh-TW/integrations/plugin-options.ts

## Layers、preflights 與順序

對大型系統來說，layer control 很重要，因為它能讓輸出順序變成刻意設計的結果，而不是碰巧如此。

<<< @/.examples/zh-TW/guide/config-layers.ts

<<< @/.examples/zh-TW/guide/config-preflights-with-layer.ts

## Type helpers

PikaCSS 匯出了幾個 identity helpers，用來改善 autocomplete 並清楚表達意圖。

- `defineEngineConfig()`
- `defineStyleDefinition()`
- `defineSelector()`
- `defineShortcut()`
- `defineKeyframes()`
- `defineVariables()`
- `defineEnginePlugin()`

<<< @/.examples/zh-TW/guide/built-ins/style-definition-define-helper.ts

## 大多數團隊應該標準化的內容

- 共享 selectors
- token variables
- shortcut naming
- plugin usage
- layer strategy
- 針對靜態輸入的 ESLint enforcement

## Next

- [Generated Files](/zh-TW/guide/generated-files)
- [Integrations Overview](/zh-TW/integrations/overview)
- [Theming And Variables](/zh-TW/patterns/theming-and-variables)
- [Plugin System Overview](/zh-TW/plugin-system/overview)

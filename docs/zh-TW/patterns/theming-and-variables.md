# Theming And Variables

如果你發現自己在多個 components 裡一直重複寫顏色分支，問題多半是 design tokens，並不是少了什麼 runtime logic。

## 在 config 中定義 variables

<<< @/.examples/zh-TW/guide/config-variables.ts

你也可以把 variable definitions 放在 selectors 之下，替不同主題建立各自的值。

<<< @/.examples/zh-TW/guide/config-variables-transitive.ts

如果某個 token 也屬於穩定的值類型，例如 color 或 length，可以加上 `semanticType`，讓 autocomplete 只出現在對應的 CSS properties，而不是到處都出現。

<<< @/.examples/zh-TW/guide/config-variables-semantic-type.ts

## 在 components 中使用 variables

<<< @/.examples/zh-TW/guide/variables-usage.ts

<<< @/.examples/zh-TW/guide/variables-output.css

如果 variable 的值需要在 runtime 依每個實例變動，請看 [Dynamic Values 與 CSS Variables](/zh-TW/patterns/dynamic-values-with-css-variables)。

## 一個實用的主題化策略

1. 用 selectors 描述 light 或 dark 這類主題情境。
2. 用 variables 承載實際的 token values。
3. 讓 component style definitions 專注在語意化 token 的使用。

比起直接複製一整份深色和淺色的 component objects，這種拆法通常更容易維護。

## 該做與不該做

| 該做 | 不該做 |
| --- | --- |
| 把主題值放進 CSS variables。 | 沒有必要地為每個主題複製整個 component。 |
| 用 selectors 來界定 variable definitions 的範圍。 | 把主題邏輯塞進 runtime object construction。 |
| 讓 component objects 保持語意化。 | 在每個 component 裡把所有 token 都直接寫死。 |

## Next

- [Dynamic Values 與 CSS Variables](/zh-TW/patterns/dynamic-values-with-css-variables)
- [Configuration](/zh-TW/guide/configuration)
- [Plugins: Typography](/zh-TW/plugins/typography)
- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Common Problems](/zh-TW/troubleshooting/common-problems)

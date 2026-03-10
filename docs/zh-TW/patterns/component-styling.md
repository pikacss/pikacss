# Component Styling

最可靠的 PikaCSS components，通常都建立在小而靜態的 layers 上。

## 從組合開始，不要從條件分支開始

Base styles、variant styles 和局部 overrides，多半都應該拆成不同的 arguments。

<<< @/.examples/zh-TW/getting-started/first-pika-multiple-args.vue

這種模式之所以好擴展，是因為每一層都有清楚而穩定的角色：

- base styles 定義結構
- variant styles 定義意圖
- 局部 overrides 解決一次性的版面或情境需求

## 把共享 recipes 放進 shortcuts

如果同一組 style bundle 反覆出現在多個 components 裡，就把它抽進 shortcut，不要在每個檔案裡重複貼上一大段 object。

<<< @/.examples/zh-TW/guide/shortcuts-config.ts

<<< @/.examples/zh-TW/guide/shortcuts-usage.ts

<<< @/.examples/zh-TW/guide/shortcuts-output.css

## 優先使用明確的 variants

像 `primary`、`secondary`、`danger` 或 `compact` 這類 component states，最好先定義成各自獨立的靜態 style blocks，再在 runtime 決定要用哪一個。

::: tip 良好的 runtime 用法
Runtime code 應該只負責決定要用哪個靜態 class string，不應該自己去組 style 內容。
:::

## 建議的 review 清單

| 詢問這件事 | 為什麼重要 |
| --- | --- |
| 這段重複區塊能不能整理成 shortcut？ | 這樣可以減少重複，也讓意圖更清楚。 |
| 這個 variant 是否穩定到值得命名？ | 有名字的 variants 通常比臨時 overrides 更好 review。 |
| 這個主題資料其實是不是 CSS variable 問題？ | Variables 通常比一堆重複的顏色分支更耐用。 |
| 這個局部 override 仍然是靜態的嗎？ | 如果不是，build-time 模型遲早會跟你衝突。 |

## 該做與不該做

| 該做 | 不該做 |
| --- | --- |
| 組合 `pika(base, primary, localOverride)`。 | 把所有可能分支都塞進同一個 inline expression。 |
| 把共享 recipes 收進 shortcuts。 | 在不同檔案裡複製同一個 12 行 object。 |
| 讓 variants 穩定而且有名字。 | 每個 component 都重新發明一套 dynamic shape 規則。 |

## Next

- [Responsive And Selectors](/zh-TW/patterns/responsive-and-selectors)
- [Theming And Variables](/zh-TW/patterns/theming-and-variables)
- [Configuration](/zh-TW/guide/configuration)
- [Static Arguments](/zh-TW/getting-started/static-arguments)

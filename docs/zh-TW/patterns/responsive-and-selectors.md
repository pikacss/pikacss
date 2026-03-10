# Responsive And Selectors

Selectors 是 PikaCSS 從小工具走向系統化的重要分水嶺。你可以把 states、主題與 breakpoints 先定義好，之後在任何地方重複使用。

## 在 config 中定義 selectors

<<< @/.examples/zh-TW/guide/selectors-config.ts

## 在 style definitions 中使用它們

<<< @/.examples/zh-TW/guide/selectors-usage.ts

<<< @/.examples/zh-TW/guide/selectors-output.css

## 讓 responsive naming 保持樸素

Selectors 的命名應該一眼就看得懂，也要容易記。請優先使用專案共用的 aliases，例如 `screen-sm`、`screen-md`、`screen-lg`，不要把一次性的 media query strings 散落在各個 component 檔案裡。

## 巢狀 selectors 仍然是靜態的

巢狀 selector blocks 仍然符合 build-time 模型，因為它們的結構在原始碼裡就是明確寫死的。

<<< @/.examples/zh-TW/getting-started/first-pika-nested.vue

## 建議模式

- 把 breakpoint aliases 放在 config，不要放在各個 components 裡。
- 讓 selector names 在團隊層級具備足夠語意，值得重用。
- 用 selectors 表達狀態結構，用 variables 表達值的變化。
- 當 selector-driven 的模式在多個 components 中反覆出現時，就把它收進 shortcuts。

::: warning 不要讓 selectors 過度承載
如果一個 selector name 把太多互不相干的規則都包在一起，review 會變難，局部 overrides 也會跟著失去可預測性。Selector alias 應該描述一個穩定條件，而不是整個 component contract。
:::

## Next

- [Theming And Variables](/zh-TW/patterns/theming-and-variables)
- [Configuration](/zh-TW/guide/configuration)
- [Component Styling](/zh-TW/patterns/component-styling)
- [Plugins: Typography](/zh-TW/plugins/typography)

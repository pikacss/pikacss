# First Pika

這一頁的目標很簡單：先讓 `pika()` 成功跑通一次，看看輸出會長什麼樣子，也順便理解 engine 幫你做了哪些轉換。

## Entry 設定

先在應用程式的 entry 匯入 virtual CSS module：

<<< @/.examples/zh-TW/getting-started/first-pika-entry.ts

## 最小 style definition

下面是最小但已經實用的 `pika()` 呼叫：

<<< @/.examples/zh-TW/getting-started/first-pika-basic.ts

如果你使用的是 Vue，同樣的概念可以寫成這樣：

<<< @/.examples/zh-TW/getting-started/first-pika-basic.vue

## 輸出最後會變成什麼

PikaCSS 不會在 runtime 保留這個 object。它會把這段呼叫轉成 atomic class names，並在 build 期間產生 CSS。

<<< @/.examples/zh-TW/getting-started/first-pika-output.css

## 多個 arguments 很正常

你可以用多個 `pika()` arguments，把穩定的 base styles 和局部 overrides 分開。

<<< @/.examples/zh-TW/getting-started/first-pika-multiple-args.vue

這種組合方式比把所有東西塞進同一個巨大 object 更容易維護，也更容易擴展。

## String 與 array variants

請選擇最符合你的 framework 與呼叫方式的輸出形式。

<<< @/.examples/zh-TW/getting-started/first-pika-variants.ts

## 巢狀 selectors 本來就是模型的一部分

要加 pseudo states 或 at-rules 時，不需要跳出 style object 另外寫。

<<< @/.examples/zh-TW/getting-started/first-pika-nested.vue

<<< @/.examples/zh-TW/getting-started/first-pika-nested-output.css

## 該做與不該做

| 該做 | 不該做 |
| --- | --- |
| 先從字面值 objects 和簡單組合開始。 | 一開始就塞進 dynamic expressions，之後再回頭 debug build 失敗。 |
| 至少檢查一次產生的 CSS，讓整個模型更具體。 | 把 `pika()` 當成會讀取目前 state 的 runtime helper。 |
| 用多個 arguments 分開 base styles 和 overrides。 | 把每個 variant 分支都塞進同一個超大的 style object。 |

## Next

- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [How PikaCSS Works](/zh-TW/concepts/how-pikacss-works)
- [Component Styling](/zh-TW/patterns/component-styling)
- [Generated Files](/zh-TW/guide/generated-files)

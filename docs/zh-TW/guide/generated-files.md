# Generated Files

PikaCSS 會刻意產生一些 generated artifacts。先搞清楚它們各自代表什麼，才不會把 generated output 誤認成需要手動維護的 source。

## `pika.css`

`pika.css` 是一個 virtual module。你會在 app entry 匯入它，但不會直接編輯它。

<<< @/.examples/zh-TW/integrations/import-pika-css.ts

## `pika.gen.ts`

這個檔案提供產生的 typing 與 autocomplete 支援。它可能會擴充全域 `pika()` 函式，以及來自 engine config 或 plugins 的 selectors、shortcuts、variables 與其他 tokens。

## `pika.gen.css`

這個檔案就是 integration 寫到磁碟上的產生 CSS。

::: warning 不要編輯 generated files
你對 generated files 做的修改都會被覆蓋。如果輸出不對，應該回頭修 source style definition、engine config 或 integration 設定。
:::

## 什麼時候 generated files 很有用

Generated files 很適合拿來除錯：

- 確認某個 `pika()` 呼叫是否真的被轉換
- 檢查輸出了哪些 selectors 或 declarations
- 驗證 autocomplete 是否包含預期的 engine config 與 plugin 資料

## 什麼時候 generated files 不是答案

- 它們不是拿來自訂 design tokens 的地方。
- 它們不是拿來修 broken selectors 的地方。
- 它們不是拿來加入 preflights 或 plugins 的地方。

這些調整都應該回到 config 或 source 去做。

## Next

- [How PikaCSS Works](/zh-TW/concepts/how-pikacss-works)
- [Configuration](/zh-TW/guide/configuration)
- [Common Problems](/zh-TW/troubleshooting/common-problems)
- [Vite](/zh-TW/integrations/vite)

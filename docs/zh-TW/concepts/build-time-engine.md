# Build-time Engine

只要記住一條規則，PikaCSS 就不難理解：styling engine 跑在 build 過程，不是在瀏覽器裡執行。

## Zero runtime overhead 的意思就是字面上的意思

經過轉換後，正式環境的 bundle 裡只會留下靜態 class names 和產生的 CSS。頁面載入時，不會再有用戶端 styling engine 去解析 objects。

<<< @/.examples/zh-TW/principles/zero-source.ts

<<< @/.examples/zh-TW/principles/zero-compiled.ts

<<< @/.examples/zh-TW/principles/zero-generated.css

## 為什麼 engine 需要靜態輸入

build-time 架構帶來了幾個直接的好處：

- deterministic output
- atomic deduplication
- generated autocomplete
- 由 plugin 控制的 config resolution

但相對地，你也得用靜態的方式來表達變化，例如 variants、selectors、shortcuts 與 variables。

## Virtual modules 與 generated files

`pika.css` 這個 import 是一個 virtual module。它會在 build-time 解析成產生的 CSS。在磁碟上，integration 也可能寫出像是 `pika.gen.ts` 與 `pika.gen.css` 這樣的檔案。

在把任何 generated artifacts 當成 source code 之前，建議先讀 [Generated Files](/zh-TW/guide/generated-files)。

## 正確的設計問題

不要問：「我要怎麼讓 `pika()` 接受這個 runtime value？」

要問的是：「我的專案應該用哪一種靜態表示法來編碼這個 styling 問題？」

很多時候，只要換成這個角度思考，最後得到的設計也會更好。

## Next

- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Generated Files](/zh-TW/guide/generated-files)
- [Responsive And Selectors](/zh-TW/patterns/responsive-and-selectors)
- [Theming And Variables](/zh-TW/patterns/theming-and-variables)

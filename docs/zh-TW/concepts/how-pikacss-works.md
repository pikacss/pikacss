# How PikaCSS Works

從整體流程來看，PikaCSS 會把可靜態分析的 style 輸入轉成產生的 atomic CSS。

## Source input

你會在支援的檔案中寫 `pika()` 呼叫：

<<< @/.examples/zh-TW/principles/build-source.ts

## Build-time transform

Integration 會掃描原始碼檔案，抽出 style 輸入，再把它轉成 atomic class names。

<<< @/.examples/zh-TW/principles/build-compiled.ts

## Generated CSS

這些 class names 會對應到產生的 CSS declarations：

<<< @/.examples/zh-TW/principles/build-generated.css

## 為什麼這裡的 atomic output 很重要

PikaCSS 不會把每個 component block 都壓成單一 class。它會把 style 內容拆成可重用的 atomic declarations。當同一個 declaration 再次出現時，engine 就能直接重用原本的 atomic class。

<<< @/.examples/zh-TW/principles/build-dedup-source.ts

<<< @/.examples/zh-TW/principles/build-dedup-output.css

## PikaCSS 比許多 atomic systems 更謹慎的地方

重用並不總是安全的。

當兩個 declarations 在效果上彼此重疊時，真正決定結果的是 stylesheet 的順序，不是 markup 裡 token 的順序。PikaCSS 會偵測這些衝突，讓後續重疊的 declarations 對順序保持敏感，而不是盲目重用全域 cached class。

完整說明請讀 [Atomic Order And Cascade](/zh-TW/concepts/atomic-order-and-cascade)。

## plugins 改變的是什麼

Plugins 可以修改 config，也能擴充 selectors、shortcuts、variables、keyframes、autocomplete 與 preflights。它們會在抽取前與抽取過程中，改變 engine 能理解的內容。

也因為這樣，PikaCSS 才能對終端使用者保持精簡，同時又支援更豐富的 ecosystem。

## 哪些東西不會留在 runtime

應用程式 runtime 拿到的是 class names 與 CSS files，而不是一個會在瀏覽器裡持續解讀 objects 的 styling engine。

## Next

- [Atomic Order And Cascade](/zh-TW/concepts/atomic-order-and-cascade)
- [Build-time Engine](/zh-TW/concepts/build-time-engine)
- [Generated Files](/zh-TW/guide/generated-files)
- [Plugin System Overview](/zh-TW/plugin-system/overview)
- [Common Problems](/zh-TW/troubleshooting/common-problems)

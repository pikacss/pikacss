# FAQ

## `pika()` 是 runtime function 嗎？

不是。它是 build-time 輸入。這個呼叫會在 build 期間被掃描並轉換。

## 為什麼 static arguments 這麼重要？

因為靜態輸入正是 PikaCSS 能產生 deterministic atomic CSS、去重 declarations，並提供 generated autocomplete 的前提。

請參考 [Static Arguments](/zh-TW/getting-started/static-arguments)。

## PikaCSS 只是另一個 utility CSS framework 嗎？

不是。輸出雖然是 atomic CSS，但 authoring model 是以 style definitions 為基礎。你撰寫的是 style objects 與 plugin-driven config，而不只是預先定義的 utility class tokens。

<<< @/.examples/zh-TW/community/faq-atomic-input.ts

<<< @/.examples/zh-TW/community/faq-atomic-output.css

## Class token 順序會決定最終結果嗎？

不會只靠它自己決定。

當 atomic declarations 的 specificity 相同時，瀏覽器仍然會依照 stylesheet 裡 declaration 的順序來解決衝突。這也是許多 atomic systems 在遇到重疊 utilities 時，結果常常不如預期的原因。

PikaCSS 會偵測重疊的 property effects，讓後續重疊 declarations 對順序保持敏感；也因此，在真正會影響 cascade 的地方，局部 author 順序依然有意義。

請參考 [Atomic Order And Cascade](/zh-TW/concepts/atomic-order-and-cascade)。

## 我可以使用巢狀 selectors 嗎？

可以。巢狀 selectors 一直都是 style-definition model 的一部分。

<<< @/.examples/zh-TW/community/faq-nested.ts

## 我應該永遠維持 zero-config 嗎？

通常不應該。Zero-config 是快速起步的方式。真實專案應該把 selectors、variables、shortcuts 與 plugin usage 集中到 config 中。

## 我該編輯 `pika.gen.ts` 或 `pika.gen.css` 嗎？

不該。Generated files 是輸出 artifacts。請改 config 或 source。

## 什麼時候該使用 ESLint integration？

越早越好。它可以避免 invalid runtime-style 習慣在 codebase 中擴散。

## Next

- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Common Problems](/zh-TW/troubleshooting/common-problems)
- [Configuration](/zh-TW/guide/configuration)
- [Plugin System Overview](/zh-TW/plugin-system/overview)

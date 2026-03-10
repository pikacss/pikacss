# Atomic Order And Cascade

Atomic CSS 有一個很常見的陷阱：markup 裡 class tokens 的順序，並不會直接決定最後結果。

瀏覽器在處理衝突時，比的是 stylesheet 裡產生的 CSS declarations。當兩個 atomic declarations 的 specificity 相同時，較晚出現在 CSS 裡的 declaration 會獲勝。

## 常見的 atomic 排序問題

如果你使用過 UnoCSS 或 TailwindCSS 這類 utility-first 工作流，應該見過這個問題。

<<< @/.examples/zh-TW/principles/order-class-order-problem.tsx

上面兩個元素，最後仍然可能指向同一批共享的全域 declarations：

<<< @/.examples/zh-TW/principles/order-class-order-problem.css

也就是說，兩個元素最終吃到的是同一套 stylesheet 順序，不會因為 `class` attribute 裡 token 的順序不同而改變。

如果 `.pl-2` 在 `.px-4` 之後輸出，兩個元素最後都會得到 `padding-left: 0.5rem`。

如果 `.px-4` 在 `.pl-2` 之後輸出，兩個元素最後都會得到 `padding-left: 1rem`。

Markup 改了，cascade 卻沒跟著改。

## 為什麼會這樣

Atomic systems 會盡量在所有地方重用同一個 declaration。

這種重用對輸出大小很有幫助，但也帶來一個現實限制：一旦某個共享 declaration 已經存在於全域 stylesheet，後面的 component 就不能只靠 token 順序去改變它在 cascade 裡的作用方式。

當 declarations 在效果上彼此重疊時，這個問題就會浮現，例如：

- `padding` 與 `padding-left` 這種 shorthand 與 longhand 組合
- `background-color` 與 `background` 這種 aggregate family
- `overflow-x` 與 `overflow` 這種 patched shorthand family
- `all` 與任何後續 property 組合的 universal reset

## PikaCSS 有什麼不同

PikaCSS 依然會去重一般的 atomic declarations，但它把「效果重疊」當成需要正面處理的問題。

當 engine 發現同一個 selector scope 裡，後面的 declaration 可能改變前面 declaration 的實際結果時，它會把這個後續 declaration 標記成對順序敏感，而不是去重用全域快取 class。

換句話說，真正重要的地方，author 順序還是會被保留下來。

<<< @/.examples/zh-TW/principles/order-pika-overlap.ts

<<< @/.examples/zh-TW/principles/order-pika-overlap.css

在這個例子裡，`padding-left: 8px` 會刻意出現兩次。

第二個 `padding-left` 不會重用第一個 component 的 class，因為一旦重用，它就會和前面緊鄰的 `padding: 24px` 脫鉤。PikaCSS 會保留一個新的 atomic class，確保後續的重疊關係仍然按照正確的局部順序生效。

## 核心取捨

PikaCSS 不會為了解決 cascade 問題，就乾脆把 deduplication 全域關掉。

只有那些在效果上彼此重疊的後續 declarations 會變成對順序敏感。無關的 declarations 仍然會在整個專案中重用同一個 atomic class。

這讓 PikaCSS 取得一個更實用的平衡：

- 對重疊 declarations 保持可預測的 cascade
- 對無關 declarations 保持一般的 atomic reuse
- 不需要人工推理全域 utility 的輸出順序

## 這對真實專案代表什麼

你可以照著最能表達意圖的順序撰寫 style definitions，並信任 engine 在 property effects 重疊時仍會保留這個意圖。

你還是得思考一般 CSS 規則，例如 specificity、selector 形狀與 layers。PikaCSS 不是要繞過 cascade，而是讓 atomic generation 和 cascade 好好配合，不要彼此打架。

## 什麼情況下最重要

這個行為在以下專案中尤其重要：

- 混用 shorthand 與 longhand declarations 的 component variants
- 會展開成重疊 CSS families 的 plugin-generated declarations
- 使用 `all` 的 reset 模式
- 期待後續 author intent 保持局部且可預測的團隊

## Next

- [How PikaCSS Works](/zh-TW/concepts/how-pikacss-works)
- [Build-time Engine](/zh-TW/concepts/build-time-engine)
- [Configuration](/zh-TW/guide/configuration)
- [Common Problems](/zh-TW/troubleshooting/common-problems)

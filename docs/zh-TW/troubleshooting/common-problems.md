# Common Problems

當 PikaCSS 的輸出看起來不對時，問題通常都落在少數幾種常見誤解裡。

## `pika()` 沒有產生我預期的內容

先檢查下面幾點：

1. 檔案是否包含在 scan patterns 中？
2. `pika.css` 是否已匯入？
3. Style 輸入是否是靜態的？
4. 你是否有檢查 generated CSS 或 generated typings？

## 我在 `pika()` 裡用了 runtime values

這是最常見的問題。

<<< @/.examples/zh-TW/community/faq-static-bad.ts

請改用預先宣告的 variants、selectors、shortcuts 或 variables。

如果你想傳的是每個實例各自不同的 runtime 值，請改用 CSS variables，並參考 [Dynamic Values 與 CSS Variables](/zh-TW/patterns/dynamic-values-with-css-variables) 內的綁定方式。

<<< @/.examples/zh-TW/community/faq-static-ok.ts

## 我編輯了 generated files，但修改消失了

這是預期行為。Generated files 是輸出 artifacts，不是 source files。你應該修正 source 呼叫、config 或 integration 設定。

## 我加了 plugin，但什麼都沒變

請確認你是在設定 built-in capability，還是在註冊 external plugin。它們有不同的設定入口。

## 我的主題邏輯感覺很重複

這通常代表你應該把 token values 移進 variables，並把主題情境移進 selectors。

## Build 能跑，但團隊用法開始偏掉

請加入 ESLint integration，並在 config 層級統一 selectors、variables 與 shortcuts。PikaCSS 只有在專案慣例集中化時，才容易維持可維護性。

## Next

- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Dynamic Values 與 CSS Variables](/zh-TW/patterns/dynamic-values-with-css-variables)
- [Generated Files](/zh-TW/guide/generated-files)
- [ESLint](/zh-TW/integrations/eslint)
- [FAQ](/zh-TW/community/faq)

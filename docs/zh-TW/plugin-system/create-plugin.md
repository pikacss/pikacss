# Create A Plugin

要寫出一個好的 PikaCSS plugin，最簡單的方式就是從單一、明確的責任開始。

好的第一個 plugin，通常會做下面其中一件事：

- 註冊 selectors
- 註冊 shortcuts
- 註冊 variables
- 加入 preflights
- 擴充 autocomplete

## 最小 plugin factory

<<< @/.examples/zh-TW/plugin-system/minimal-plugin.ts

如果你需要 options，請匯出 factory function，而不是 singleton plugin object。

<<< @/.examples/zh-TW/plugin-system/plugin-with-options.ts

## 第一個 plugin 最有用的 hook

大多數第一個 plugin，都應該從 `configureEngine` 開始。

<<< @/.examples/zh-TW/plugin-system/hook-configure-engine.ts

這個 hook 會讓你接觸到 selectors、shortcuts、variables、keyframes、preflights 與 autocomplete 的公開 engine APIs。

把 `engine.appendAutocomplete()` 當成唯一的 autocomplete 寫入 API。selectors、style item strings、extra properties、CSS property values 與 template-literal patterns，都應該透過同一個 payload 加進去，而不是再分散呼叫不同 bucket 的 helper。

<<< @/.examples/zh-TW/plugin-system/autocomplete-api.ts

## 什麼時候該用其他 hooks

- 在 resolution 前加入或調整 config 時，使用 `configureRawConfig`
- 要對 resolved defaults 做出反應時，使用 `configureResolvedConfig`
- 只有在 engine APIs 不夠用時，才使用 transform hooks

<<< @/.examples/zh-TW/plugin-system/hook-configure-raw-config.ts

<<< @/.examples/zh-TW/plugin-system/hook-configure-resolved-config.ts

## 為終端使用者補上型別

官方 plugins 之所以看起來像一等公民，是因為它們會擴充 `EngineConfig` 與 autocomplete types。

<<< @/.examples/zh-TW/plugin-system/module-augmentation.ts

<<< @/.examples/zh-TW/plugin-system/use-plugin-in-config.ts

## Preflights 既強大又是全域性的

把 preflights 用在 resets、defaults，或共享的全域 rules。因為它們會影響整體 CSS 輸出，所以必須保持範圍清楚、意圖明確。

<<< @/.examples/zh-TW/plugin-system/preflight-definition.ts

<<< @/.examples/zh-TW/plugin-system/preflight-with-layer.ts

<<< @/.examples/zh-TW/plugin-system/preflight-with-id.ts

## 參考實作

- reset 展示了 config manipulation 加上 preflights
- typography 展示了 tokens 與面向內容的 shortcuts
- icons 展示了更進階的 integration pattern

## Next

- [Hook Execution](/zh-TW/plugin-system/hook-execution)
- [Icons](/zh-TW/plugins/icons)
- [Reset](/zh-TW/plugins/reset)
- [Typography](/zh-TW/plugins/typography)

# Plugin System Overview

PikaCSS plugins 是擴充 engine 的公開方式。它們讓你在不 fork core behavior 的前提下，調整 config、加入 selectors、variables、shortcuts、keyframes、preflights、autocomplete 與 style transforms。

## 這個章節適合誰

這個章節不是一般使用者採用路徑的一部分。當你想做下面這些事時，再來讀它：

- 建立自己的 plugin
- 理解官方 plugins 如何運作
- 貢獻給 core 的公開 extension points

## 什麼是 engine plugin

Plugins 是用 `defineEnginePlugin()` 建立的普通 objects。

<<< @/.examples/zh-TW/plugin-system/overview-minimal-plugin.ts

完整介面會包含 `name`、可選的 `order`，以及可選的 lifecycle hooks。

<<< @/.examples/zh-TW/plugin-system/overview-engine-plugin-interface.ts

## 用一句話理解 plugin lifecycle

Plugins 可以影響 raw config、resolved config、engine setup、style-item transforms、selector transforms、style-definition transforms，以及數個通知節點。

## 怎麼看待 hooks

- 當你需要在 resolution 之前修改 user config，請用 `configureRawConfig`
- 當你需要先讓 defaults 穩定下來，再處理事情，請用 `configureResolvedConfig`
- 當你想呼叫 `engine.selectors.add()` 或 `engine.addPreflight()` 這類 engine APIs，請用 `configureEngine`
- 當你需要改寫 style processing 本身時，才使用 transform hooks
- 當你只是需要觀察變化時，才使用 notification hooks

## 排序規則

Plugins 會依照 `pre`、預設、再到 `post` 的順序執行。

<<< @/.examples/zh-TW/plugin-system/overview-plugin-order.ts

Built-in plugins 會先於 user plugins 執行，所以 `order` 只能控制你相對於其他 user plugins 的位置，無法把你排到 core internals 前面。

## Plugin authors 一開始就該知道的事

1. Built-in plugin config 與 external plugins 是兩套不同機制。
2. 像 selectors 與 shortcuts 這種由 resolver 支撐的功能，本來就已經暴露了 engine APIs。
3. Preflights 與 layers 很有用，但它們會影響全域輸出，必須謹慎使用。
4. Module augmentation 會直接改變使用者看到的 TypeScript 體驗，因此應該保持有意識。

## 建議學習路徑

1. 先從 [Create A Plugin](/zh-TW/plugin-system/create-plugin) 開始。
2. 接著閱讀 [Hook Execution](/zh-TW/plugin-system/hook-execution)。
3. 把官方 plugins 當成參考實作。

## Next

- [Create A Plugin](/zh-TW/plugin-system/create-plugin)
- [Hook Execution](/zh-TW/plugin-system/hook-execution)
- [Built-in Plugins](/zh-TW/guide/built-in-plugins)
- [Contributor Architecture](/zh-TW/contributors/architecture)

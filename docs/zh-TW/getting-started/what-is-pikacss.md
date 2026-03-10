# What Is PikaCSS?

PikaCSS 是一個 build-time atomic CSS-in-JS engine。你在 JavaScript 或 TypeScript 中撰寫 style definitions，integration 會掃描支援的檔案找出 `pika()` 呼叫，並在 build 時把這些呼叫轉換成 class names 與產生的 CSS 檔案。

這讓 PikaCSS 很適合這類團隊：

- 想要 CSS-in-JS 寫法，但不承擔 runtime styling 成本。
- 想為 style definitions 與 plugin 定義的 tokens 取得完整 TypeScript autocomplete。
- 想在同一套寫法裡重複使用 selectors、shortcuts、variables 與 keyframes。
- 想得到可檢查、可作為 generated files 觀察的可預測 CSS 輸出。

如果你的 design system 仰賴在 styling calls 中放入任意 runtime expressions，那它就不適合你。PikaCSS 的立場很明確：輸入必須能被靜態分析，因為這個 engine 在 build-time 運作。

::: tip PikaCSS 最擅長的情境
當 styles 可以直接從原始碼結構推導出來時，PikaCSS 最能發揮價值，例如 component variants、responsive rules、theme selectors、design tokens 與可重用的 shortcuts。
:::

## 核心概念

PikaCSS 有三件事做得很好：

1. 它把 `pika()` 視為 build 輸入，而不是 runtime logic。
2. 它會把 style definitions 拆成 atomic declarations，並加以去重。
3. 它為 selectors、shortcuts、variables、keyframes、preflights 與 plugins 保留公開的 extension points。

<<< @/.examples/zh-TW/getting-started/pika-basic-usage.ts

## 它有什麼不同

多數 CSS-in-JS 工具優先追求 runtime 彈性，多數 utility-first 工具則優先追求預先宣告的 tokens。PikaCSS 站在不同的位置：

- 你仍然直接撰寫 style objects。
- 最終應用程式會帶出靜態 CSS，而不是 runtime style injection。
- 你可以透過 plugin hooks 擴充 engine，不必把所有工作流程都硬套進 utility class 的慣例裡。

## 它不保證什麼

PikaCSS 不保證任何合法的 JavaScript expression 都能成為 style 輸入。對於無法事先分析的 expressions，engine 無法安全地最佳化。

::: warning 不要用 runtime API 的角度評估 PikaCSS
如果你用 dynamic function calls、mutable state、依賴 runtime 資料的 ternaries，或是在 `pika()` 裡使用 computed member access 來評估 PikaCSS，你測試的是錯的模型。
:::

## 你實際上會用到的內建能力

- Variables，用來處理 theme tokens 與有範圍的 custom properties。
- Selectors，用來處理 pseudo states、media queries 與自訂 aliases。
- Shortcuts，用來重用 style bundles。
- Keyframes，用來註冊 animations 並提供 autocomplete。
- Preflights 與 layers，用來管理全域與有順序的 CSS。

## 接下來該讀什麼

- 新採用的團隊請接著看 [Installation](/zh-TW/getting-started/installation)。
- 正在評估取捨的團隊，應在完成安裝後立刻閱讀 [Static Arguments](/zh-TW/getting-started/static-arguments)。
- Plugin authors 可以直接跳到 [Plugin System Overview](/zh-TW/plugin-system/overview)。

## Next

- [Installation](/zh-TW/getting-started/installation)
- [First Pika](/zh-TW/getting-started/first-pika)
- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [How PikaCSS Works](/zh-TW/concepts/how-pikacss-works)

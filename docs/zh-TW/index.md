---
layout: home

hero:
  name: PikaCSS
  text: Build-time atomic CSS-in-JS，但寫法依然貼近 CSS
  tagline: 用熟悉的 style objects 撰寫樣式，拿到完整的 TypeScript autocomplete、產生靜態 CSS，還能讓彼此重疊的 atomic declarations 保持可預測，不必把結果交給全域 utility 順序碰運氣。
  image:
    src: /logo-white.svg
    alt: PikaCSS logo
  actions:
    - theme: brand
      text: 從這裡開始
      link: /zh-TW/getting-started/installation
    - theme: alt
      text: 學習實戰模式
      link: /zh-TW/patterns/component-styling
    - theme: alt
      text: 建立 Plugins
      link: /zh-TW/plugin-system/overview

features:
  - icon: ⚙️
    title: CSS-in-JS 寫法，build-time 輸出
    details: 在 JavaScript 或 TypeScript 裡撰寫 style definitions，接著由 PikaCSS 在 build 階段把它們轉成靜態 atomic CSS。
  - icon: 🧠
    title: 有意維持靜態
    details: PikaCSS 之所以能大幅最佳化，就是因為輸入必須可靜態分析。文件會清楚說明這條邊界何時能幫上忙，何時又可能讓人誤判。
  - icon: 🧩
    title: 更接近 CSS 的組合方式
    details: 你可以使用 variables、selectors、shortcuts、keyframes、layers 與 plugins，不必在 utility classes 與手寫 CSS 之間來回切換思路。
  - icon: 🔌
    title: 一套 engine，多種 integrations
    details: 從 Vite、Nuxt、Rollup、Webpack、Rspack、Rolldown 到 esbuild 都能接上，而且不需要改變寫 styles 的方式。
  - icon: 🛠️
    title: 具備公開 API 的 plugin system
    details: 透過一致的 hook system 擴充 selectors、shortcuts、variables、keyframes、preflights 與 autocomplete。
  - icon: 📚
    title: 同時服務採用者與擴充者的文件
    details: 主要路徑面向每天都在使用 PikaCSS 的產品團隊；進階章節則另外照顧 plugin authors。

---

## 先理解限制，再決定是否採用

如果你的團隊想要 typed CSS-in-JS 的開發體驗，但不想在正式環境承擔 runtime styling 成本，PikaCSS 會特別適合。它不是 runtime styling system，也不會假裝所有 dynamic expressions 都能被最佳化掉。

它最實際的優勢，在於不會把 atomic reuse 擺在正確的 cascade 行為前面。當 declarations 彼此重疊時，PikaCSS 會讓較晚寫下的 author intent 仍然維持局部且可預測，而不是把最終結果交給某個共享 utility 剛好比較晚輸出到全域 stylesheet。

這個取捨本身就是重點。只要你接受輸入必須可靜態分析，PikaCSS 就能提供去重後的 atomic CSS、完整的 autocomplete 與可預測的輸出。如果你需要任意 runtime styling，最好在採用前就先確認這件事。

::: warning 先讀這個
不要跳過 [Static Arguments](/zh-TW/getting-started/static-arguments)。很多人一開始會誤解 PikaCSS，原因就是把 `pika()` 當成 runtime function 在看。
:::

## 一條實際可行的閱讀路徑

1. 先讀 [What Is PikaCSS?](/zh-TW/getting-started/what-is-pikacss)，判斷這個 engine 是否符合你的需求與限制。
2. 接著照著 [Installation](/zh-TW/getting-started/installation) 與 [First Pika](/zh-TW/getting-started/first-pika) 完成一次成功流程。
3. 在團隊擴大使用之前，先讀 [Static Arguments](/zh-TW/getting-started/static-arguments)。
4. 接著再看 [Component Styling](/zh-TW/patterns/component-styling)、[Responsive And Selectors](/zh-TW/patterns/responsive-and-selectors) 與 [Theming And Variables](/zh-TW/patterns/theming-and-variables)，了解真正在專案裡會怎麼使用它。
5. 如果你覺得哪裡少了東西，或輸出結果不太對，請直接對照 [Common Problems](/zh-TW/troubleshooting/common-problems)。

## 給 plugin authors

主要文件路徑是以使用者為優先來安排的。如果你的目的是擴充 engine，而不只是使用它，請直接跳到 [Plugin System Overview](/zh-TW/plugin-system/overview)。

## Next

- [What Is PikaCSS?](/zh-TW/getting-started/what-is-pikacss)
- [Installation](/zh-TW/getting-started/installation)
- [Component Styling](/zh-TW/patterns/component-styling)
- [Plugin System Overview](/zh-TW/plugin-system/overview)

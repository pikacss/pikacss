---
title: Reset
description: 使用 reset 外掛，把社群的 CSS reset 樣式表當成 preflight 注入。
relatedPackages:
  - '@pikacss/plugin-reset'
relatedSources:
  - packages/plugin-reset/src/index.ts
category: official-plugins
order: 10
translation:
  sourceFile: docs/official-plugins/reset.md
  sourceBlob: 7b7bf6137b6d3624c7a06bea70e3e6bc1ce9268e
---

# Reset {#reset}

把社群的 CSS reset 樣式表當成 preflight CSS 注入。

reset 外掛會把 CSS reset 當成 preflight 注入，確保跨瀏覽器有一致的基準。它支援數種知名的社群 reset，並註冊一個專屬的 `reset` layer，預設順序為 `-1`，讓 reset 樣式排在預設的 `preflights` 與 `utilities` layer 之前。這個順序只是預設值：如果你的設定已經指定了 `layers.reset`，就會以你的值為準。

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/plugin-reset
```

```sh [npm]
npm install -D @pikacss/plugin-reset
```

```sh [yarn]
yarn add -D @pikacss/plugin-reset
```

:::

<<< @/zh-tw/.examples/official-plugins/reset.setup.example.ts

`reset()` 不接受任何引數；preset 選擇與 layer 位置都屬於 Engine config。

:::tip 快速規則
- 呼叫 `reset()` 時不要傳任何引數。
- 用引擎設定中最上層的 `reset` key 來選擇 preset。
- 外掛會註冊一個預設順序為 `-1` 的 `reset` layer（排在預設的 `preflights` 與 `utilities` layer 之前）；你設定中的 `layers.reset` 值會優先採用。
:::

## 設定 {#config}

| 屬性 | 說明 |
|---|---|
| reset | 要注入的 CSS reset preset。可選值：`'andy-bell'`、`'eric-meyer'`、`'modern-normalize'`、`'normalize'`、`'the-new-css-reset'`。預設值：`'modern-normalize'`。 |

範例：

<<< @/zh-tw/.examples/official-plugins/reset.config.example.ts

> 完整的型別簽章與預設值請見 [API 參考 — Plugin Reset](/api/plugin-reset)。

## 下一步 {#next}

- [排版](/zh-tw/official-plugins/typography)：語意化的長文排版樣式。
- [圖示](/zh-tw/official-plugins/icons)：透過 Iconify 整合圖示。

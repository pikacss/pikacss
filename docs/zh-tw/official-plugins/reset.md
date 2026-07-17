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
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: c132fb7b30fcf523666c47d3ac97ed7ba525bb98
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

`reset()` 不接受任何引數。請用引擎設定中最上層的 `reset` 選項來選擇 preset，而不是把選項傳進外掛的呼叫。只有在你的設定尚未定義 `layers.reset` 時，外掛才會把它設成 `-1`，因此注入的 preflight 預設會排在預設的 `preflights` 與 `utilities` layer 之前；你可以用自己的 `layers: { reset: ... }` 項目覆寫這個位置。

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

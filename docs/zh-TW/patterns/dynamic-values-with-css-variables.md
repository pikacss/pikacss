# Dynamic Values 與 CSS Variables

PikaCSS 沒有 styling runtime。這正是它能維持效能與可預測性的原因之一，但也代表你處理 dynamic styling 的方式會跟傳統 runtime CSS-in-JS 不一樣。

如果某個值必須在 runtime 改變，請把 `pika()` 裡的 style definition 維持成靜態，再由你自己把變動的值綁到 CSS variable。

## 先分清楚你要處理的是哪一種需求

| 需求 | 建議模式 | 原因 |
| --- | --- | --- |
| 有限個視覺狀態 | 預先宣告 variants，然後在 runtime 切換 class names。 | PikaCSS 仍然可以預先掃描所有 style shape。 |
| 連續變化或每個實例都不同的值 | 在 `pika()` 裡使用 `var(--...)`，再於 runtime 綁定 variable。 | Style shape 保持靜態，value 仍然可以是 dynamic。 |
| 共用的主題 tokens | 在 config 裡定義 variables，並用 selectors 做範圍控制。 | Design system 可以維持集中且可重用。 |

## 不要這樣做

這是最常見、也最容易從 runtime CSS-in-JS 帶進來的習慣。

<<< @/.examples/zh-TW/patterns/dynamic-values-bad.tsx

`pika()` 沒辦法安全地分析這種 object，因為真正的 style values 要等到你的 app 執行後才會出現。

## 透過 CSS variables 綁定 runtime values

正確做法不是把更多 runtime 邏輯塞進 `pika()`。正確做法是讓 PikaCSS 產生參照 CSS variables 的靜態 declarations，再由你的 framework 或 DOM 程式碼去更新這些 variables。

<<< @/.examples/zh-TW/patterns/dynamic-values-react.tsx

這樣能成立，是因為 PikaCSS 只需要輸出 `width: var(--progress-width)` 與 `background-color: var(--progress-color)`。真正的 runtime 綁定仍然由你的 app 負責。

## 讓 style shape 保持靜態，variants 另外切換

很多 components 同時會有兩種動態需求：

1. 像 `solid` 或 `outline` 這種離散狀態
2. 像資料帶進來的品牌色這種每個實例都不同的值

請把它們分開處理。

<<< @/.examples/zh-TW/patterns/dynamic-values-variants.tsx

在 runtime 選擇靜態 class name，把真正會變的 token value 綁進 CSS variable。

## 一個好用的遷移心智模型

如果你原本習慣的是傳統 runtime CSS-in-JS，這個轉換很重要：

1. 不要用 runtime 資料去組 style objects。
2. 要在 runtime 從預先宣告好的 style objects 裡做選擇。
3. 要把真正會變的值移進 CSS variables。
4. 要讓 app layer 自己負責把 variable 指派到哪裡。

::: tip 記住這條邊界
PikaCSS 可以幫你產生 `var(--accent)` 這種 references，但不會替你管理 `--accent` 的狀態。
:::

如果你要處理的是共用 tokens 或主題切換，請接著看 [Theming And Variables](/zh-TW/patterns/theming-and-variables)。

## Next

- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Theming And Variables](/zh-TW/patterns/theming-and-variables)
- [Component Styling](/zh-TW/patterns/component-styling)
- [Common Problems](/zh-TW/troubleshooting/common-problems)

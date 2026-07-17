---
title: 排版
description: 使用 typography 外掛，為長文內容提供語意化的排版樣式。
relatedPackages:
  - '@pikacss/plugin-typography'
relatedSources:
  - packages/plugin-typography/src/index.ts
  - packages/plugin-typography/src/styles.ts
category: official-plugins
order: 20
translation:
  sourceFile: docs/official-plugins/typography.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: 31475eea9dda47882b241cabf1bd066e8d6d292f
---

# 排版 {#typography}

為長文內容提供語意化的排版樣式。

typography 外掛提供一組 `prose-*` shortcut，用合理的排版預設值來為長文 HTML 內容（文章、部落格文章、說明文件）設定樣式。

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/plugin-typography
```

```sh [npm]
npm install -D @pikacss/plugin-typography
```

```sh [yarn]
yarn add -D @pikacss/plugin-typography
```

:::

<<< @/zh-tw/.examples/official-plugins/typography.setup.example.ts

可用的 shortcut：

| Shortcut | 用途 |
|----------|---------|
| `prose-base` | 其他 `prose-*` shortcut 共用的基礎 prose 容器樣式 |
| `prose` | 基礎 prose 樣式，套用所有元件樣式 |
| `prose-paragraphs` | 段落間距與行高 |
| `prose-links` | 連結顏色與底線 |
| `prose-emphasis` | 粗體與斜體樣式 |
| `prose-kbd` | 鍵盤輸入樣式 |
| `prose-lists` | 有序與無序清單樣式 |
| `prose-hr` | 水平分隔線樣式 |
| `prose-headings` | 標題大小與間距 |
| `prose-quotes` | 區塊引言樣式 |
| `prose-media` | 圖片與影片樣式 |
| `prose-code` | 行內程式碼與程式碼區塊樣式 |
| `prose-tables` | 表格樣式 |

尺寸變體：

| Shortcut | 用途 |
|----------|---------|
| `prose-sm` | 小型 prose 尺寸 |
| `prose-lg` | 大型 prose 尺寸 |
| `prose-xl` | 特大 prose 尺寸 |
| `prose-2xl` | 雙倍特大 prose 尺寸 |

使用方式：

typography 的 shortcut 就是一般的 `pika()` 輸入。舉例來說，你可以像這樣套用一個聚焦的模組 shortcut：

::: code-group

<<< @/zh-tw/.examples/official-plugins/typography.usage.example.pikain.ts [輸入]

<<< @/zh-tw/.examples/official-plugins/typography.usage.example.pikaout.css [輸出]

:::

Prose 的顏色角色使用 `--pk-prose-color-*` CSS 變數，例如 `--pk-prose-color-body`、`--pk-prose-color-links`，以及 `--pk-prose-color-headings`。鍵盤按鍵陰影則使用 `--pk-prose-kbd-shadows`。

## 設定 {#config}

透過引擎設定中最上層的 `typography` key 來設定這個外掛。

| 屬性 | 說明 |
|---|---|
| variables | 巢狀於 `typography` 底下。針對已註冊的 prose 變數的 CSS 變數覆寫，包含 `--pk-prose-color-*` 這一組與 `--pk-prose-kbd-shadows`。 |

<<< @/zh-tw/.examples/official-plugins/typography.config.example.ts

> 完整的型別簽章與預設值請見 [API 參考 — Plugin Typography](/api/plugin-typography)。

## 下一步 {#next}

- [圖示](/zh-tw/official-plugins/icons)：透過 Iconify 整合圖示。
- [字型](/zh-tw/official-plugins/fonts)：網頁字型載入。

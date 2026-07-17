---
title: Agent Skills
description: 用於使用與擴充 PikaCSS 的 AI 輔助開發 skill。
relatedPackages:
  - '@pikacss/core'
relatedSources: []
category: integrations
order: 30
translation:
  sourceFile: docs/integrations/agent-skills.md
  sourceCommit: ee25703206bb11f86a899f6e9673250ddabc235c
  sourceBlob: 847588889e7f5698fc724e8a4931657cfa635e74
---

# Agent Skills {#agent-skills}

PikaCSS 內建了一個 agent skill，為使用與擴充 PikaCSS 兩方面都提供 AI 輔助的指引。你可以用 [`skills` CLI](https://www.npmjs.com/package/skills) 安裝它，在任何支援的 coding agent 中使用。

## 安裝 {#install}

```bash
npx skills add pikacss/pikacss --skill pikacss-use
```

## pikacss-use {#pikacss-use}

### 何時使用 {#when-to-use}

當你以任何形式使用 PikaCSS 時，都可以使用這個 skill：

- 在新專案中設定 PikaCSS
- 設定引擎選項或建置外掛
- 使用 `pika()` 及其變體
- 使用官方外掛（reset、icons、fonts、typography）
- 排解建置或執行階段的問題
- 從頭建立一個新的引擎外掛
- 實作外掛的 hook 與生命週期
- 透過模組擴增來擴充 `EngineConfig`
- 撰寫外掛的測試

### 如何觸發 {#how-to-trigger}

當你的問題與 PikaCSS 的使用或外掛開發相關時，這個 skill 會自動啟用。你也可以在你的 prompt 中明確提到「using PikaCSS」、「PikaCSS setup」，或「PikaCSS plugin development」。

### 涵蓋範圍 {#coverage}

- 安裝與建置工具整合（Vite、Webpack、Nuxt 等）
- 引擎設定與客製化
- `pika()`、`pika.str()`、`pika.arr()`，以及 `pikap()` 函式
- 官方外掛的使用與設定
- ESLint 整合
- TypeScript 自動完成支援
- 外掛結構與 `defineEnginePlugin`
- 生命週期 hook 與執行順序
- 透過 TypeScript 模組擴增來擴充設定
- layer 管理與 preflight 注入
- 選擇器、shortcut、變數，以及關鍵影格的註冊
- 外掛測試的模式

## 下一步 {#next}

- [安裝與設定](/zh-tw/getting-started/setup)：在你的專案中安裝 PikaCSS。
- [外掛開發](/zh-tw/plugin-development/create-a-plugin)：建立你自己的外掛。

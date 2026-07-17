---
title: 安裝與設定
description: 安裝 PikaCSS 並設定你的建置工具，開始使用 atomic CSS-in-JS。
relatedPackages:
  - '@pikacss/core'
  - '@pikacss/unplugin-pikacss'
relatedSources:
  - packages/unplugin/package.json
  - packages/unplugin/src/vite.ts
  - packages/unplugin/src/index.ts
  - packages/unplugin/src/types.ts
  - packages/integration/src/ctx.ts
  - packages/integration/src/tsCodegen.ts
  - packages/core/src/plugins/selectors.ts
  - packages/core/src/plugins/shortcuts.ts
  - packages/core/src/plugins/variables.ts
category: getting-started
order: 20
translation:
  sourceFile: docs/getting-started/setup.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: 0024f424fc7645357b762a940f5151f33ddf71a9
---

# 安裝與設定 {#setup}

安裝 PikaCSS 並加入建置外掛，開始從你的樣式定義產生 atomic CSS。

## 安裝 {#install}

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/core @pikacss/unplugin-pikacss
```

```sh [npm]
npm install -D @pikacss/core @pikacss/unplugin-pikacss
```

```sh [yarn]
yarn add -D @pikacss/core @pikacss/unplugin-pikacss
```

:::

Vite 進入點只支援 Vite 7 與 8（peer dependency 為 `vite: ^7.0.0 || ^8.0.0`）。

## 套用 Vite 外掛 {#apply-vite-plugin}

把 PikaCSS 的 Vite 外掛加入你的 `vite.config.ts`：

<<< @/zh-tw/.examples/getting-started/setup.vite.example.ts

其他建置工具請見 [整合](/zh-tw/integrations/unplugin)。

::: info `pika` 是編譯時期的全域變數，永遠不要匯入它
你不需要在任何地方匯入 `pika`，而且 `@pikacss/core` 也沒有執行階段的 `pika` 匯出。建置外掛會在建置時期把每一次 `pika()` 呼叫替換成產生出來的 class 名稱，而 TypeScript 則是從產生的 `pika.gen.ts` 宣告檔認得這個全域變數（見 [產生的檔案](#generated-files)）。
:::

## 匯入 `pika.css` {#import-pika-css}

在你的應用程式進入點匯入產生出來的 CSS 檔案：

<<< @/zh-tw/.examples/getting-started/setup.main.example.ts

這個匯入會解析到產生出來的 CSS 輸出，裡面包含你所有的原子樣式。預設情況下這個檔案是 `pika.gen.css`，但 `cssCodegen` 可以把它指向不同的輸出路徑。

## 產生的檔案 {#generated-files}

在每一次開發或建置執行時，外掛都會在專案根目錄（也就是外掛的工作目錄，除非有設定 `cwd` 選項，否則就是你的 Vite root）產生 codegen 輸出：

| 檔案 | 用途 |
|---|---|
| `pika.gen.ts` | `pika` 全域變數的 TypeScript 宣告 |
| `pika.gen.css` | 產生出來的 CSS 輸出 |
| `pika.config.js` | 引擎設定，**不會**自動建立；只有在你用 `autoCreateConfig: true` 主動啟用時才會建立 |

把 `tsCodegen` 或 `cssCodegen` 設成字串，會把 codegen 輸出寫到自訂路徑。把 `tsCodegen` 設成 `false`，則會完全停用 TypeScript 宣告的 codegen。

### pika.config.js {#pika-config-js}

`autoCreateConfig` 預設為 `false`，所以外掛不會自己把設定檔寫進你的儲存庫，請自行建立一個。沒有設定檔也能運作（引擎會使用預設值），並會輸出一段提示訊息。如果你想讓第一次執行時就幫你建立一個，用 `autoCreateConfig: true` 主動啟用即可。無論哪種方式，檔案看起來都像這樣：

```js
/// <reference path="./pika.gen.ts" />
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
  // 在這裡加入你的 PikaCSS 引擎設定
})
```

只要設定檔本身有經過型別檢查，這個三斜線參考就會把產生的 `pika.gen.ts` 宣告拉進 TypeScript program，但它只有在你的 tsconfig 涵蓋該設定檔時才有用，所以不要用它來取代下面 [pika.gen.ts](#pika-gen-ts) 的做法。

使用 `pika.config.ts` 或 `pika.config.js` 其中一個即可，但絕對不要同時保留兩個。設定檔的探索範圍僅限於**專案根目錄**，並會依優先順序檢查一份固定的候選清單（`pika.config.{ts,mts,cts,js,mjs,cjs}`，接著是對應的 `pikacss.config.*`）。當存在超過一個時，會載入優先順序最高的檔案，其餘的則會被記錄為已忽略。

### pika.gen.ts {#pika-gen-ts}

當 `tsCodegen` 啟用時（預設如此），建置外掛會產生一個 TypeScript 宣告檔，也就是專案根目錄裡的 `pika.gen.ts`，或當 `tsCodegen` 是字串時的自訂路徑。它會宣告 `pika` 全域變數，並為所有自訂選擇器、shortcut、變數，以及外掛所貢獻的屬性提供自動完成。

只有當產生的檔案屬於你的 TypeScript program 時，TypeScript 才會看到這些宣告。未經修改的 Vite 範本只有 `"include": ["src"]`，不會涵蓋根目錄層級的 `pika.gen.ts`，這會導致到處都出現 `Cannot find name 'pika'`。請挑選以下其中一種做法：

**選項 A：在 `src/` 內產生檔案：**

```ts
// vite.config.ts
PikaCSS({
  tsCodegen: './src/pika.gen.ts',
})
```

**選項 B：把檔案加入你的 tsconfig `include`：**

```json
// tsconfig.json（或 tsconfig.app.json）
{
  "include": ["src", "pika.gen.ts"]
}
```

### pika.gen.css {#pika-gen-css}

產生的 CSS 檔案，內含：

- Layer 順序宣告
- Preflight 樣式（reset、變數、關鍵影格）
- 原子 utility class

預設情況下這個檔案名為 `pika.gen.css`。它會透過 `import 'pika.css'` 匯入，並在你的原始碼或設定變更時自動更新，即使你自訂 `cssCodegen` 寫入不同的檔名也一樣。

### 該提交還是忽略？ {#commit-or-ignore}

兩個 codegen 輸出在每一次開發或建置執行時都會完整重新產生，所以把它們當成可忽略的建置產物也行：

```txt
# .gitignore
pika.gen.ts
pika.gen.css
```

有一點要注意：如果 `pika.gen.ts` 從未在該環境中產生過，獨立執行的型別檢查（例如 CI 中的 `tsc --noEmit`）會因 `Cannot find name 'pika'` 而失敗。你可以在型別檢查前先執行一次開發／建置步驟，或是把 `pika.gen.ts` 提交進版控。而自動建立的 `pika.config.js` 是你自己的設定檔，請把它提交進版控。

## 下一步 {#next}

- [使用方式](/zh-tw/getting-started/usage)：學習如何用 `pika()` 撰寫樣式。
- [引擎設定](/zh-tw/getting-started/engine-config)：設定 layer、preflight 與外掛。
- [ESLint 設定](/zh-tw/getting-started/eslint-config)：為樣式定義啟用靜態分析。

# 自訂建置工具整合

PikaCSS 透過 `@pikacss/unplugin-pikacss` 為主流建置工具提供官方轉接器。當你需要支援不適合 unplugin 模型的編譯器、打包器或建置流程時，可以直接使用 `@pikacss/integration` 提供的 `createCtx()`。

`createCtx()` 是官方整合層底下共用的核心原語。它負責處理設定檔載入、引擎初始化、原始碼轉換、虛擬 CSS 輸出與產生檔案；你的 adapter 只需要把這些能力接到自己的建置工具生命週期上。

## 安裝

::: code-group
<<< @/.examples/integrations/install-integration.sh [pnpm]
<<< @/.examples/integrations/install-integration-npm.sh [npm]
<<< @/.examples/integrations/install-integration-yarn.sh [yarn]
<<< @/.examples/integrations/install-integration-bun.sh [bun]
:::

## 何時使用 `createCtx()`

當你需要以下能力時，請使用 `createCtx()`：

- 支援尚未有官方 PikaCSS adapter 的建置工具
- 控制超出 unplugin 抽象層範圍的插件生命週期細節
- 在自訂整合層中重用 PikaCSS 的轉換與 codegen 流程

如果你的建置工具已經由 `@pikacss/unplugin-pikacss` 支援，優先使用官方 adapter。

## 函式簽章

<<< @/.examples/integrations/create-ctx-signature.ts

`createCtx()` 接受 `IntegrationContextOptions`，並回傳 `IntegrationContext` 實例。

### `IntegrationContextOptions`

建立 context 時應明確傳入每一個選項。官方 adapter 會自行決定預設值，但自訂整合最好把路徑、掃描範圍與 codegen 行為一次定義清楚。

<<< @/.examples/integrations/create-ctx-options.ts

| 屬性 | 型別 | 常見值 | 用途 |
|---|---|---|---|
| `cwd` | `string` | `process.cwd()` | 工作目錄，用來解析設定檔、掃描規則與產生檔案路徑。通常要指向你的 adapter 正在處理的專案根目錄。 |
| `currentPackageName` | `string` | `'my-build-tool-pikacss'` | 會寫入產生檔案標頭、日誌訊息與自動建立設定檔中的 import 來源。請填入你的整合套件名稱，讓產物與錯誤訊息能正確標示來源。 |
| `scan.include` | `string[]` | `['src/**/*.{js,ts,jsx,tsx,vue}']` | `fullyCssCodegen()` 會掃描的 glob 規則。應覆蓋所有可能出現 `pika()` 呼叫的原始碼位置。 |
| `scan.exclude` | `string[]` | `['node_modules/**', 'dist/**']` | 掃描時要跳過的 glob 規則。請排除第三方程式碼、建置輸出與任何不應被轉換的路徑。 |
| `configOrPath` | `EngineConfig \| string \| null \| undefined` | `undefined` | 行內引擎設定物件、明確的設定檔路徑，或 `null`/`undefined` 以啟用自動偵測。若你的工具已知設定檔位置，可直接傳入路徑；若整合層會自行組裝設定，也可以直接傳入物件。 |
| `fnName` | `string` | `'pika'` | `transform()` 在原始模組中要偵測的函式名稱。除非你刻意暴露不同名稱的全域 helper，否則維持 `pika` 即可。 |
| `transformedFormat` | `'string' \| 'array'` | `'string'` | 寫回轉換後模組的輸出型態。若消費端是 `className` 之類的字串介面，使用 `'string'`；若你的流程需要 class token 陣列，則使用 `'array'`。 |
| `tsCodegen` | `false \| string` | `'pika.gen.ts'` | 控制是否啟用 TypeScript 自動補齊產生檔，以及它的輸出路徑。若你的整合不需要宣告檔，可設為 `false`。 |
| `cssCodegen` | `string` | `'pika.gen.css'` | 產生 CSS 檔案的輸出路徑，虛擬 `pika.css` 模組與最終建置輸出都會依賴它。 |
| `autoCreateConfig` | `boolean` | `true` | 控制 `loadConfig()` 在找不到設定檔時是否自動建立起始設定。若你的整合不應主動寫入專案檔案，請關閉它。 |

::: info
相對路徑形式的 `configOrPath`、`cssCodegen` 與 `tsCodegen` 都會以 `cwd` 為基準解析。呼叫 `createCtx()` 前先固定工作目錄，才能讓 watch mode 與產生檔路徑保持可預期。
:::

## 回傳值：`IntegrationContext`

回傳的 `IntegrationContext` 會保存 adapter 的即時引擎狀態，並提供把 PikaCSS 接到其他工具所需的能力。

### 屬性參考

| 屬性 | 型別 | 用途 |
|---|---|---|
| `cwd` | `string` | 目前工作目錄，用來解析設定檔、掃描目標與產生檔案路徑。如果你的 adapter 需要重新指向其他目錄，可以在多次執行之間更新它。 |
| `currentPackageName` | `string` | 會寫入產生檔案標頭與自動建立設定檔中的套件名稱。 |
| `fnName` | `string` | `transform()` 在原始模組中要搜尋的函式名稱模式。 |
| `transformedFormat` | `'string' \| 'array'` | `pika()` 呼叫轉換後預設輸出的資料形狀。 |
| `cssCodegenFilepath` | `string` | 產生 CSS 檔案的絕對路徑，虛擬 `pika.css` 模組會指向它。 |
| `tsCodegenFilepath` | `string \| null` | 若啟用，這是產生 TypeScript 檔案的絕對路徑。 |
| `hasVue` | `boolean` | 是否能從目前工作目錄解析到 `vue`。若你的 adapter 需要 Vue 特定處理，可用這個值判斷。 |
| `resolvedConfig` | `EngineConfig \| null` | 最近一次載入的 engine 設定物件，可能來自行內設定，也可能來自解析後的設定檔。 |
| `resolvedConfigPath` | `string \| null` | 載入後實際使用的設定檔路徑。 |
| `resolvedConfigContent` | `string \| null` | 最近一次載入的設定檔內容，可用於 watch mode 重新載入判斷。 |
| `usages` | `Map<string, UsageRecord[]>` | 以模組 id 為鍵，保存收集到的 `pika()` 使用紀錄。每筆紀錄都包含產生出的 atomic style id 與原始 `engine.use()` 參數。 |
| `hooks` | `{ styleUpdated, tsCodegenUpdated }` | 當 CSS 輸出或 TypeScript 自動補齊輸出需要重新產生時會觸發的事件 hook。 |
| `engine` | `Engine` | 目前使用中的 engine 實例。只能在 `setup()` 完成後存取，否則會直接拋錯。 |
| `transformFilter` | `{ include: string[]; exclude: string[] }` | 你可以轉接到建置工具過濾系統中的掃描規則。`exclude` 也會自動包含產生出的 CSS 與 TypeScript 檔案，避免被重複處理。 |
| `setupPromise` | `Promise<void> \| null` | 正在進行中的 `setup()` Promise。其他非同步 API 會自動等待它，確保重複生命週期呼叫仍維持序列化。 |

### 方法參考

| 方法 | 簽章 | 用途 |
|---|---|---|
| `loadConfig()` | `() => Promise<{ config, file }>` | 解析行內或檔案型 engine 設定，並更新 `resolvedConfig`、`resolvedConfigPath` 與 `resolvedConfigContent`。 |
| `transform(code, id)` | `(code: string, id: string) => Promise<{ code, map } \| null \| undefined>` | 轉換單一模組，把 `pika()` 呼叫替換成產生的 class 名稱，並為後續 CSS 或 TypeScript codegen 記錄 usage。 |
| `getCssCodegenContent()` | `() => Promise<string \| null>` | 根據目前 usage 建立產生後的 CSS 內容，其中包含 layer 順序宣告、preflights 與 atomic 規則。 |
| `getTsCodegenContent()` | `() => Promise<string \| null>` | 建立 TypeScript 自動補齊內容。若 `tsCodegen` 已停用，會回傳 `null`。 |
| `writeCssCodegenFile()` | `() => Promise<void>` | 確保 CSS 輸出目錄存在，然後把最新的 CSS 產生檔案寫入磁碟。 |
| `writeTsCodegenFile()` | `() => Promise<void>` | 確保 TypeScript 輸出目錄存在，然後在啟用 codegen 時把最新 TypeScript 產生檔案寫入磁碟。 |
| `fullyCssCodegen()` | `() => Promise<void>` | 掃描所有符合 `scan.include` 的檔案，透過 `transform()` 收集 usage，最後寫出 CSS 產生檔案。適合用於 build mode 或首次完整掃描。 |
| `setup()` | `() => Promise<void>` | 重設 context、載入設定、重新建立 engine，並安裝會把 engine 更新轉發到 `styleUpdated` 與 `tsCodegenUpdated` 的內部 hook。 |

::: tip
在 adapter 啟動初期就先呼叫 `await ctx.setup()`，可以更早暴露設定檔與引擎初始化錯誤。雖然其他非同步方法也會等待進行中的 setup，但明確呼叫會讓生命週期更容易推理。
:::

::: info
`setup()` 會清空既有 usage，也會重新初始化內部 hook listener。若你的 adapter 會訂閱 `ctx.hooks.styleUpdated` 或 `ctx.hooks.tsCodegenUpdated`，請在 `await ctx.setup()` 之後再綁定，或在每次重新 setup 後重新綁定。
:::

## 最小自訂插件範例

下面這個範例示範一個小型自訂建置插件，會：

- 建立共用的 integration context
- 在 setup 之後綁定更新 hook，避免 context 重新初始化時 listener 遺失
- 在 `buildStart()` 執行完整掃描
- 將原始碼轉換交給 `ctx.transform()`
- 在 usage 變更時寫入 CSS 與 TypeScript 產生檔案
- 將虛擬 `pika.css` 模組解析到實際產生的 CSS 檔案

<<< @/.examples/integrations/custom-integration-plugin.ts

::: warning
`createCtx()` 不會替你處理檔案監控或設定檔監控。若你的建置工具支援 watch mode 或 HMR，請自行在 `ctx.resolvedConfigPath`、`ctx.resolvedConfigContent` 與重複呼叫 `ctx.setup()` 上補上重新載入邏輯。
:::

## 生命週期如何對應到你的建置工具

多數自訂整合都會遵循這個流程：

1. 在每次 build session 建立一個 context 實例。
2. 在第一次轉換或完整掃描前呼叫 `setup()`。
3. 對每個需要支援 `pika()` 的原始模組呼叫 `transform()`。
4. 在 build mode 使用 `fullyCssCodegen()` 收集整個專案的 usage。
5. 透過 `ctx.cssCodegenFilepath` 暴露 `pika.css`。
6. 在工具完成掃描或收到更新 hook 時寫入 CSS 與 TypeScript 產生檔案。

這就是官方 unplugin adapter 採用的同一套架構，只是外層生命週期由你的工具接手。

## 實作參考

若你想看完整的正式實作，可以閱讀共用 context 原始碼：[packages/integration/src/ctx.ts](https://github.com/pikacss/pikacss/blob/main/packages/integration/src/ctx.ts)。

若你想對照官方 adapter 如何把 `createCtx()` 接到實際建置 hook，也可以閱讀 [packages/unplugin/src/index.ts](https://github.com/pikacss/pikacss/blob/main/packages/unplugin/src/index.ts)。

## 下一步

- [整合概覽](/zh-TW/integrations/overview)
- [Vite 整合](/zh-TW/integrations/vite)
- [Rollup 整合](/zh-TW/integrations/rollup)
- [插件系統概覽](/zh-TW/plugin-system/overview)

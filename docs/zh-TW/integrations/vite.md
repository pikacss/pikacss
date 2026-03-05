# Vite 整合

PikaCSS 透過 `@pikacss/unplugin-pikacss/vite` 提供一流的 Vite 支援。支援 Vite 5 和 Vite 6。

## 安裝

::: code-group
<<< @/.examples/integrations/vite-install.sh [pnpm]
<<< @/.examples/integrations/vite-install-npm.sh [npm]
<<< @/.examples/integrations/vite-install-yarn.sh [yarn]
<<< @/.examples/integrations/vite-install-bun.sh [bun]
:::

## 基本設定

### 1. 註冊插件

將 PikaCSS 插件新增至你的 `vite.config.ts`：

<<< @/.examples/integrations/vite-basic-config.ts

搭配框架插件（Vue 或 React）時，將 PikaCSS 放在其後面：

::: code-group
<<< @/.examples/integrations/vite-vue-config.ts [Vue]
<<< @/.examples/integrations/vite-react-config.ts [React]
:::

### 2. 匯入虛擬 CSS 模組

在你的應用程式進入點檔案中，匯入 `pika.css`——這是一個虛擬模組，Vite 會將其解析至產生的原子化 CSS 檔案：

<<< @/.examples/integrations/vite-app-entry.ts

::: info 虛擬模組
`pika.css` 不是磁碟上的真實檔案。插件攔截 Vite 的模組解析，將 `pika.css` 對應至產生的 CSS 程式碼產生檔案（預設：`pika.gen.css`）。此模組包含從你的 `pika()` 呼叫中提取的所有原子化 CSS 規則。
:::

### 3. 開始使用 PikaCSS

一切就緒！在你的原始檔案中使用 `pika()`。使用預設的 `autoCreateConfig: true` 首次執行時，會在專案根目錄自動建立一個 `pika.config.ts` 檔案。

## HMR 行為（開發模式）

在 `vite dev` 模式下，PikaCSS 提供完整的 HMR 體驗：

- **樣式變更**：當你修改原始檔案中的 `pika()` 呼叫時，插件會重新掃描並重新產生原子化 CSS。更新後的樣式會熱重載，無需整頁重新整理。
- **設定檔監控**：插件會監控你的 `pika.config.ts`（或目前使用的任何設定檔）。當設定檔內容變更時，插件會自動重新載入引擎設定、使受影響的模組失效，並觸發 HMR 更新。
- **防抖程式碼產生**：CSS 和 TypeScript 程式碼產生的寫入採用防抖（300ms），以避免快速編輯期間過多的檔案系統寫入。

## 插件選項

所有選項均為可選。以下是包含預設值的完整參考：

<<< @/.examples/integrations/vite-all-options.ts

### `scan`

控制 PikaCSS 掃描哪些檔案來尋找 `pika()` 函式呼叫。接受 glob 規則。

| 屬性 | 型別 | 預設值 | 說明 |
| --------- | -------------------- | ------------------------------------ | ---------------------------- |
| `include` | `string \| string[]` | `['**/*.{js,ts,jsx,tsx,vue}']` | 要掃描的檔案規則 |
| `exclude` | `string \| string[]` | `['node_modules/**', 'dist/**']` | 要排除的檔案規則 |

<<< @/.examples/integrations/vite-custom-scan.ts

### `fnName`

PikaCSS 在原始碼中尋找的函式名稱。若 `pika` 與你專案中的其他識別符衝突，可修改此設定。

- **型別**：`string`
- **預設值**：`'pika'`

<<< @/.examples/integrations/vite-custom-fnname.ts

### `transformedFormat`

控制轉換後 `pika()` 呼叫的輸出格式。

| 值 | 回傳型別 | 輸出範例 | 使用情境 |
| ---------- | ----------- | ------------------------ | ------------------------------------ |
| `'string'` | `string` | `"a b c"` | 預設——適用於 `class` 綁定 |
| `'array'` | `string[]` | `['a', 'b', 'c']` | 用於 `clsx`、`classnames` |

<<< @/.examples/integrations/vite-custom-format.ts

### `config`

以行內方式或檔案路徑提供引擎設定。省略時，插件會自動偵測專案根目錄中的 `{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}`。

- **型別**：`EngineConfig | string`
- **預設值**：`undefined`（自動偵測）

::: code-group
<<< @/.examples/integrations/vite-inline-config.ts [Inline Config]
<<< @/.examples/integrations/vite-config-path.ts [File Path]
:::

::: tip
傳入行內設定物件時，`autoCreateConfig` 會被忽略——不會在磁碟上建立設定檔。
:::

### `autoCreateConfig`

找不到設定檔時是否自動建立設定檔。

- **型別**：`boolean`
- **預設值**：`true`

為 `true` 且不存在設定檔時，首次執行時會在專案根目錄建立預設的 `pika.config.ts`。

### `tsCodegen`

控制 TypeScript 程式碼產生。產生的檔案為 `pika()` 提供型別提示和自動補齊支援。

- **型別**：`boolean | string`
- **預設值**：`true`（解析為 `'pika.gen.ts'`）

| 值 | 行為 |
| -------- | -------------------------------------------------- |
| `true` | 在專案根目錄產生 `pika.gen.ts` |
| `false` | 停用 TypeScript 程式碼產生 |
| `string` | 在指定路徑產生 |

<<< @/.examples/integrations/vite-disable-ts-codegen.ts

### `cssCodegen`

控制 CSS 程式碼產生。產生的檔案包含所有原子化 CSS 規則。

- **型別**：`true | string`
- **預設值**：`true`（解析為 `'pika.gen.css'`）

| 值 | 行為 |
| -------- | -------------------------------------------------- |
| `true` | 在專案根目錄產生 `pika.gen.css` |
| `string` | 在指定路徑產生 |

<<< @/.examples/integrations/vite-custom-codegen.ts

## 運作原理

Vite 插件是一個輕量的 `createVitePlugin(unpluginFactory)` 轉接器。所有轉換邏輯、程式碼產生、虛擬 `pika.css` 解析和設定監控都來自共用的 unplugin factory（`packages/unplugin/src/index.ts`）。

**建置模式**（`vite build`）：
1. 掃描所有匹配的原始檔案中的 `pika()` 呼叫。
2. 將每個 `pika()` 呼叫替換為產生的 class 名稱。
3. 將完整的原子化 CSS 寫入程式碼產生檔案。

**開發模式**（`vite dev`）：
1. 在 Vite 服務這些檔案時按需轉換。
2. 監控設定檔的變更並重新載入引擎。
3. 使用防抖寫入和 HMR 提供流暢的開發體驗。

## 下一步

- [Rollup](/zh-TW/integrations/rollup)

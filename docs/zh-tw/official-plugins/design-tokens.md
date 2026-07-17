---
title: Design Tokens
description: 使用 design tokens 外掛，將 W3C design token 與 design.md 文件轉換成 CSS 變數。
relatedPackages:
  - '@pikacss/plugin-design-tokens'
relatedSources:
  - packages/plugin-design-tokens/src/index.ts
category: official-plugins
order: 50
translation:
  sourceFile: docs/official-plugins/design-tokens.md
  sourceCommit: 36ab046b5f27060274a79d160c9b43606652d780
  sourceBlob: 75eaeed82a8c10a091b201815c069a77130962f5
---

# Design Tokens {#design-tokens}

透過引擎的 `variables` 系統，將 design token 轉換成 CSS 變數。

design tokens 外掛會讀取 token 來源（行內物件、W3C Design Tokens JSON 檔案，或 markdown 設計文件），把它們攤平成 CSS 變數，再合併進引擎的 `variables` 設定。由於 token 會流經核心的 `variables` 系統，它們也會繼承未使用時自動剔除、IDE 自動完成，以及選擇器範圍限定等能力。token 來源的檔案路徑會註冊為引擎的設定相依（config dependency），即使檔案不存在也一樣會註冊，因此當 token 檔案變更或稍後才建立時，建置工具整合都會重新載入。

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/plugin-design-tokens
```

```sh [npm]
npm install -D @pikacss/plugin-design-tokens
```

```sh [yarn]
yarn add -D @pikacss/plugin-design-tokens
```

:::

<<< @/zh-tw/.examples/official-plugins/design-tokens.setup.example.ts

`designTokens()` 不接受任何引數。請透過引擎設定中最上層的 `designTokens` key 來設定這個外掛。

使用方式：從一般的 `pika()` 呼叫中參考產生出來的變數。預設情況下會剔除未使用的 token，因此只有實際參考到的變數才會輸出：

::: code-group

<<< @/zh-tw/.examples/official-plugins/design-tokens.usage.example.pikain.ts [輸入]

<<< @/zh-tw/.examples/official-plugins/design-tokens.usage.example.pikaout.css [輸出]

:::

## Token 來源 {#token-sources}

`sources` 接受單一來源或一個來源陣列。每個來源可以是行內的 token group 物件，或是一個檔案路徑。相對路徑會相對於 `root` 解析（預設：`process.cwd()`）。當變數名稱衝突時，較晚的來源會覆寫較早的來源。無法讀取或無效的來源會被略過並發出警告，而不會導致引擎建立失敗。

### JSON Token 檔案 {#json-token-files}

任何不是以 `.md` 結尾的檔案路徑，都會被當成 W3C Design Tokens JSON 檔案來解析。帶有 `$value` 屬性的節點是一個 token；其他物件則是巢狀的 group。以 `$` 為前綴的 group metadata key（例如 `$description`）會被略過：

```json
{
	"color": {
		"primary": { "$value": "#3b82f6", "$type": "color" },
		"accent": { "$value": "{color.primary}" }
	}
}
```

### Markdown 設計文件 {#markdown-design-documents}

以 `.md` 結尾的檔案路徑會被當成設計文件來解析。只有 info string 以 `tokens` 開頭的柵欄程式碼區塊會被讀取；其他所有 markdown 內容都會被忽略，因此 token 可以放在你的設計文件裡。區塊內容必須是符合 W3C Design Tokens 格式的有效 JSON：

````md
# Buttons

Primary buttons use the brand color.

```tokens
{ "color": { "primary": { "$value": "#3b82f6" } } }
```

The dark theme swaps in a lighter shade.

```tokens theme=dark selector=".dark"
{ "color": { "primary": { "$value": "#60a5fa" } } }
```
````

info string 可以帶有兩個屬性：

- `theme=<name>`：將該區塊的 token 指派給某個主題，而不是基礎的 `:root` 範圍。
- `selector=<css-selector>`：覆寫該區塊的主題選擇器。值可以用 `"` 或 `'` 括起來。柵欄上的 `selector` 會優先於 `themes` 底下設定的選擇器。

## 主題 {#themes}

基礎 token 會輸出在 `:root` 底下。主題 token 則會輸出在該主題的選擇器底下，選擇器預設為 `.<themeName>`，可以透過 `themes.<name>.selector` 覆寫（或在個別區塊透過柵欄的 `selector` 屬性覆寫）。主題來源使用與基礎來源相同的格式：

```ts
import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'

export default defineEngineConfig({
	plugins: [designTokens()],
	designTokens: {
		sources: ['./design.tokens.json'],
		themes: {
			dark: {
				selector: '[data-theme="dark"]',
				sources: ['./design.dark.tokens.json'],
			},
		},
	},
})
```

## Token 名稱與別名 {#token-names-and-aliases}

每個 token 路徑區段都會轉成 kebab-case（`fontSize` → `font-size`），然後區段之間用 `-` 連接來組成變數名稱，例如 `color.primary` → `--color-primary`。當設定了 `prefix` 時，它會被當成第一個區段加在最前面：`--app-color-primary`。

字串值可以用別名語法 `{path.to.token}` 參考其他 token，它會用相同的正規化與前綴解析成 `var(--path-to-token)`。別名永遠指向輸出的變數名稱。別名也可以嵌在較長的值裡使用，例如 `'1px solid {color.border}'` → `1px solid var(--color-border)`。

## 複合值 {#composite-values}

物件與陣列的 `$value` 會根據 `$type` 序列化：

| `$type` | 序列化方式 |
|---|---|
| `shadow` | `[inset] <offsetX> <offsetY> <blur> <spread> <color>`，缺少的偏移量預設為 `0` |
| `border` | `<width> <style> <color>` |
| `transition` | `<duration> <timingFunction> <delay>` |
| *（陣列，任何型別）* | 每個項目個別序列化後用 `, ` 連接（分層陰影、`fontFamily` stack） |

帶有其他 `$type`（例如 `typography`）的物件值沒有單一值的序列化器。它們會展開成每個欄位一個子變數：`typography.heading` 搭配 `{ fontSize: '2rem' }` 會變成 `--typography-heading-font-size`。

## 設定 {#config}

| 屬性 | 說明 |
|---|---|
| sources | 輸出在 `:root` 底下的基礎 token 來源，可以是行內的 token group 物件或檔案路徑。當名稱衝突時，較晚的來源會覆寫較早的來源。 |
| themes | 以主題名稱作為 key 的主題覆寫。每個主題都有一個 `selector`（預設 `.<themeName>`）與它自己的 `sources`。 |
| prefix | 加在每個產生的 CSS 變數名稱前面的前綴（不含開頭的 `--`）。預設值：`''`。 |
| root | 用來解析相對來源檔案路徑的基礎目錄。預設值：`process.cwd()`。 |
| pruneUnused | 套用到每個產生的變數的剔除覆寫設定。未設定時，會套用 `variables` 設定的預設值（未使用的 token 會被剔除）。 |

> 完整的型別簽章與預設值請見 [API 參考 — Plugin Design Tokens](/api/plugin-design-tokens)。

## 下一步 {#next}

- [字型](/zh-tw/official-plugins/fonts)：網頁字型的載入與管理。
- [變數](/zh-tw/customizations/variables)：design token 會流入的核心變數系統。

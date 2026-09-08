---
title: ESLint 設定
description: 使用 canonical PikaCSS project config 驗證 static Pika authoring grammar。
relatedPackages:
  - '@pikacss/eslint-config'
relatedSources:
  - packages/eslint-config/src/index.ts
  - packages/eslint-config/src/lint-project.ts
  - packages/eslint-config/src/rules/static-usage.ts
  - packages/integration/src/compiler/evaluate.ts
category: getting-started
order: 50
translation:
  sourceFile: docs/getting-started/eslint-config.md
  sourceBlob: baa716ebb2c128fb77c877753b9cd7848645501e
---

# ESLint 設定 {#eslint-config}

PikaCSS 提供已設定好的 ESLint flat config，會依 canonical project configuration 宣告的 roots 檢查 static usage。

## Setup {#setup}

安裝 package：

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/eslint-config
```

```sh [npm]
npm install -D @pikacss/eslint-config
```

```sh [yarn]
yarn add -D @pikacss/eslint-config
```

:::

在 `eslint.config.mjs` 加入 async factory：

```ts
// eslint.config.mjs
import pikacss from '@pikacss/eslint-config'

export default [
  await pikacss(),
]
```

Factory 會從專案中探索 canonical PikaCSS config。需要明確指定路徑時，傳入 `config`：

```ts
import pikacss from '@pikacss/eslint-config'

export default [
  await pikacss({ config: './pika.config.mts' }),
]
```

Factory 會從同一份 config 推導 configured roots、readonly ESLint globals、scan ownership 與 private rule model。不要另外手動註冊 plugin 或各自設定 rule semantics。

## Rules {#rules}

### static-usage {#static-usage}

#### 說明 {#description}

`pikacss/static-usage` 會檢查 configured PikaCSS root 的直接呼叫。它會回報超出 compiler bounded-static subset 的 argument、非法的 compile-time root usage、出現在 owning scan scope 外的 root，以及跨 entry 的 root dependency。

#### 什麼算是靜態 {#what-counts-as-static}

Rule 使用三種 evaluator state：

- **Known**：值可由 source 與 lexical scope 完整決定。
- **Engine-dependent**：合法的 static-extension chain 需要 configured engine；compiler 會在 Prepare 階段檢查 terminal value。
- **Invalid**：expression 超出 bounded-static subset，ESLint 會直接回報。

Known value 包含：

- literal、遞迴靜態的 object／array，以及受支援的 operator；
- interpolation 都是 static primitive 的 template literal；
- global constants `undefined`、`NaN`、`Infinity`，但若被 local declaration shadow 則不算。

Static-extension chain 支援 dot access，以及可靜態求值成 string 或 number 的 computed key。若 key 本身來自另一個 extension，狀態會是 engine-dependent，因此 terminal value 與 type 仍以 compiler Prepare 為準。

以下情況屬於 **invalid**：

- 用一般 runtime variable 當作 computed extension key；
- 已知的 computed extension key 不是 string 或 number；
- function call、unsupported member usage 或 dynamic spread；
- template literal interpolation 是 dynamic 或 non-primitive value。

#### 範例 {#examples}

```ts
// ✅ Valid
pika({ color: 'red' })
pika({ 'color': 'red', '$:hover': { color: 'blue' } })
pika('flex-center')
pika({ color: pika['theme'].colors.primary })
pika({ color: pika[pika.keys.theme].colors.primary }) // compiler Prepare 會檢查 extension terminal
pika(true ? { color: 'white' } : { color: 'black' }) // static conditional

// ❌ Invalid — dynamic variable
const color = getColor()
pika({ color })

// ❌ Invalid — runtime binding used by a conditional
pika(isDark ? { color: 'white' } : { color: 'black' })

// ❌ Invalid — dynamic spread source
pika({ ...baseStyles })
```

## Migration {#migration}

- `pikacss/no-dynamic-args` 已移除；目前 factory 會啟用 `pikacss/static-usage`。
- 手動 `{ fnName }` factory option 已移除。Configured root name 來自 canonical PikaCSS project config；`config` 是唯一的 factory option。
- 舊 `.str`／`.arr` rule behavior 已移除；它們不是 `pikacss/static-usage` 的 variant。

## 下一步 {#next}

- [Integrations](/zh-tw/integrations/unplugin)：設定 PikaCSS build-tool integration。
- [使用方式](/zh-tw/getting-started/usage)：查看常見樣式寫法。

---
title: Engine Config
description: 設定 canonical PikaCSS project 與 Engine semantics。
relatedPackages:
  - '@pikacss/config'
  - '@pikacss/core'
relatedSources:
  - packages/config/src/types.ts
  - packages/core/src/types/engine.ts
  - packages/config/src/host-load.ts
category: getting-started
order: 40
translation:
  sourceFile: docs/getting-started/engine-config.md
  sourceBlob: a03429287462416b3b4b9672cc1b55b4789f0d7e
---

# Engine Config {#engine-config}

`pika.config.*` 是 PikaCSS project semantics唯一的公開來源。請從直接安裝的 outer package使用 `defineConfig()`；Engine-specific options放在 `engine`。

```ts
import { defineConfig } from '@pikacss/unplugin-pikacss'

export default defineConfig({
  fnName: 'pika',
  cssModule: 'pika.css',
  transformedFormat: 'string',
  engine: {},
})
```

## Project fields {#project-fields}

| Property | 說明 |
|---|---|
| `engine` | 此 entry的 `EngineConfig`。 |
| `fnName` | Compile-time callable root；single form預設 `'pika'`。 |
| `cssModule` | Logical runtime CSS module；single form預設 `'pika.css'`。 |
| `transformedFormat` | `'string'` 或 `'array'`；預設 `'string'`。 |
| `scan` | 此 entry的 source include/exclude patterns。 |
| `report` | Optional production report。 |
| `stateDir` | Single form的 whole-project generated-state root；預設 `.pikacss`。 |

設定檔內的相對 filesystem values 會以該設定檔目錄為基準。自動探索允許零個或剛好一個 canonical root config；若同時找到多個候選設定檔會直接報錯。

## Multi-entry projects {#multi-entry-projects}

```ts
import { defineConfig } from '@pikacss/unplugin-pikacss'

export default defineConfig([
  { fnName: 'pika', cssModule: 'pika.css', engine: {} },
  {
    fnName: 'adminPika',
    cssModule: 'admin-pika.css',
    scan: { include: 'admin/**/*.{ts,tsx,vue}' },
    engine: {},
  },
], {
  stateDir: '.pikacss',
})
```

Multi form 中 `fnName` 與 `cssModule` 必須在整份 config 內唯一。每個 entry 的 runtime/Engine partition 彼此隔離，但共用 project generated-state root。請在需要該 entry 樣式表的位置匯入各自的 logical CSS module。

## Engine fields {#engine-fields}

| Property | 說明 |
|---|---|
| `prefix` | Atomic class user prefix，預設 `'pk-'`。 |
| `defaultSelector` | Atomic selector template；`%` 是 atomic ID slot。 |
| `plugins` | Engine plugins。 |
| `layers` | CSS layer priority map。 |
| `defaultPreflightsLayer` | 未指定 layer 的 preflight output 所使用的預設 layer。 |
| `defaultUtilitiesLayer` | Atomic utilities 所使用的預設 layer。 |
| `preflights` | Base/preflight definitions。 |
| `cssImports` | CSS `@import` rules。 |
| `important` | `!important` policy。 |
| `selectors` | Selector semantics與其 Typegen metadata。 |
| `shortcuts` | Shortcut semantics與其 Typegen metadata。 |
| `variables` | Object-only local/external variables。 |
| `keyframes` | Object-only keyframe definitions。 |

現在沒有 project-wide `autocomplete` bucket。Editor suggestions 由能正確解釋語義的 domain 各自擁有：selector/shortcut definitions 提供 concrete autocomplete members，variables 使用 `suggest`，plugins 則透過所屬 subsystem 或 Typegen capability 貢獻 authoring metadata。

官方外掛會透過 `@pikacss/core` 擴充 `EngineConfig`；安裝對應的外掛 package 後，把它專屬的設定放在 `engine` 下。

## 範例 {#examples}

<<< @/zh-tw/.examples/getting-started/engine-config.example.ts


## 下一步 {#next}

- [ESLint 設定](/zh-tw/getting-started/eslint-config)
- [Customizations](/zh-tw/customizations/layers)
- [官方外掛](/zh-tw/official-plugins/reset)

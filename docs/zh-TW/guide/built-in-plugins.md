# 內建插件

`createEngine()` 在附加任何來自 `config.plugins` 的使用者插件之前，始終會載入五個核心插件。

## 核心插件

五個內建插件以固定順序在 `createEngine()` 內部建立：

| 順序 | 插件名稱 | 設定鍵 | 用途 |
|-------|------------|------------|---------|
| 1 | `core:important` | `important` | 在 CSS 值後附加 `!important` |
| 2 | `core:variables` | `variables` | 帶有清除功能的 CSS 自訂屬性 |
| 3 | `core:keyframes` | `keyframes` | `@keyframes` 動畫管理 |
| 4 | `core:selectors` | `selectors` | 選擇器別名解析 |
| 5 | `core:shortcuts` | `shortcuts` | 可重複使用的樣式捷徑 |

## 插件載入與排序

建立核心插件並附加使用者插件後，**所有插件會依其 `order` 屬性一起排序**：

| `order` 值 | 排序權重 | 執行時機 |
|---------------|-------------|--------|
| `'pre'` | 0 | 最先執行 |
| `undefined` | 1 | 預設值（核心插件使用此值） |
| `'post'` | 2 | 最後執行 |

<<< @/.examples/guide/plugin-loading-order.ts

::: warning
由於核心插件未設定 `order`（權重為 1），具有 `order: 'pre'` 的使用者插件會在核心插件**之前**執行。這對於在核心插件處理之前修改原始設定非常有用。
:::

## 鉤子執行流程

所有插件（核心與使用者的）都參與同一個鉤子流程，依排序順序執行：

```mermaid
flowchart LR
    A[configureRawConfig] --> B[rawConfigConfigured]
    B --> C[resolveConfig]
    C --> D[configureResolvedConfig]
    D --> E[configureEngine]
```

在執行階段，當樣式被處理時會觸發額外的鉤子：

- `transformSelectors` — 解析選擇器別名
- `transformStyleItems` — 解析捷徑字串
- `transformStyleDefinitions` — 展開 `__important` 與 `__shortcut`
- `preflightUpdated` — 變數／關鍵影格已變更
- `atomicStyleAdded` — 新的原子化樣式已被註冊
- `autocompleteConfigUpdated` — 自動補齊中繼資料已變更

## 設定內建插件

你可透過 `EngineConfig` 的頂層鍵來設定內建插件，而非匯入內部工廠函式：

<<< @/.examples/guide/built-in-plugins-config.ts

## 插件詳細頁面

- [Important](/zh-TW/guide/built-ins/important) — `!important` 管理
- [Variables](/zh-TW/guide/built-ins/variables) — CSS 自訂屬性
- [Keyframes](/zh-TW/guide/built-ins/keyframes) — `@keyframes` 動畫
- [Selectors](/zh-TW/guide/built-ins/selectors) — 選擇器別名
- [Shortcuts](/zh-TW/guide/built-ins/shortcuts) — 可重複使用的樣式捷徑

## 原始碼參考

- `packages/core/src/internal/engine.ts` — `createEngine()`、插件連接
- `packages/core/src/internal/plugin.ts` — `resolvePlugins()`、鉤子執行
- `packages/core/src/internal/plugins/` — 各個插件實作

## 下一步

- 查看 [設定](/zh-TW/guide/configuration)
- 了解 [插件系統概覽](/zh-TW/plugin-system/overview)
- 深入閱讀 [Variables](/zh-TW/guide/built-ins/variables)

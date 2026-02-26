# 插件系統概覽

PikaCSS 擁有強大的插件系統，讓你能在每個階段擴充引擎行為——從設定解析到樣式生成。插件是透過 `defineEnginePlugin()` 輔助函式建立的純物件。

## EnginePlugin 介面

每個插件都必須有 `name`，並可選擇性地定義 `order` 及鉤子函式：

<<< @/.examples/plugin-system/overview-engine-plugin-interface.ts

## 最小插件

最簡單的插件只需要一個 `name`：

<<< @/.examples/plugin-system/overview-minimal-plugin.ts

## 插件排序 {#plugin-ordering}

`order` 屬性控制插件鉤子相對於其他插件的執行時機：

| `order` 值 | 優先級 | 執行時機 |
|---|---|---|
| `'pre'` | 0 | 最先 |
| `undefined`（預設值）| 1 | 一般 |
| `'post'` | 2 | 最後 |

在相同優先級群組內，插件依照註冊順序執行。PikaCSS 的內建核心插件（例如 `core:variables`、`core:keyframes`、`core:selectors`、`core:shortcuts`、`core:important`）會在使用者插件之前載入，接著所有插件一起排序。

<<< @/.examples/plugin-system/overview-plugin-order.ts

## 鉤子生命週期 {#hook-lifecycle}

在 `createEngine(config)` 期間，鉤子依此順序呼叫：

```text
createEngine(config)
│
├─ 1. configureRawConfig    (async)  — Modify the raw config
├─ 2. rawConfigConfigured   (sync)   — Notification: raw config settled
├─ 3. configureResolvedConfig (async) — Modify the resolved config
├─ 4. configureEngine        (async)  — Modify/set up the engine instance
│
└─ Engine is ready
   │
   ├─ During engine.use(...):
   │   ├─ 5. transformStyleItems       (async) — Transform style items
   │   ├─ 6. transformSelectors        (async) — Transform selectors
   │   └─ 7. transformStyleDefinitions (async) — Transform style definitions
   │
   ├─ When preflights change:
   │   └─ 8. preflightUpdated          (sync)  — Notification
   │
   ├─ When atomic style is generated:
   │   └─ 9. atomicStyleAdded          (sync)  — Notification
   │
   └─ When autocomplete config changes:
       └─ 10. autocompleteConfigUpdated (sync)  — Notification
```

鉤子 1–4 在引擎建立期間只執行一次。鉤子 5–10 則在對應事件發生時於執行期執行。

## 非同步鉤子（轉換）{#async-hooks}

非同步鉤子接收一個 payload，並可**回傳修改後的版本**。修改後的 payload 接著會傳遞給下一個插件。若鉤子回傳 `void` 或 `undefined`，則當前 payload 保持不變。

<<< @/.examples/plugin-system/overview-async-hook.ts

### `configureRawConfig`

- **時機**：`createEngine()` 期間，設定解析之前
- **接收**：`config: EngineConfig` — 使用者的原始設定
- **回傳**：`EngineConfig | void`
- **用途**：在解析前新增插件、修改前綴、新增前置樣式或設定任何設定選項

### `configureResolvedConfig`

- **時機**：`createEngine()` 期間，設定解析之後
- **接收**：`resolvedConfig: ResolvedEngineConfig` — 已完全解析的設定
- **回傳**：`ResolvedEngineConfig | void`
- **用途**：修改已解析的值，如自動補齊設定或前置樣式清單

### `configureEngine`

- **時機**：`createEngine()` 期間，引擎實例建立之後
- **接收**：`engine: Engine` — 引擎實例
- **回傳**：`Engine | void`
- **用途**：設定執行期功能、新增前置樣式、配置自動補齊，或將自訂屬性附加至引擎

### `transformSelectors`

- **時機**：樣式提取期間（由 `engine.use()` 及前置樣式渲染觸發）
- **接收**：`selectors: string[]` — 正在處理的選擇器鏈
- **回傳**：`string[] | void`
- **用途**：重寫、擴展或替換選擇器（例如將 `$hover` 對應至 `&:hover`）

### `transformStyleItems`

- **時機**：`engine.use()` 期間，樣式項目解析之前
- **接收**：`styleItems: ResolvedStyleItem[]` — 樣式項目清單
- **回傳**：`ResolvedStyleItem[] | void`
- **用途**：新增、移除或轉換樣式項目（例如展開捷徑）

### `transformStyleDefinitions`

- **時機**：樣式提取期間，處理巢狀樣式定義時
- **接收**：`styleDefinitions: ResolvedStyleDefinition[]` — 樣式定義清單
- **回傳**：`ResolvedStyleDefinition[] | void`
- **用途**：在提取為原子化樣式之前修改樣式定義物件

## 同步鉤子（通知）{#sync-hooks}

同步鉤子**僅用於通知**——它們告知插件某件事已發生。它們**不應回傳值**。

<<< @/.examples/plugin-system/overview-sync-hook.ts

### `rawConfigConfigured`

- **時機**：`createEngine()` 期間，`configureRawConfig` 完成後
- **接收**：`config: EngineConfig` — 已確定的原始設定
- **用途**：讀取最終的原始設定（例如快取值以供其他鉤子後續使用）

### `preflightUpdated`

- **時機**：每當前置樣式被新增或修改時
- **接收**：無
- **用途**：回應前置樣式變更（例如觸發重新建構）

### `atomicStyleAdded`

- **時機**：每當新的原子化樣式被生成並儲存時
- **接收**：`atomicStyle: AtomicStyle` — `{ id: string, content: StyleContent }`
- **用途**：追蹤或記錄已生成的原子化樣式

### `autocompleteConfigUpdated`

- **時機**：每當自動補齊設定變更時
- **接收**：無
- **用途**：回應自動補齊變更（例如重建補齊資料）

## 鉤子執行模型 {#execution-model}

所有鉤子——包含非同步與同步——都遵循相同的執行規則：

1. **插件順序**：鉤子依排序順序逐一執行（`pre` → 預設 → `post`）
2. **Payload 串聯**：對於非同步鉤子，若插件回傳非空值，該值會取代傳遞給下一個插件的 payload
3. **錯誤隔離**：若插件的鉤子拋出錯誤，錯誤會被捕捉並記錄。執行繼續進行到下一個插件——單一插件失敗不會中斷整個鏈
4. **跳過**：若插件未定義特定鉤子，則直接跳過

## 完整範例 {#complete-example}

使用所有可用鉤子的完整插件：

<<< @/.examples/plugin-system/overview-full-plugin.ts

## 原始碼參考

- `packages/core/src/internal/plugin.ts` — `EnginePlugin` 介面、`defineEnginePlugin`、鉤子執行、插件排序
- `packages/core/src/internal/engine.ts` — `createEngine`、引擎生命週期中的鉤子呼叫

## 下一步

- 繼續閱讀[建立插件](/zh-TW/plugin-system/create-plugin)，取得建立自訂插件的逐步指南

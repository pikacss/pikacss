# Keyframes

`core:keyframes` 插件管理 CSS `@keyframes` 動畫。它將 `@keyframes` 規則產生為前置樣式 CSS，並為 `animationName` 和 `animation` 屬性提供自動補齊。

## 運作原理

1. 關鍵影格定義在 `rawConfigConfigured` 期間從 `config.keyframes.keyframes` 收集。
2. 在 `configureEngine` 期間，每個定義會被解析並註冊：
   - 為 `animationName` 和 `animation` 新增自動補齊條目。
   - 具有 `frames` 的條目儲存於 `engine.keyframes.store`。
3. 前置樣式函式掃描原子化樣式中的動畫參照，以確定哪些關鍵影格實際被使用。
4. 只有已使用的關鍵影格（或具有 `pruneUnused: false` 的）才會輸出至 CSS。

## 設定

```ts
interface KeyframesConfig {
  /** Array of keyframe definitions. */
  keyframes: Keyframes[]
  /** Whether to prune unused keyframes from CSS output. @default true */
  pruneUnused?: boolean
}
```

## 關鍵影格定義格式

PikaCSS 支援三種定義關鍵影格的形式：

### 1. 字串形式

僅為自動補齊登錄關鍵影格名稱——不會產生 `@keyframes` 區塊。

```ts
'external-animation'
```

### 2. 元組形式

```ts
type TupleForm = [name: string, frames?: KeyframesProgress, autocomplete?: string[], pruneUnused?: boolean]
```

### 3. 物件形式

```ts
interface ObjectForm { name: string, frames?: KeyframesProgress, autocomplete?: string[], pruneUnused?: boolean }
```

### `KeyframesProgress`

`frames` 物件將動畫停止點對應至 CSS 屬性：

- `from` — `0%` 的別名
- `to` — `100%` 的別名
- `` `${number}%` `` — 任意百分比停止點（例如 `'25%'`、`'50%'`）

## 完整範例

<<< @/.examples/guide/keyframes-config.ts

## 與 `pika()` 搭配使用

在 `animationName` 或 `animation` 簡寫中參照已定義的關鍵影格：

<<< @/.examples/guide/keyframes-usage.ts

產生的 CSS 輸出：

<<< @/.examples/guide/keyframes-output.css

## 清除未使用的關鍵影格

預設情況下，`pruneUnused` 為 `true`。只有名稱出現在 `animationName` 或 `animation` 原子化樣式值中的關鍵影格才會包含在 CSS 輸出中。

- **全域設定**：`keyframes.pruneUnused` 套用於所有條目。
- **逐關鍵影格覆寫**：在個別條目上設定 `pruneUnused`。
- 沒有 `frames` 的條目不會被輸出（它們只影響自動補齊）。

::: tip 動畫名稱偵測
未使用關鍵影格的偵測會掃描原子化樣式中的 `animation-name`（kebab-case）和 `animation` 屬性值。PikaCSS 在內部會將所有 CSS 屬性正規化為 kebab-case，因此無論你在 TypeScript 中使用哪種屬性形式，`pruneUnused` 都能正確運作。
:::

## 自動補齊

插件會自動註冊以下自動補齊值：

- `animationName` — 關鍵影格名稱（例如 `fade-in`）
- `animation` — 名稱後接空格（例如 `fade-in `），以提示輸入持續時間和緩動
- 自訂的 `autocomplete` 字串也會作為 `animation` 建議新增

## Engine API

插件可以用程式方式管理關鍵影格：

- `engine.keyframes.store` — 所有已註冊關鍵影格的 `Map<string, ResolvedKeyframesConfig>`
- `engine.keyframes.add(...list)` — 在執行階段新增關鍵影格定義（接受三種形式）

## `defineKeyframes()` 輔助函式

使用 `defineKeyframes()` 可獲得具備完整 TypeScript 自動補齊的型別安全關鍵影格定義。這是從 `@pikacss/core` 匯出的恆等函式，特別適合將動畫組織到獨立檔案中使用：

<<< @/.examples/guide/built-ins/keyframes-define-helper.ts

## 原始碼參考

- `packages/core/src/internal/plugins/keyframes.ts`

## 下一步

- 繼續閱讀 [Selectors](/zh-TW/guide/built-ins/selectors)

# Important

`core:important` 插件控制 CSS 屬性值是否附加 `!important` 旗標。它在 `transformStyleDefinitions` 鉤子期間運作。

## 運作原理

1. 插件在 `rawConfigConfigured` 期間從 `EngineConfig` 讀取 `important.default`。
2. 在 `transformStyleDefinitions` 期間，對每個樣式定義：
   - 若定義中明確設定了 `__important`，則使用該值。
   - 否則套用 `important.default` 的值（預設為 `false`）。
3. 當 important 為 `true` 時，定義中的每個屬性值都會附加 ` !important`——包括 fallback 陣列值。
4. `__important` 鍵在 CSS 輸出前始終會從定義中移除。
5. 巢狀選擇器物件保持不變——只有屬性值會被修改。

::: tip 防止重複 `!important`
插件絕不會產生重複的 `!important`。已以 `!important` 結尾的值會保持不變——生成的 CSS 中不會出現 `color: red !important !important`。
:::

## 設定

```ts
interface ImportantConfig {
  /**
   * When true, all CSS values get `!important` by default.
   * Individual definitions can override this with `__important`.
   * @default false
   */
  default?: boolean
}
```

## 基本用法

全域啟用所有樣式的 `!important`：

<<< @/.examples/guide/important-config.ts

所有產生的 CSS 都會包含 `!important`：

<<< @/.examples/guide/important-default-true-output.css

## 逐定義覆寫

使用 `__important` 額外屬性，在每個定義上覆寫全域預設值：

<<< @/.examples/guide/important-per-definition.ts

產生的輸出：

<<< @/.examples/guide/important-override-output.css

## `__important` 屬性

`__important` 是由插件註冊的特殊額外屬性。它接受 `boolean` 值，且**絕不會**輸出至 CSS。

| `__important` 值 | `important.default` | 結果 |
| --- | --- | --- |
| `true` | `false` | 套用 `!important` |
| `true` | `true` | 套用 `!important` |
| `false` | `false` | 不套用 `!important` |
| `false` | `true` | 不套用 `!important` |
| 未設定 | `false` | 不套用 `!important` |
| 未設定 | `true` | 套用 `!important` |

## 自動補齊

插件將 `__important` 作為額外屬性（附有 `boolean` 值）註冊，供 IDE 自動補齊使用。

## 原始碼參考

- `packages/core/src/internal/plugins/important.ts`

## Next

- 繼續閱讀 [Variables](/zh-TW/guide/built-ins/variables)

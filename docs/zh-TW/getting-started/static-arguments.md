# Static Arguments

這是 PikaCSS 最重要的限制。

`pika()` 會在 build-time 直接從原始碼裡被解析。也就是說，integration 必須在不執行應用程式的前提下，就看懂 argument 的形狀。如果 style 輸入依賴 runtime state，PikaCSS 就無法穩定地轉換它。

## 什麼是安全的

字面值 objects、arrays、strings、巢狀的字面值結構，以及穩定的組合方式，都是安全又理想的用法。

<<< @/.examples/zh-TW/community/faq-static-ok.ts

## 什麼是不安全的

runtime function calls、mutable state、computed member access，或是塞進 `pika()` 裡的任意 expressions，都會破壞 build-time 模型。

<<< @/.examples/zh-TW/community/faq-static-bad.ts

<<< @/.examples/zh-TW/integrations/eslint-invalid-example.ts

## 為什麼會有這個限制

PikaCSS 的價值，正是建立在這條邊界上：

- 它可以把原始碼轉成 deterministic atomic CSS。
- 它可以在事先知道 style 內容的前提下去重 declarations。
- 它可以產生 autocomplete 型別與 plugin 定義的 tokens。
- 它讓 runtime bundle 不需要承擔 styling 工作。

如果 engine 也接受任意 runtime values，這些保證就會一起失效。

## 建議替代方案

當你覺得自己需要 runtime style logic 時，請先試試下面這些模式：

1. 先宣告好 variants，然後在 runtime 切換 class names。
2. 把重複組合移進 shortcuts。
3. 把主題值或每個實例各自不同的值移進 CSS variables。
4. 把 state 差異移進像 `hover`、`focus` 之類的 selectors，或自訂 aliases。
5. 計算該用哪個靜態 style block，而不是在 runtime 去組出 block 內容。

::: tip 一個好的思考模型
在 runtime 選擇靜態 style definitions，而不是在 runtime 動態組出 style definitions。
:::

如果真正會變的是 value 本身，請接著看 [Dynamic Values 與 CSS Variables](/zh-TW/patterns/dynamic-values-with-css-variables)。

## 盡早強制這條規則

加入 ESLint integration，讓錯誤在 editor 與 CI 階段就先被攔下來，不要等到 build 輸出少東少西時才回頭找原因。

<<< @/.examples/zh-TW/integrations/eslint-valid-example.ts

## 該做與不該做

| 該做 | 不該做 |
| --- | --- |
| 先宣告 `primary`、`secondary`、`danger` 這類 style variants。 | 在 `pika()` 裡根據 API 資料臨時組出 style object。 |
| 用 CSS variables 承載主題值。 | 直接在呼叫裡讀取 runtime theme object。 |
| 用 selectors 與 shortcuts 收斂重複模式。 | 在每個 component 裡各自用臨時計算的 object 重寫同一套邏輯。 |

## Next

- [Zero Config](/zh-TW/getting-started/zero-config)
- [Dynamic Values 與 CSS Variables](/zh-TW/patterns/dynamic-values-with-css-variables)
- [ESLint](/zh-TW/integrations/eslint)
- [Component Styling](/zh-TW/patterns/component-styling)
- [Common Problems](/zh-TW/troubleshooting/common-problems)

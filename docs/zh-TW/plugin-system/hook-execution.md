# Hook Execution

如果你只記得 plugin hooks 的一件事，那就是：選擇「仍然能提供所需控制力」的最晚 hook。

這樣會讓 plugins 更容易理解，也能減少對其他 plugins 的意外干擾。

## Hook 決策表

| 需求 | Hook |
| --- | --- |
| 在 defaults 套用前修改 user config | `configureRawConfig` |
| 檢查或調整 resolved defaults | `configureResolvedConfig` |
| 呼叫 engine APIs 並註冊行為 | `configureEngine` |
| 在 extraction 前改寫 style items | `transformStyleItems` |
| 改寫 selector chains | `transformSelectors` |
| 改寫巢狀 style definitions | `transformStyleDefinitions` |
| 只觀察 engine events | sync notification hooks |

## Payload chaining

Async hooks 可以回傳新的 payload，而這個新 payload 會按照順序傳給下一個 plugin。

<<< @/.examples/zh-TW/plugin-system/overview-async-hook.ts

實際上意思很簡單：只要 plugin 會回傳轉換後的 payload，就該寫得明確而保守，因為後面的 plugins 看到的就是這份修改後結果。

## Error isolation

Hook errors 會被攔截並記錄，所以單一壞掉的 plugin 預設不會讓整條鏈完全中斷。這對韌性很好，但也代表如果你不去檢查 logs，plugin 的靜默失敗看起來就會像是功能缺失。

## Notification hooks 是拿來觀察的

Notification hooks 的存在，是讓 integrations 或 plugins 可以對 preflight 更新、atomic style generation、autocomplete 更新等變化做出反應。

<<< @/.examples/zh-TW/plugin-system/hook-notifications.ts

## 給 plugin authors 的實用規則

先從 `configureEngine` 開始。只有在具體限制逼迫你更早或更深入進入 transforms 時，才往前移。

## Next

- [Create A Plugin](/zh-TW/plugin-system/create-plugin)
- [Contributor Architecture](/zh-TW/contributors/architecture)
- [Built-in Plugins](/zh-TW/guide/built-in-plugins)
- [FAQ](/zh-TW/community/faq)

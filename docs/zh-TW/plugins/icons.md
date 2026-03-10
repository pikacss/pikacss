# Icons

`@pikacss/plugin-icons` 是把大型 icon sets 拉進同一套 build-time styling workflow 的最快方式，能直接融入你的 PikaCSS 系統。

## 什麼時候該用它

當你想要下面這些能力時，就用 icons plugin：

- icon names 能像 style-item strings 一樣使用
- 不需要 runtime icon component 的額外負擔
- 使用 Iconify collections
- 仍然能透過既有 styling model 進行主題化的 CSS 輸出

## Install

::: code-group
<<< @/.examples/zh-TW/plugins/icons-install.sh [pnpm]
<<< @/.examples/zh-TW/plugins/icons-install-npm.sh [npm]
<<< @/.examples/zh-TW/plugins/icons-install-yarn.sh [yarn]
:::

## 最小設定

<<< @/.examples/zh-TW/plugins/icons-basic-config.ts

## Usage

<<< @/.examples/zh-TW/plugins/icons-usage.ts

<<< @/.examples/zh-TW/plugins/icons-usage.vue

## 命名模型

預設命名模式會使用 `i-` prefix，加上 `collection:name`，例如 `i-mdi:home`。

這很有價值，因為 icons 會成為和 shortcuts、selectors 同一層級的靜態 authoring surface。團隊可以把它們當成一般的原始碼字串來 review，而不是另一套 runtime component system。

## 該做與不該做

| 該做 | 不該做 |
| --- | --- |
| 安裝你實際會用到的 icon collections。 | 假設所有遠端 icons 在 CI 中都一定會在無設定下解析成功。 |
| 在整個專案中維持一致的 icon naming conventions。 | 無理由地混用多種 prefixes 與臨時命名方式。 |
| 為常用 icons 使用 autocomplete。 | 期待人類能準確記住幾百個 icon names。 |

## 進階自訂

<<< @/.examples/zh-TW/plugins/icons-advanced-config.ts

<<< @/.examples/zh-TW/plugins/icons-custom-collections.ts

如果你想把自己的 SVG 檔案放在專案裡，也可以把 custom collection 指到指定目錄，並維持同樣的 `i-collection:name` 命名模型。

這是透過 Iconify 的 filesystem loader 完成的，所以應該放在 Vite、Nuxt 或 PikaCSS CLI 這類 Node-based build environment 裡設定。

<<< @/.examples/zh-TW/plugins/icons-directory-collection.ts

## Next

- [Reset](/zh-TW/plugins/reset)
- [Typography](/zh-TW/plugins/typography)
- [Create A Plugin](/zh-TW/plugin-system/create-plugin)
- [Configuration](/zh-TW/guide/configuration)

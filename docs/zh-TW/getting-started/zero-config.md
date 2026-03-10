# Zero Config

Zero-config 是最快把第一次 build 跑成功的方式，但對大多數應用程式來說，它通常不會是長期最理想的形態。

當專案裡還沒有 config file，而且 auto-create 已啟用時，integration 可以替你先建立一份：

<<< @/.examples/zh-TW/getting-started/auto-created-config.js

## 什麼情況下 zero-config 就夠了

如果你還在確認 engine 是否適合，而且目前只需要下面這些能力，zero-config 就很夠用：

- 單純的字面值 style objects。
- 不需要共用 selectors 或 shortcuts。
- 不需要自訂 variables。
- 不需要 external plugins。

## 什麼時候該停止依賴它

只要開始出現下面任一情況，就該補上一份正式的 config file：

- 重複出現的 responsive 或 theme selectors。
- 屬於 shortcuts 的共享 component recipes。
- 透過 CSS variables 管理的 design tokens。
- icons、reset 或 typography 這類官方 plugins。
- 團隊層級對 layers、prefixes 或 preflights 的慣例。

<<< @/.examples/zh-TW/getting-started/custom-config.ts

## 實用規則

可以把 zero-config 當成驗證 pipeline 的工具；真正要建立系統時，還是應該回到 config file。

::: warning 常見錯誤
不要把 zero-config 理解成「從此都不用設定」。那往往只會讓 selectors 一再重複、shortcuts 缺乏一致性，最後連 style 慣例都很難 review。
:::

## Next

- [Configuration](/zh-TW/guide/configuration)
- [Generated Files](/zh-TW/guide/generated-files)
- [Theming And Variables](/zh-TW/patterns/theming-and-variables)
- [Plugins: Reset](/zh-TW/plugins/reset)

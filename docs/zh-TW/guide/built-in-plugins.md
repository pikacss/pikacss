# Built-in Plugins

PikaCSS 內建了一組隨時可用的 engine capabilities。這些能力是透過 engine config 的頂層 keys 來設定，不是放在 external `plugins` array 裡。

## 內建集合

| Built-in plugin | 用途 |
| --- | --- |
| important | 全域與每個 definition 的 `!important` 行為 |
| variables | CSS custom properties、token scope 與 autocomplete |
| keyframes | animation 註冊與 autocomplete |
| selectors | pseudo states、media aliases 與自訂 selector 展開 |
| shortcuts | 可重用的 style recipes 與動態 shortcut patterns |

<<< @/.examples/zh-TW/guide/built-in-plugins-config.ts

## 為什麼要特別區分

第一次接觸 plugin 的人，常會以為所有 extension points 都該放進 `plugins`。其實只有 icons、reset、typography 這類 external plugins 才是這樣。

Built-in plugin config 之所以獨立存在，是因為這些行為本來就是 engine 的核心能力。

## 接下來可以深入的地方

- selectors 會在 [Responsive And Selectors](/zh-TW/patterns/responsive-and-selectors) 進一步說明
- variables 會在 [Theming And Variables](/zh-TW/patterns/theming-and-variables) 進一步說明
- engine 層級的設定方式在 [Configuration](/zh-TW/guide/configuration)
- extension APIs 會在 [Plugin System Overview](/zh-TW/plugin-system/overview) 說明

## Next

- [Configuration](/zh-TW/guide/configuration)
- [Responsive And Selectors](/zh-TW/patterns/responsive-and-selectors)
- [Theming And Variables](/zh-TW/patterns/theming-and-variables)
- [Plugin System Overview](/zh-TW/plugin-system/overview)

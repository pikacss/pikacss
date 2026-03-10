# Integrations Overview

PikaCSS 只有一個 engine，但可以接上多種 build-tool adapters。不同 integrations 的 authoring model 都一樣，差別只在設定方式。

## 選擇你的路徑

| 如果你使用的是 | 請前往 |
| --- | --- |
| Vite | [Vite](/zh-TW/integrations/vite) |
| Nuxt | [Nuxt](/zh-TW/integrations/nuxt) |
| 其他以 unplugin 驅動的 bundler | 先看 [Vite](/zh-TW/integrations/vite) 建立基本理解 |
| 想在 CI 或 editor 中強制靜態規則 | [ESLint](/zh-TW/integrations/eslint) |

## 快速理解方式

所有 integrations 都需要相同的概念組件：

1. 對 `pika()` 呼叫進行原始碼掃描
2. 載入 config 或自動建立 config
3. 產生 CSS 與型別
4. 為 `pika.css` 提供 virtual module 支援

<<< @/.examples/zh-TW/integrations/plugin-options.ts

## 不同 integration 之間會改變什麼

- plugin 如何註冊
- 檔案掃描如何嵌進 bundler
- framework-specific defaults
- dev server 更新如何在撰寫過程中呈現

## 推薦的第一個選擇

如果你可以自由選擇，先從 Vite 開始。它的設定最清楚，回饋迴圈也最快。

## Next

- [Vite](/zh-TW/integrations/vite)
- [Nuxt](/zh-TW/integrations/nuxt)
- [ESLint](/zh-TW/integrations/eslint)
- [Configuration](/zh-TW/guide/configuration)

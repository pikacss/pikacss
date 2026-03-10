# ESLint

ESLint integration 的存在，就是為了在 invalid `pika()` 輸入變成 build 困惑之前先攔住它。

## Install

::: code-group
<<< @/.examples/zh-TW/integrations/eslint-install.sh [pnpm]
<<< @/.examples/zh-TW/integrations/eslint-install-npm.sh [npm]
<<< @/.examples/zh-TW/integrations/eslint-install-yarn.sh [yarn]
:::

## 推薦設定

<<< @/.examples/zh-TW/integrations/eslint-recommended-config.mjs

## valid 用法長什麼樣子

<<< @/.examples/zh-TW/integrations/eslint-valid-example.ts

## invalid 用法長什麼樣子

<<< @/.examples/zh-TW/integrations/eslint-invalid-example.ts

## 為什麼值得強制執行

如果沒有 linting，團隊通常會太晚才發現靜態邊界，等到 style 輸出看起來遺失或不符合預期才開始追。加入 linting 之後，editor 與 CI 會持續強制正確的 authoring model。

::: tip 團隊建議
在 PikaCSS 的使用範圍超過一兩個檔案之前，就採用 ESLint rule。這比起在壞習慣形成後才回頭清理便宜得多。
:::

## Next

- [Static Arguments](/zh-TW/getting-started/static-arguments)
- [Common Problems](/zh-TW/troubleshooting/common-problems)
- [Configuration](/zh-TW/guide/configuration)
- [Plugin System Overview](/zh-TW/plugin-system/overview)

---
title: Keyframes
description: 使用 object-form 定義 CSS keyframes與 generated authoring metadata。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/plugins/keyframes.ts
category: customizations
order: 50
translation:
  sourceFile: docs/customizations/keyframes.md
  sourceBlob: d6337ee55b4e73b2f1272101d5a732b18bf25097
---

# Keyframes {#keyframes}

Keyframes 使用 object definitions；除非停用 pruning，否則只會輸出實際需要的 keyframes：

```ts
import { defineConfig } from '@pikacss/unplugin-pikacss'

export default defineConfig({
  engine: {
    keyframes: {
      definitions: [
        {
          name: 'fade-in',
          frames: {
            from: { opacity: '0' },
            to: { opacity: '1' },
          },
          animationValues: ['fade-in 0.3s ease-in-out'],
        },
        {
          name: 'slide-in',
          frames: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          description: 'Slide from the left',
        },
        {
          external: 'third-party-spin',
          animationValues: ['third-party-spin 1s linear infinite'],
          description: 'Defined by an external stylesheet',
        },
      ],
    },
  },
})
```

在一般 CSS property 中使用 keyframe name：

```ts
pika({ animation: 'fade-in 0.3s ease-in-out' })
```

Subsystem 也會透過 static Pika authoring surface 暴露已設定的 keyframes，供支援的 compile-time composition 使用；runtime usage 不會反向改寫 generated Typegen。

`animationValues` 可以為 local 或 external definition 補上完整的 `animation` 自動完成值。`{ external: 'name' }` 代表該 `@keyframes` 規則由其他 stylesheet 提供：它會參與 authoring／Typegen metadata，但 PikaCSS 不會輸出或 pruning 這條規則。

若 PikaCSS 自己管理的 local animation 也會被外部 CSS 使用，可在 definition 或 keyframes config 設定 `pruneUnused: false`。External definition 永遠不會被 PikaCSS pruning。

## 範例 {#examples}

<<< @/.examples/customizations/keyframes.example.ts


## 下一步 {#next}

- [Variables](/zh-tw/customizations/variables)
- [Selectors](/zh-tw/customizations/selectors)

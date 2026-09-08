---
title: Variables
description: 定義 object-only local/external CSS variables與 domain-owned suggestions。
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - packages/core/src/plugins/variables.ts
category: customizations
order: 40
translation:
  sourceFile: docs/customizations/variables.md
  sourceBlob: e0611bdc30cb9320d6b54e184335753a6b5277a4
---

# Variables {#variables}

Variables subsystem擁有 CSS custom-property semantics、pruning與 Typegen suggestions。Variable leaf只接受 object form。

## Local variables {#local-variables}

```ts
import { defineConfig } from '@pikacss/unplugin-pikacss'

export default defineConfig({
  engine: {
    variables: {
      definitions: {
        '--color-primary': { value: '#3b82f6' },
        '--spacing-md': { value: '1rem' },
        '--brand-color': {
          value: '#2563eb',
          description: 'Primary brand color',
          suggest: {
            asProperty: true,
            asValueOf: ['color', 'backgroundColor'],
          },
        },
      },
    },
  },
})
```

`suggest.asProperty` 控制 custom property本身是否成為 explicit Typegen member；`suggest.asValueOf` 控制哪些 CSS property value會建議 `var(--name)`，`'*'` 是明確 wildcard。

## External variables {#external-variables}

使用 `external: true` 表示變數由其他 stylesheet/runtime 提供。它會參與 authoring suggestions，但 PikaCSS 不會輸出它的 value：

```ts
variables: {
  definitions: {
    '--host-theme-color': {
      external: true,
      suggest: { asValueOf: ['color', 'backgroundColor'] },
    },
  },
}
```

## Selector scopes {#selector-scopes}

Non-variable key 會形成巢狀 selector scope：

```ts
variables: {
  definitions: {
    ':root': {
      '--color-bg': { value: '#ffffff' },
    },
    '.dark': {
      '--color-bg': { value: '#1a1a1a' },
    },
  },
}
```

## Pruning {#pruning}

Local variable 預設會被 pruning，除非目前輸出的 CSS／preflight 直接或間接引用到它。當外部 CSS 無論目前 Pika usage 為何都需要某個由 PikaCSS 管理的變數時，可用 leaf-level `pruneUnused: false`、`safeList` 或 config-level `pruneUnused: false` 保留。

```ts
variables: {
  definitions: {
    '--always': { value: '1rem', pruneUnused: false },
  },
  safeList: ['--always'],
}
```

一般使用方式不變：

```ts
pika({ color: 'var(--color-primary)' })
```

## 範例 {#examples}

<<< @/.examples/customizations/variables.example.ts


## 下一步 {#next}

- [Keyframes](/zh-tw/customizations/keyframes)
- [Autocomplete](/zh-tw/customizations/autocomplete)

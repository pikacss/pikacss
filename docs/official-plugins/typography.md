---
title: Typography
description: Semantic prose styling for long-form content with the typography plugin.
relatedPackages:
  - '@pikacss/plugin-typography'
relatedSources:
  - 'packages/plugin-typography/src/index.ts'
category: official-plugins
order: 20
---

# Typography

Semantic typography styles for long-form prose content.

The typography plugin provides a set of `prose-*` shortcuts that style long-form HTML content (articles, blog posts, documentation) with sensible typographic defaults.

::: code-group

```sh [pnpm]
pnpm add -D @pikacss/plugin-typography
```

```sh [npm]
npm install -D @pikacss/plugin-typography
```

```sh [yarn]
yarn add -D @pikacss/plugin-typography
```

:::

```ts
import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
  plugins: [typography()],
})
```

Available shortcuts:

| Shortcut | Purpose |
|----------|---------|
| `prose` | Base prose styling — applies all component styles |
| `prose-paragraphs` | Paragraph spacing and line height |
| `prose-links` | Link colors and underline |
| `prose-emphasis` | Bold and italic styling |
| `prose-kbd` | Keyboard input styling |
| `prose-lists` | Ordered and unordered list styling |
| `prose-hr` | Horizontal rule styling |
| `prose-headings` | Heading sizes and spacing |
| `prose-quotes` | Blockquote styling |
| `prose-media` | Image and video styling |
| `prose-code` | Inline code and code block styling |
| `prose-tables` | Table styling |

Size variants:

| Shortcut | Purpose |
|----------|---------|
| `prose-sm` | Small prose sizing |
| `prose-lg` | Large prose sizing |
| `prose-xl` | Extra large prose sizing |
| `prose-2xl` | Double extra large prose sizing |

Usage:

```ts
pika('prose')
pika('prose', 'prose-lg')
```

All prose styles use `--pk-prose-*` CSS variables for customization.

## Config

| Property | Description |
|---|---|
| variables | CSS variable overrides for typography styling using the `--pk-prose-*` namespace. |

> See [API Reference — Plugin Typography](/api/plugin-typography) for full type signatures and defaults.

## Next

- [Icons](/official-plugins/icons) — icon integration via Iconify.
- [Fonts](/official-plugins/fonts) — web font loading.

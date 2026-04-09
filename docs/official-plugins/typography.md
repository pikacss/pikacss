---
title: Typography
description: Semantic prose styling for long-form content with the typography plugin.
relatedPackages:
  - '@pikacss/plugin-typography'
relatedSources:
  - 'packages/plugin-typography/src/index.ts'
  - 'packages/plugin-typography/src/styles.ts'
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

<<< @/.examples/official-plugins/typography.setup.example.ts

Available shortcuts:

| Shortcut | Purpose |
|----------|---------|
| `prose-base` | Base prose container styles shared by the other `prose-*` shortcuts |
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

The typography shortcuts are regular `pika()` inputs. For example, you can apply a focused module shortcut like this:

::: code-group

<<< @/.examples/official-plugins/typography.usage.example.pikain.ts [Input]

<<< @/.examples/official-plugins/typography.usage.example.pikaout.css [Output]

:::

Prose color roles use `--pk-prose-color-*` CSS variables such as `--pk-prose-color-body`, `--pk-prose-color-links`, and `--pk-prose-color-headings`. Keyboard key shadows use `--pk-prose-kbd-shadows`.

## Config

Configure the plugin through the top-level `typography` key in your engine config.

| Property | Description |
|---|---|
| variables | Nested under `typography`. CSS variable overrides for the registered prose variables, including the `--pk-prose-color-*` set and `--pk-prose-kbd-shadows`. |

<<< @/.examples/official-plugins/typography.config.example.ts

> See [API Reference — Plugin Typography](/api/plugin-typography) for full type signatures and defaults.

## Next

- [Icons](/official-plugins/icons) — icon integration via Iconify.
- [Fonts](/official-plugins/fonts) — web font loading.

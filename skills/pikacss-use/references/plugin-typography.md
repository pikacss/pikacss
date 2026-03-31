# Plugin: Typography

> Read this when the user asks about prose styles, typographic defaults for content-rich pages, or the typography plugin.

## Installation

```bash
pnpm add -D @pikacss/plugin-typography
```

## Setup

```ts
// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
  plugins: [typography()],
})
```

## Usage in pika()

Apply the `prose` shortcut to a content container:

```vue
<article :class="pika('prose')">
  <h1>My Article</h1>
  <p>This content gets typographic styling automatically.</p>
</article>
```

### Available Shortcuts

| Shortcut | Purpose |
|---|---|
| `prose` | All prose styles (combines all modules below) |
| `prose-base` | Base typography (body text) |
| `prose-paragraphs` | Paragraph spacing |
| `prose-links` | Link styling |
| `prose-emphasis` | Bold/italic styling |
| `prose-kbd` | Keyboard input styling |
| `prose-lists` | List styling (ul, ol) |
| `prose-hr` | Horizontal rule styling |
| `prose-headings` | Heading hierarchy (h1–h6) |
| `prose-quotes` | Blockquote styling |
| `prose-media` | Image/video/figure styling |
| `prose-code` | Inline and block code styling |
| `prose-tables` | Table styling |

### Size Variants

| Shortcut | Effect |
|---|---|
| `prose-sm` | Smaller font-size and line-height |
| `prose-lg` | Larger font-size and line-height |
| `prose-xl` | Extra large |
| `prose-2xl` | Double extra large |

Combine with base: `pika('prose', 'prose-lg')`

## Customization

Override default CSS custom properties via the `typography` config key:

```ts
export default defineEngineConfig({
  typography: {
    variables: {
      '--pk-prose-body': '#1a1a1a',
      '--pk-prose-headings': '#111',
      '--pk-prose-links': '#2563eb',
      '--pk-prose-code': '#e11d48',
    },
  },
  plugins: [typography()],
})
```

All typography styling uses `--pk-prose-*` CSS custom properties, so colors and spacing can be overridden without touching the plugin source.

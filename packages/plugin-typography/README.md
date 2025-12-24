# @pikacss/plugin-typography

Beautiful typographic defaults for HTML you don't control.

## Installation

```bash
pnpm add @pikacss/plugin-typography
```

## Quick Start

```typescript
import { createEngine } from '@pikacss/core'
import { createTypographyPlugin } from '@pikacss/plugin-typography'

const engine = await createEngine({
  plugins: [createTypographyPlugin()]
})
```

```html
<article class="prose">
  <h1>Your Article Title</h1>
  <p>Your content goes here...</p>
</article>
```

## Features

- 🎨 Beautiful typographic defaults
- 📏 Multiple size modifiers (sm, lg, xl, 2xl)
- 🎯 Semantic HTML element styling
- 🔧 Fully customizable via CSS variables
- 🌙 Dark mode support through CSS variables
- 📦 Zero dependencies (except @pikacss/core)

## Usage

### Size Modifiers

```html
<!-- Default size (1rem / 16px) -->
<article class="prose">...</article>

<!-- Small (0.875rem / 14px) -->
<article class="prose-sm">...</article>

<!-- Large (1.125rem / 18px) -->
<article class="prose-lg">...</article>

<!-- Extra Large (1.25rem / 20px) -->
<article class="prose-xl">...</article>

<!-- 2X Large (1.5rem / 24px) -->
<article class="prose-2xl">...</article>
```

### Customization

Override color variables when creating the plugin:

```typescript
createTypographyPlugin({
  variables: {
    '--pk-prose-color-body': '#374151',
    '--pk-prose-color-headings': '#111827',
    '--pk-prose-color-links': '#2563eb',
  }
})
```

### Dark Mode

Implement dark mode by overriding CSS variables:

```css
@media (prefers-color-scheme: dark) {
  .prose {
    --pk-prose-color-body: #d1d5db;
    --pk-prose-color-headings: #fff;
    --pk-prose-color-links: #60a5fa;
  }
}
```

## Styled Elements

This plugin provides styles for:

- **Typography**: `p`, `h1-h4`, `a`, `strong`, `em`, `blockquote`
- **Lists**: `ul`, `ol`, `li`, `dl`, `dt`, `dd`
- **Code**: `code`, `pre`, `kbd`
- **Media**: `img`, `video`, `figure`, `figcaption`, `picture`
- **Tables**: `table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`
- **Other**: `hr`

## Documentation

For complete documentation, visit: [PikaCSS Documentation](https://pikacss.dev)

## License

MIT © DevilTea

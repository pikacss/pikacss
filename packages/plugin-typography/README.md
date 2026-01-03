# @pikacss/plugin-typography

Beautiful typographic defaults for HTML you don't control.

## Installation

```bash
pnpm add @pikacss/plugin-typography
```

## Quick Start

**pika.config.ts**:
```typescript
import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
  plugins: [typography()]
})
```

**Your HTML**:
```html
<article class="prose">
  <h1>Your Article Title</h1>
  <p>Your content goes here...</p>
</article>
```

## Features

- 🎨 Beautiful typographic defaults
- � Modular shortcuts for granular control
- 📏 Multiple size modifiers (sm, lg, xl, 2xl)
- 🎯 Semantic HTML element styling
- 🔧 Fully customizable via CSS variables
- 🌙 Dark mode support through CSS variables
- ⚡ Automatic style deduplication
- 🔌 Zero dependencies (except @pikacss/core)

## Usage

### Complete Prose Style

Use `prose` for all typography styles:

```html
<article class="prose">
  <h1>Your Article Title</h1>
  <p>Your content goes here...</p>
</article>
```

### Modular Shortcuts

PikaCSS typography plugin provides modular shortcuts that you can mix and match according to your needs.

**Important:** Each modular shortcut automatically includes `prose-base` styles, so you don't need to add it manually. The engine will automatically deduplicate styles when combining multiple shortcuts.

#### Why Modular?

- ✅ **Smaller CSS Bundle**: Only include the styles you actually use
- ✅ **Better Performance**: Less CSS to parse and apply
- ✅ **More Flexible**: Combine exactly what you need for each section
- ✅ **Easier Debugging**: Know exactly which styles are applied
- ✅ **Better Control**: Avoid style conflicts with unused elements

#### Available Modular Shortcuts

Each shortcut automatically includes `prose-base` for consistent styling:

- `prose-base` - Base styles (color, max-width, font-size, line-height)
- `prose-paragraphs` - Paragraph and lead text styles (includes `prose-base`)
- `prose-links` - Link styles (includes `prose-base`)
- `prose-emphasis` - Strong and em styles (includes `prose-base`)
- `prose-kbd` - Keyboard input styles (includes `prose-base`)
- `prose-lists` - List styles (ul, ol, li, dl, dt, dd) (includes `prose-base`)
- `prose-hr` - Horizontal rule styles (includes `prose-base`)
- `prose-headings` - Heading styles (h1-h4) (includes `prose-base`)
- `prose-quotes` - Blockquote styles (includes `prose-base`)
- `prose-media` - Media styles (img, video, figure, figcaption) (includes `prose-base`)
- `prose-code` - Code and pre styles (includes `prose-base`)
- `prose-tables` - Table styles (includes `prose-base`)
- `prose` - Complete prose (combination of all above)

#### Usage Examples

```html
<!-- Minimal blog post - just headings and paragraphs -->
<article class="prose-headings prose-paragraphs">
  <h1>Blog Post Title</h1>
  <p>Just simple text content.</p>
</article>

<!-- Technical documentation - headings, code, and lists -->
<article class="prose-headings prose-code prose-lists">
  <h1>API Documentation</h1>
  <pre><code>npm install package-name</code></pre>
  <ul>
    <li>Feature 1</li>
    <li>Feature 2</li>
  </ul>
</article>

<!-- Rich blog content - multiple elements -->
<article class="prose-headings prose-paragraphs prose-links prose-emphasis prose-quotes prose-media">
  <h1>Travel Blog</h1>
  <p>I recently visited <strong>Japan</strong> and it was <em>amazing</em>!</p>
  <blockquote>
    <p>Travel is the only thing you buy that makes you richer.</p>
  </blockquote>
  <figure>
    <img src="photo.jpg" alt="Scenery">
    <figcaption>Mount Fuji at sunrise</figcaption>
  </figure>
</article>

<!-- Data table document -->
<article class="prose-headings prose-paragraphs prose-tables">
  <h1>Sales Report</h1>
  <p>Q4 2023 results</p>
  <table>
    <!-- table content -->
  </table>
</article>

<!-- Keyboard shortcuts guide -->
<article class="prose-headings prose-lists prose-kbd">
  <h1>Keyboard Shortcuts</h1>
  <ul>
    <li>Save: <kbd>Cmd</kbd> + <kbd>S</kbd></li>
    <li>Copy: <kbd>Cmd</kbd> + <kbd>C</kbd></li>
  </ul>
</article>
```

#### Common Combinations

**Blog Post**:
```html
class="prose-headings prose-paragraphs prose-links prose-emphasis prose-lists"
```

**Technical Documentation**:
```html
class="prose-headings prose-paragraphs prose-code prose-lists prose-links"
```

**News Article**:
```html
class="prose-headings prose-paragraphs prose-links prose-quotes prose-media"
```

**Data Page**:
```html
class="prose-headings prose-paragraphs prose-tables"
```

**Simple Landing Page**:
```html
class="prose-headings prose-paragraphs"
```

### Size Modifiers

Size modifiers apply the complete `prose` styles with different font sizes:

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

**pika.config.ts**:
```typescript
import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
  plugins: [
    typography({
      variables: {
        '--pk-prose-color-body': '#374151',
        '--pk-prose-color-headings': '#111827',
        '--pk-prose-color-links': '#2563eb',
      }
    })
  ]
})
```

#### Available CSS Variables

```css
--pk-prose-color-body          /* Body text color */
--pk-prose-color-headings      /* Heading text color */
--pk-prose-color-lead          /* Lead paragraph color */
--pk-prose-color-links         /* Link color */
--pk-prose-color-bold          /* Bold text color */
--pk-prose-color-counters      /* List counter color */
--pk-prose-color-bullets       /* List bullet color */
--pk-prose-color-hr            /* Horizontal rule color */
--pk-prose-color-quotes        /* Blockquote text color */
--pk-prose-color-quote-borders /* Blockquote border color */
--pk-prose-color-captions      /* Image caption color */
--pk-prose-color-code          /* Inline code color */
--pk-prose-color-pre-code      /* Code block text color */
--pk-prose-color-pre-bg        /* Code block background */
--pk-prose-color-th-borders    /* Table header border color */
--pk-prose-color-td-borders    /* Table cell border color */
--pk-prose-color-kbd           /* Keyboard input color */
--pk-prose-kbd-shadows         /* Keyboard input shadow color */
```

### Dark Mode

Implement dark mode by overriding CSS variables:

```css
@media (prefers-color-scheme: dark) {
  .prose {
    --pk-prose-color-body: #d1d5db;
    --pk-prose-color-headings: #fff;
    --pk-prose-color-links: #60a5fa;
    --pk-prose-color-quote-borders: #374151;
    --pk-prose-color-pre-bg: #1f2937;
  }
}
```

## Styled Elements

This plugin provides modular styles for:

- **Base**: Container styles (max-width, font size, line height)
- **Paragraphs**: `p`, lead text (`[class~="lead"]`)
- **Links**: `a`
- **Emphasis**: `strong`, `em`
- **Keyboard**: `kbd`
- **Lists**: `ul`, `ol`, `li`, `dl`, `dt`, `dd`
- **Horizontal Rule**: `hr`
- **Headings**: `h1`, `h2`, `h3`, `h4`
- **Quotes**: `blockquote`
- **Media**: `img`, `video`, `figure`, `figcaption`, `picture`
- **Code**: `code`, `pre`
- **Tables**: `table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`

## Architecture

The plugin uses a modular architecture with automatic deduplication:

- Each modular shortcut is registered with `prose-base` included
- When combining multiple shortcuts, the engine automatically deduplicates `prose-base`
- The `prose` shortcut combines all modular shortcuts using shortcut names
- This ensures optimal performance and consistent styling

## Performance

Using modular shortcuts can significantly reduce CSS bundle size:

```html
<!-- Full prose: ~100% of typography CSS -->
<article class="prose">...</article>

<!-- Modular: ~30-40% of typography CSS (depending on combination) -->
<article class="prose-headings prose-paragraphs prose-links">...</article>
```

## Documentation

For complete documentation, visit: [PikaCSS Documentation](https://pikacss.dev)

## License

MIT © DevilTea

# Typography Plugin

The Typography plugin provides a set of `prose` classes that you can use to add beautiful typographic defaults to any vanilla HTML you don't control (like HTML rendered from Markdown, or pulled from a CMS).

## Installation

```bash
pnpm add @pikacss/plugin-typography
```

## Usage

Register the plugin in your PikaCSS configuration:

**pika.config.ts**:
```ts
import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
  plugins: [typography()]
})
```

Now you can use the `prose` class in your HTML:

```html
<article class="prose">
  <h1>Garlic bread with cheese: What the science tells us</h1>
  <p>
    For years parents have punctuated their child's education with devestating arguments about the relative merits of fruit and vegetables.
  </p>
  <!-- ... -->
</article>
```

## Modular Shortcuts

The Typography plugin provides modular shortcuts that you can mix and match to include only the styles you need.

**Important:** Each modular shortcut (except `prose-base` itself) automatically includes `prose-base` styles, so you don't need to add it manually. The PikaCSS engine will automatically deduplicate styles when combining multiple shortcuts.

### Why Modular?

- ✅ **Smaller CSS Bundle**: Only include the styles you actually use
- ✅ **Better Performance**: Less CSS to parse and apply  
- ✅ **More Flexible**: Combine exactly what you need for each section
- ✅ **Easier Debugging**: Know exactly which styles are applied
- ✅ **Better Control**: Avoid style conflicts with unused elements

### Available Shortcuts

- **`prose-base`** - Base container styles (color, max-width, font-size, line-height)
- **`prose-paragraphs`** - Paragraph and lead text styles (includes `prose-base`)
- **`prose-links`** - Link styles (includes `prose-base`)
- **`prose-emphasis`** - Strong and em styles (includes `prose-base`)
- **`prose-kbd`** - Keyboard input styles (includes `prose-base`)
- **`prose-lists`** - List styles (ul, ol, li, dl, dt, dd) (includes `prose-base`)
- **`prose-hr`** - Horizontal rule styles (includes `prose-base`)
- **`prose-headings`** - Heading styles (h1-h4) (includes `prose-base`)
- **`prose-quotes`** - Blockquote styles (includes `prose-base`)
- **`prose-media`** - Media styles (img, video, figure, figcaption) (includes `prose-base`)
- **`prose-code`** - Code and pre styles (includes `prose-base`)
- **`prose-tables`** - Table styles (includes `prose-base`)
- **`prose`** - Complete prose (combination of all above)

### Usage Examples

```html
<!-- Minimal blog post - headings + paragraphs -->
<article class="prose-headings prose-paragraphs">
  <h1>Simple Article</h1>
  <p>Just text content without lists, code, or other elements.</p>
</article>

<!-- Technical documentation - headings + code + lists -->
<article class="prose-headings prose-code prose-lists">
  <h1>API Documentation</h1>
  <pre><code>npm install package-name</code></pre>
  <ul>
    <li>Feature 1</li>
    <li>Feature 2</li>
  </ul>
</article>

<!-- Rich blog content -->
<article class="prose-headings prose-paragraphs prose-links prose-emphasis prose-quotes prose-media">
  <h1>Blog Post</h1>
  <p>Content with <a href="#">links</a> and <strong>emphasis</strong>.</p>
  <blockquote>
    <p>A quote</p>
  </blockquote>
  <figure>
    <img src="photo.jpg" alt="Photo">
    <figcaption>Caption</figcaption>
  </figure>
</article>

<!-- Data table document -->
<article class="prose-headings prose-paragraphs prose-tables">
  <h1>Sales Report</h1>
  <table>
    <!-- table content -->
  </table>
</article>

<!-- Keyboard shortcuts guide -->
<article class="prose-headings prose-lists prose-kbd">
  <h1>Keyboard Shortcuts</h1>
  <ul>
    <li>Save: <kbd>Cmd</kbd> + <kbd>S</kbd></li>
  </ul>
</article>
```

### Common Combinations

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

## Performance

Using modular shortcuts can significantly reduce CSS bundle size:

```html
<!-- Full prose: ~100% of typography CSS -->
<article class="prose">...</article>

<!-- Modular: ~30-40% of typography CSS (depending on combination) -->
<article class="prose-headings prose-paragraphs prose-links">...</article>
```

## Size Modifiers

The plugin includes size modifiers that apply the complete `prose` styles with different font sizes:

- `prose` (default, 1rem / 16px)
- `prose-sm` (0.875rem / 14px)
- `prose-lg` (1.125rem / 18px)
- `prose-xl` (1.25rem / 20px)
- `prose-2xl` (1.5rem / 24px)

Each size modifier includes all prose styles and can be used independently:

```html
<!-- ✅ Correct: Use size modifier directly -->
<article class="prose-xl">
  <!-- ... -->
</article>

<!-- ❌ Not needed: Don't combine with base prose -->
<article class="prose prose-xl">
  <!-- ... -->
</article>
```

## Customization

You can customize the typography color variables when initializing the plugin:

**pika.config.ts**:
```ts
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

### Available Color Variables

All color-related variables use the `--pk-prose-color-*` prefix:

| Variable | Default | Description |
| --- | --- | --- |
| `--pk-prose-color-body` | `currentColor` | Body text color |
| `--pk-prose-color-headings` | `currentColor` | Heading text color |
| `--pk-prose-color-lead` | `currentColor` | Lead paragraph color |
| `--pk-prose-color-links` | `currentColor` | Link color |
| `--pk-prose-color-bold` | `currentColor` | Bold text color |
| `--pk-prose-color-counters` | `currentColor` | Ordered list counter color |
| `--pk-prose-color-bullets` | `currentColor` | Unordered list bullet color |
| `--pk-prose-color-hr` | `currentColor` | Horizontal rule color |
| `--pk-prose-color-quotes` | `currentColor` | Blockquote text color |
| `--pk-prose-color-quote-borders` | `currentColor` | Blockquote border color |
| `--pk-prose-color-captions` | `currentColor` | Figure caption color |
| `--pk-prose-color-code` | `currentColor` | Inline code color |
| `--pk-prose-color-pre-code` | `currentColor` | Code block text color |
| `--pk-prose-color-pre-bg` | `transparent` | Code block background |
| `--pk-prose-color-th-borders` | `currentColor` | Table header border color |
| `--pk-prose-color-td-borders` | `currentColor` | Table cell border color |
| `--pk-prose-color-kbd` | `currentColor` | Keyboard input color |

### Non-color Variables

| Variable | Default | Description |
| --- | --- | --- |
| `--pk-prose-kbd-shadows` | `currentColor` | Keyboard input shadow color |

## Dark Mode Support

Implement dark mode by overriding the color variables in your CSS:

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

Or use a class-based approach:

```css
.dark .prose {
  --pk-prose-color-body: #d1d5db;
  --pk-prose-color-headings: #fff;
  --pk-prose-color-links: #60a5fa;
}
```

## Styled Elements

The plugin styles the following HTML elements:

- **Base**: Container styles (max-width, font size, line height)
- **Paragraphs**: `p`, `[class~="lead"]`
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
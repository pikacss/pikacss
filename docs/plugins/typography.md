# Typography Plugin

The Typography plugin provides a set of `prose` classes that you can use to add beautiful typographic defaults to any vanilla HTML you don't control (like HTML rendered from Markdown, or pulled from a CMS).

## Installation

```bash
pnpm add @pikacss/plugin-typography
```

## Usage

Register the plugin in your PikaCSS configuration:

```ts
import { createEngine } from '@pikacss/core'
import { createTypographyPlugin } from '@pikacss/plugin-typography'

const engine = await createEngine({
  plugins: [
    createTypographyPlugin()
  ]
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

## Size Modifiers

The plugin includes four size modifiers that automatically inherit all `prose` styles:

- `prose` (default, 1rem / 16px)
- `prose-sm` (0.875rem / 14px)
- `prose-lg` (1.125rem / 18px)
- `prose-xl` (1.25rem / 20px)
- `prose-2xl` (1.5rem / 24px)

Each size modifier can be used independently without needing to combine with the base `prose` class:

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

```ts
createTypographyPlugin({
  variables: {
    '--pk-prose-color-body': '#374151',
    '--pk-prose-color-headings': '#111827',
    '--pk-prose-color-links': '#2563eb',
  }
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

While this plugin doesn't include a built-in `prose-invert` class, you can easily implement dark mode by overriding the color variables in your CSS:

```css
@media (prefers-color-scheme: dark) {
  .prose {
    --pk-prose-color-body: #d1d5db;
    --pk-prose-color-headings: #fff;
    --pk-prose-color-links: #60a5fa;
    --pk-prose-color-code: #fff;
    --pk-prose-color-pre-bg: rgba(0, 0, 0, 0.5);
    /* ... customize other colors as needed */
  }
}
```

Or use a class-based approach:

```css
.dark .prose {
  --pk-prose-color-body: #d1d5db;
  --pk-prose-color-headings: #fff;
  /* ... */
}
```
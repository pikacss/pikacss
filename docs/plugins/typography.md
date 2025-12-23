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

The plugin includes five size modifiers:

- `prose-sm`
- `prose-base` (default)
- `prose-lg`
- `prose-xl`
- `prose-2xl`

```html
<article class="prose prose-xl">
  <!-- ... -->
</article>
```

## Dark Mode

Use the `prose-invert` class to swap the colors for dark mode:

```html
<article class="prose prose-invert">
  <!-- ... -->
</article>
```

## Customization

You can customize the typography variables when initializing the plugin:

```ts
createTypographyPlugin({
  variables: {
    '--pk-prose-body': '#374151',
    '--pk-prose-headings': '#111827',
    '--pk-prose-links': '#2563eb',
  }
})
```

### Available Variables

| Variable | Default |
| --- | --- |
| `--pk-prose-body` | `currentColor` |
| `--pk-prose-headings` | `currentColor` |
| `--pk-prose-links` | `currentColor` |
| `--pk-prose-lists` | `currentColor` |
| `--pk-prose-hr` | `currentColor` |
| `--pk-prose-captions` | `currentColor` |
| `--pk-prose-code` | `currentColor` |
| `--pk-prose-pre-code` | `currentColor` |
| `--pk-prose-pre-bg` | `transparent` |
| `--pk-prose-quotes` | `currentColor` |
| `--pk-prose-bold` | `inherit` |
| `--pk-prose-counters` | `currentColor` |
| `--pk-prose-bullets` | `currentColor` |
| `--pk-prose-th-borders` | `currentColor` |
| `--pk-prose-td-borders` | `currentColor` |

For dark mode (`prose-invert`), you can also override the invert variables:

- `--pk-prose-invert-body`
- `--pk-prose-invert-headings`
- ... and so on.

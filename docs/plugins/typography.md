# Typography Plugin

`@pikacss/plugin-typography` provides beautiful typographic defaults for prose content. It registers CSS variables and a set of modular shortcuts that style headings, paragraphs, links, code blocks, tables, and more — similar to Tailwind CSS Typography but built for PikaCSS.

## Installation

::: code-group
<<< @/.examples/plugins/typography-install.sh [pnpm]
<<< @/.examples/plugins/typography-install-npm.sh [npm]
<<< @/.examples/plugins/typography-install-yarn.sh [yarn]
:::

## Basic Usage

<<< @/.examples/plugins/typography-basic-config.ts

Then use the `prose` shortcut in your components:

<<< @/.examples/plugins/typography-usage-prose.ts

## Config Field

This plugin augments `EngineConfig` with a `typography` field via [module augmentation](/plugin-system/overview):

<<< @/.examples/plugins/typography-engine-config-interface.ts

## Customizing Variables

All visual aspects of prose typography are controlled by CSS variables. You can override any of them via the `typography.variables` option:

<<< @/.examples/plugins/typography-custom-variables.ts

### CSS Variables Reference

The plugin registers 18 CSS variables. All default to `currentColor` (or `transparent` for backgrounds), so prose content inherits your page's color scheme out of the box.

| Variable | Default | Description |
| --- | --- | --- |
| `--pk-prose-color-body` | `currentColor` | Body text color |
| `--pk-prose-color-headings` | `currentColor` | Heading text color (h1–h4) |
| `--pk-prose-color-lead` | `currentColor` | Lead paragraph color |
| `--pk-prose-color-links` | `currentColor` | Link text color |
| `--pk-prose-color-bold` | `currentColor` | Bold/strong text color |
| `--pk-prose-color-counters` | `currentColor` | List counter color |
| `--pk-prose-color-bullets` | `currentColor` | List bullet color |
| `--pk-prose-color-hr` | `currentColor` | Horizontal rule color |
| `--pk-prose-color-quotes` | `currentColor` | Blockquote text color |
| `--pk-prose-color-quote-borders` | `currentColor` | Blockquote border color |
| `--pk-prose-color-captions` | `currentColor` | Figure caption color |
| `--pk-prose-color-code` | `currentColor` | Inline code color |
| `--pk-prose-color-pre-code` | `currentColor` | Code block text color |
| `--pk-prose-color-pre-bg` | `transparent` | Code block background color |
| `--pk-prose-color-th-borders` | `currentColor` | Table header border color |
| `--pk-prose-color-td-borders` | `currentColor` | Table cell border color |
| `--pk-prose-color-kbd` | `currentColor` | Keyboard tag text color |
| `--pk-prose-kbd-shadows` | `currentColor` | Keyboard tag shadow color |

## Shortcuts

### Modular Shortcuts

Each shortcut styles a specific aspect of prose content. They all include `prose-base` as a foundation.

| Shortcut | Description |
| --- | --- |
| `prose-base` | Base prose styles: body color, max-width (`65ch`), font-size (`1rem`), line-height (`1.75`), and first/last child margin reset |
| `prose-paragraphs` | Paragraph spacing and lead paragraph styles |
| `prose-links` | Link color, underline, and font-weight |
| `prose-emphasis` | Bold and italic text styles |
| `prose-kbd` | `<kbd>` element styles with box-shadow borders |
| `prose-lists` | Ordered lists, unordered lists, definition lists, and nested list styles |
| `prose-hr` | Horizontal rule border and margin |
| `prose-headings` | h1–h4 styles including font-size, font-weight, color, margins, and line-height |
| `prose-quotes` | Blockquote styles with left border and quotation marks |
| `prose-media` | Image, video, picture, and figure/figcaption styles |
| `prose-code` | Inline code and `<pre>` code block styles |
| `prose-tables` | Table, thead, tbody, and cell styles |

### Aggregate Shortcut

| Shortcut | Description |
| --- | --- |
| `prose` | Combines all modular shortcuts above (`prose-paragraphs` through `prose-tables`) into a single shortcut for full typography styles |

### Size Variants

Size variant shortcuts extend `prose` with adjusted `fontSize` and `lineHeight`:

| Shortcut | Font Size | Line Height |
| --- | --- | --- |
| `prose-sm` | `0.875rem` | `1.71` |
| `prose` (default) | `1rem` | `1.75` |
| `prose-lg` | `1.125rem` | `1.77` |
| `prose-xl` | `1.25rem` | `1.8` |
| `prose-2xl` | `1.5rem` | `1.66` |

### Using Modular Shortcuts

You can apply only specific aspects of typography instead of the full `prose` shortcut:

<<< @/.examples/plugins/typography-usage-modular.ts

### Using Size Variants

<<< @/.examples/plugins/typography-usage-sizes.ts

## How It Works

The plugin name is `'typography'`. During engine configuration:

1. **`configureRawConfig`** — reads `config.typography` to capture user options.
2. **`configureEngine`** — performs two actions:
   - Adds CSS variables (`--pk-prose-*`) via `engine.variables.add()`, merging defaults with any user overrides.
   - Registers all shortcuts via `engine.shortcuts.add()`. Each modular shortcut (e.g., `prose-headings`) includes `prose-base` as a dependency. The `prose` shortcut aggregates all modular shortcuts, and size variants extend `prose` with overridden sizing.

## Next

- Continue to [FAQ](/community/faq)
- Continue to [Reset Plugin](/plugins/reset)
- Learn [Create Plugin](/plugin-system/create-plugin)

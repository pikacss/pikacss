# Icons Plugin

`@pikacss/plugin-icons` lets you use any icon from [Iconify](https://iconify.design/) as an atomic CSS class — powered by `@iconify/utils` and `@unocss/preset-icons`. Icons are resolved at build time and embedded as optimized CSS data URIs with zero runtime cost.

## Installation

The plugin requires `@iconify/utils` as a peer dependency:

::: code-group
<<< @/.examples/plugins/icons-install.sh [pnpm]
<<< @/.examples/plugins/icons-install-npm.sh [npm]
<<< @/.examples/plugins/icons-install-yarn.sh [yarn]
:::

## Basic Setup

<<< @/.examples/plugins/icons-basic-config.ts

## Icon Naming Convention

Icons follow the pattern: **`prefix` + `collection:name`**

The default prefix is `i-`. You reference icons using Iconify collection and icon names separated by a colon:

| Shortcut | Collection | Icon |
| --- | --- | --- |
| `i-mdi:home` | Material Design Icons | home |
| `i-lucide:settings` | Lucide | settings |
| `i-carbon:warning` | Carbon | warning |
| `i-tabler:brand-github` | Tabler Icons | brand-github |

Browse available icons at [Iconify](https://icon-sets.iconify.design/).

## Usage

<<< @/.examples/plugins/icons-usage.ts

In a Vue component:

<<< @/.examples/plugins/icons-usage.vue

## Rendering Modes

The plugin supports two rendering modes that determine how the icon SVG is applied as CSS:

### Mask Mode

In **mask** mode, the SVG is used as a CSS mask. The icon inherits the element's text `color`, making it easy to theme:

<<< @/.examples/plugins/icons-mask-output.css

### Background Mode

In **background** mode, the SVG is used as a CSS background image. The icon retains its original SVG colors:

<<< @/.examples/plugins/icons-bg-output.css

### Auto Mode (Default)

When `mode` is `'auto'` (the default), the plugin automatically selects the appropriate mode:

- **`mask`** — if the SVG contains `currentColor`
- **`bg`** — otherwise

You can override the mode per icon by appending `?mask`, `?bg`, or `?auto` to the shortcut name.

## Custom Collections

You can define inline SVG collections in the config:

<<< @/.examples/plugins/icons-custom-collections.ts

## Custom Processor

Use the `processor` option to modify the generated CSS properties before they are emitted:

<<< @/.examples/plugins/icons-processor.ts

## Autocomplete

Provide a list of icon names to enhance IDE autocomplete suggestions:

<<< @/.examples/plugins/icons-autocomplete.ts

## Advanced Configuration

<<< @/.examples/plugins/icons-advanced-config.ts

## Config Reference

This plugin augments `EngineConfig` with an `icons` field:

<<< @/.examples/plugins/icons-engine-config-interface.ts

`IconsConfig` extends `@unocss/preset-icons` options (excluding `warn`, `layer`, and `customFetcher`) with PikaCSS-specific additions:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `scale` | `number` | `1` | Icon scale factor |
| `mode` | `'auto' \| 'mask' \| 'bg'` | `'auto'` | Default rendering mode |
| `prefix` | `string \| string[]` | `'i-'` | Class name prefix for icon shortcuts |
| `collections` | `Record<string, IconifyJSON \| (() => Awaitable<IconifyJSON>)>` | — | Custom icon collections |
| `customizations` | `IconCustomizations` | — | Transform icons (rotate, resize, etc.) |
| `autoInstall` | `boolean` | `false` | Auto-install icon packages on demand |
| `cdn` | `string` | — | CDN base URL for loading icons |
| `unit` | `string` | — | CSS unit for icon dimensions (e.g., `'em'`) |
| `extraProperties` | `Record<string, string>` | — | Extra CSS properties for every icon |
| `processor` | `(styleItem: StyleItem, meta: Required<IconMeta>) => void` | — | Modify CSS output per icon |
| `autocomplete` | `string[]` | — | Additional autocomplete entries |

## How It Works

1. The plugin registers a dynamic shortcut matching the regex pattern `/^(?:i-)([\w:-]+)(?:\?(mask|bg|auto))?$/`
2. When a matching shortcut is resolved, it parses the icon name (`collection:name` format)
3. The SVG is loaded via `@iconify/utils` and `@unocss/preset-icons` loaders
4. The SVG is encoded as a CSS data URI and stored as a CSS variable (`--<prefix>svg-icon-...`) marked with `pruneUnused: true`
5. Based on the resolved mode, it generates either mask-based or background-based CSS properties

## Next

- Continue to [Reset Plugin](/plugins/reset)
- Continue to [Typography Plugin](/plugins/typography)
- Learn [Create Plugin](/plugin-system/create-plugin)

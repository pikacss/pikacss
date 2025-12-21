---
title: Icons
description: Learn how to use icons plugin in PikaCSS
outline: deep
---

# Icons

::: info
Big thanks to [unocss](https://github.com/unocss/unocss) for the icons preset that this plugin is based on. This icons plugin is a wrapper around it to adapt it to PikaCSS.

Check the [documentation](https://unocss.dev/presets/icons) for more information about the icons available and how to use them.
:::

## Installation
::: code-group

```bash [pnpm]
pnpm add -D @pikacss/plugin-icons
```

```bash [yarn]
yarn add -D @pikacss/plugin-icons
```

```bash [npm]
npm install -D @pikacss/plugin-icons
```

:::

## Setup

::: code-group

```ts  [Vite Project]
// pika.config.ts
import Icons from '@pikacss/plugin-icons'
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	plugins: [
		Icons({
			// options
		}),
	],
})
```

```ts  [Nuxt Project]
// pika.config.ts
import { defineEngineConfig } from '@pikacss/nuxt-pikacss'
import Icons from '@pikacss/plugin-icons'

export default defineEngineConfig({
	plugins: [
		Icons({
			// options
		}),
	],
})
```

:::

## Usage

The icons would be provided as shortcuts, so you can use them like this:

```ts
pika('i-mdi:home')
```

Or use with `__shortcut` property:

```ts
pika({
	__shortcut: 'i-mdi:home'
})
```

### Specifying Render Mode

Append `?mask` or `?bg` to force a specific rendering mode:

```ts
// Force mask mode (for colored icons)
pika('i-mdi:home?mask')

// Force background mode
pika('i-mdi:home?bg')
```

## Configuration Options

```ts
Icons({
	// Icon scale multiplier (default: 1)
	scale: 1.2,

	// Rendering mode: 'auto' | 'mask' | 'bg' (default: 'auto')
	mode: 'auto',

	// Class prefix (default: 'i-')
	prefix: 'i-',

	// CDN URL for loading icons (optional)
	cdn: 'https://esm.sh/',

	// Extra CSS properties applied to all icons
	extraProperties: {
		'display': 'inline-block',
		'vertical-align': 'middle'
	},

	// Icons to include in autocomplete suggestions
	autocomplete: ['mdi:home', 'mdi:account', 'mdi:settings'],

	// Auto-install icon packages when encountered
	autoInstall: false,

	// CSS unit for icon size
	unit: 'em'
})
```

### Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scale` | `number` | `1` | Icon size multiplier |
| `mode` | `'auto' \| 'mask' \| 'bg'` | `'auto'` | Default rendering mode |
| `prefix` | `string` | `'i-'` | Class name prefix |
| `cdn` | `string` | - | CDN URL for fetching icons |
| `extraProperties` | `Record<string, string>` | `{}` | Additional CSS properties |
| `collections` | `Record<string, IconifyJSON \| () => IconifyJSON>` | - | Custom icon collections |
| `customizations` | `IconCustomizations` | - | Icon customization options |
| `autoInstall` | `boolean` | `false` | Auto-install icon packages |
| `unit` | `string` | `'em'` | CSS unit for icon size |
| `autocomplete` | `string[]` | - | Icons for autocomplete |

## Rendering Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `auto` | Automatically selects based on icon | Default behavior |
| `mask` | Uses CSS mask (icon inherits `currentColor`) | Monochrome icons |
| `bg` | Uses background-image | Multi-colored icons |

## Custom Icon Collections

You can define custom icon collections:

```ts
Icons({
	collections: {
		'my-icons': {
			logo: '<svg>...</svg>',
			custom: '<svg>...</svg>'
		}
	}
})

// Usage: 'i-my-icons:logo'
```

## How It Works

1. The plugin registers a dynamic shortcut that matches the icon pattern (e.g., `i-mdi:home`)
2. When matched, it loads the SVG from [Iconify](https://iconify.design/)
3. The SVG is encoded as a Data URI and stored as a CSS variable
4. Returns a style object using `mask` or `background` to display the icon

## External Resources

- [Iconify Icon Sets](https://icon-sets.iconify.design/) - Browse all available icons
- [UnoCSS preset-icons](https://unocss.dev/presets/icons) - Based on the same icon system

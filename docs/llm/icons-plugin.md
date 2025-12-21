---
title: Icons Plugin
description: PikaCSS Icons plugin reference for LLMs
outline: deep
llmstxt:
  description: PikaCSS icons plugin - installation, configuration, usage, render modes
---

# Icons Plugin

The `@pikacss/plugin-icons` package provides icon support via [Iconify](https://iconify.design/), allowing you to use thousands of icons as CSS classes.

## Installation

```bash
npm install -D @pikacss/plugin-icons
```

## Configuration

```typescript
import { icons } from '@pikacss/plugin-icons'
// pika.config.ts
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	plugins: [
		icons()
	],
	icons: {
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
		autocomplete: ['mdi:home', 'mdi:account', 'mdi:settings']
	}
})
```

## Usage

### Using as Shortcut

```typescript
// Use __shortcut to apply icon
pika({
	__shortcut: 'i-mdi:home'
})
```

### Using as Class Name

```typescript
// In JSX/TSX
<span className="i-mdi:home" />

// In Vue template
<span class="i-mdi:home" />
```

### Specifying Render Mode

Append `?mask` or `?bg` to force a specific rendering mode:

```typescript
// Force mask mode (for colored icons)
'i-mdi:home?mask'

// Force background mode
'i-mdi:home?bg'
```

## Rendering Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `auto` | Automatically selects based on icon | Default behavior |
| `mask` | Uses CSS mask (icon inherits `currentColor`) | Monochrome icons |
| `bg` | Uses background-image | Multi-colored icons |

## Configuration Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scale` | `number` | `1` | Icon size multiplier |
| `mode` | `'auto' \| 'mask' \| 'bg'` | `'auto'` | Default rendering mode |
| `prefix` | `string` | `'i-'` | Class name prefix |
| `cdn` | `string` | - | CDN URL for fetching icons |
| `extraProperties` | `object` | `{}` | Additional CSS properties |
| `collections` | `object` | - | Custom icon collections |
| `customizations` | `object` | - | Icon customization options |
| `autoInstall` | `boolean` | `false` | Auto-install icon packages |
| `unit` | `string` | - | CSS unit for icon size |
| `autocomplete` | `string[]` | - | Icons for autocomplete |

## Custom Icon Collections

You can define custom icon collections:

```typescript
icons({
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

# Plugin: Icons

> Read this when the user asks about using icons with PikaCSS, icon rendering modes, icon sources, or troubleshooting missing icons.

## Installation

```bash
pnpm add -D @pikacss/plugin-icons
```

## Setup

```ts
// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  plugins: [icons()],
})
```

## Usage in pika()

Icons are used as shortcuts with the pattern `i-{collection}:{name}`:

```ts
pika('i-lucide:rocket')
pika('i-mdi:home')
pika('i-lucide:rocket', { width: '24px', height: '24px' })
```

## Icon Sources (precedence order)

1. **Custom collections** — defined in config via `collections` option
2. **Locally installed packages** — `@iconify-json/{collection}` npm packages
3. **CDN fallback** — fetches from Iconify CDN if local package is missing

### Installing icon collections

```bash
pnpm add -D @iconify-json/lucide    # Lucide icons
pnpm add -D @iconify-json/mdi       # Material Design Icons
```

### Auto-install

Set `autoInstall: true` in config to automatically install missing `@iconify-json/*` packages:

```ts
export default defineEngineConfig({
  icons: { autoInstall: true },
  plugins: [icons()],
})
```

## Configuration Options

Set via the `icons` key on `EngineConfig`:

| Option | Type | Default | Purpose |
|---|---|---|---|
| `prefix` | `string \| string[]` | `'i-'` | Shortcut prefix(es) |
| `mode` | `'auto' \| 'mask' \| 'bg'` | `'auto'` | Rendering mode |
| `scale` | `number` | `1` | Size multiplier |
| `autoInstall` | `boolean` | `false` | Auto-install missing collections |
| `collections` | `CustomCollections` | — | Custom SVG icon collections |
| `cdn` | `string` | — | CDN URL template (`{collection}` placeholder) |
| `unit` | `string` | — | CSS unit (e.g., `'em'`, `'rem'`) |
| `extraProperties` | `Record<string, string>` | — | Extra CSS on every icon |
| `customizations` | `IconifyCustomizations` | — | SVG processing hooks |

### Rendering Modes

- **`'auto'`** — uses `mask` for monochrome icons, `bg` for colored icons
- **`'mask'`** — renders as CSS mask-image (icon color follows `currentColor`)
- **`'bg'`** — renders as background-image (preserves original colors)

Force a mode per icon: `pika('i-mdi:home?mask')` or `pika('i-mdi:home?bg')`

## Troubleshooting

| Symptom | Fix |
|---|---|
| Icon not showing | Install the collection: `pnpm add -D @iconify-json/{collection}` |
| Icon shows as empty box | Check the icon name — use `https://icon-sets.iconify.design` to verify |
| Wrong color | Try `?mask` mode suffix to use `currentColor` |
| Icon size wrong | Adjust `scale` in config or add `width`/`height` in pika() |

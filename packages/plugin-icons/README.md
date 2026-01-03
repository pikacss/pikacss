# @pikacss/plugin-icons

Use thousands of icons from popular icon sets in PikaCSS.

## Installation

```bash
pnpm add @pikacss/plugin-icons
```

## Quick Start

**pika.config.ts**:
```typescript
/// <reference path="./src/pika.gen.ts" />

import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  plugins: [
    icons()
  ],
  icons: {
    // Configure icons plugin here
    prefix: 'i-',
    scale: 1,
    mode: 'auto',
  }
})
```

**Your code**:
```typescript
// Method 1: Direct shortcut string
const iconClass = pika('i-mdi:home')

// Method 2: With additional styles (shortcut as first argument)
const styledIcon = pika('i-mdi:home', {
  fontSize: '24px',
  color: 'blue'
})

// Method 3: Using __shortcut property in style object
const iconWithStyles = pika({
  __shortcut: 'i-mdi:home',
  fontSize: '24px'
})
```

## Features

- 🎨 Access to 100,000+ icons from popular icon sets
- 🔍 Auto-installs icon collections on demand
- 📦 Tree-shakeable - only icons you use are included
- 🎯 Simple shortcut syntax with customizable prefix
- 🔧 Customizable icon collections
- ⚡ Built on top of Iconify
- 🎭 Supports both mask mode (for currentColor) and background mode

## Usage

### Basic Icon Usage

Icons are provided as shortcuts (default prefix is `i-`):

```typescript
// Direct shortcut string
const iconClass = pika('i-mdi:home')

// Combine shortcut with styles (recommended)
const styledIcon = pika('i-mdi:home', {
  fontSize: '24px',
  color: 'blue'
})

// Or use __shortcut property
const iconWithStyles = pika({
  __shortcut: 'i-mdi:home',
  display: 'inline-block'
})
```

### Supported Icon Collections

All Iconify icon collections are supported. Some popular ones:

- **Material Design Icons**: `mdi:*`
- **Heroicons**: `heroicons:*`
- **Bootstrap Icons**: `bi:*`
- **Font Awesome**: `fa:*`, `fa-solid:*`, `fa-brands:*`
- **Tabler Icons**: `tabler:*`
- **Carbon**: `carbon:*`
- **Phosphor**: `ph:*`
- **Lucide**: `lucide:*`

Browse all collections at: [Iconify Icon Sets](https://icon-sets.iconify.design/)

### Usage Examples

```typescript
// Simple icon
const homeIcon = pika('i-mdi:home')

// Icon with size and color
const largeIcon = pika('i-mdi:account', {
  fontSize: '48px',
  color: '#3b82f6'
})

// Icon with hover effect
const hoverIcon = pika('i-mdi:heart', {
  fontSize: '24px',
  color: 'red',
  cursor: 'pointer',
  '$:hover': {
    transform: 'scale(1.2)'
  }
})

// Combining multiple shortcuts
const buttonWithIcon = pika('btn', 'i-mdi:send', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem'
})
```

### Icon Syntax

Icons follow the pattern: `{prefix}{collection}:{icon-name}` (default prefix is `i-`)

```typescript
pika('i-mdi:home')              // Material Design home icon
pika('i-heroicons:user')        // Heroicons user icon
pika('i-carbon:cloud-upload')   // Carbon cloud upload icon
```

### Icon Rendering Modes

Append `?mask`, `?bg`, or `?auto` to specify the rendering mode:

```typescript
pika('i-mdi:home?mask')  // Mask mode (uses currentColor)
pika('i-mdi:home?bg')    // Background mode
pika('i-mdi:home?auto')  // Auto-detect (default)
```

- **auto**: Automatically selects mask or bg based on whether icon contains `currentColor`
- **mask**: Icon inherits the current text color (good for monochrome icons)
- **bg**: Uses background-image (good for multi-colored icons)

### Customizing Icon Size and Color

Icons inherit text properties:

```typescript
// Using shortcut with styles
pika('i-mdi:home', {
  fontSize: '32px',
  color: '#3b82f6'  // Works with mask mode
})

// Using __shortcut property
pika({
  __shortcut: 'i-mdi:home',
  fontSize: '32px',
  color: '#3b82f6'
})
```

## Configuration

Configure the icons plugin using the standard plugin pattern:

```typescript
/// <reference path="./src/pika.gen.ts" />

import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  // 1. Register plugin in plugins array
  plugins: [
    icons()  // Note: Call the function!
  ],
  
  // 2. Configure at root level
  icons: {
    prefix: 'i-',        // Shortcut prefix
    scale: 1,            // Icon scale multiplier
    mode: 'auto',        // 'auto' | 'mask' | 'bg'
    cdn: 'https://esm.sh/', // CDN for icon collections
    autoInstall: false,  // Auto-install icon packages
    // ... other options
  }
})
```

::: tip Common Mistake
Always call the plugin function: `plugins: [icons()]` not `plugins: [icons]`
:::

### Available Options

```typescript
interface IconsConfig {
  /**
   * Icon shortcut prefix.
   * @default 'i-'
   */
  prefix?: string | string[]

  /**
   * Scale factor for icons.
   * @default 1
   */
  scale?: number

  /**
   * Icon rendering mode.
   * - 'auto': Auto-detect based on currentColor
   * - 'mask': Use mask with currentColor
   * - 'bg': Use background image
   * @default 'auto'
   */
  mode?: 'auto' | 'mask' | 'bg'

  /**
   * CDN base URL for loading icon collections.
   */
  cdn?: string

  /**
   * Custom icon collections.
   */
  collections?: Record<string, any>

  /**
   * Auto-install icon collections from npm.
   * @default false
   */
  autoInstall?: boolean

  /**
   * Unit for icon size (when specified).
   */
  unit?: string

  /**
   * Extra CSS properties to apply to all icons.
   */
  extraProperties?: Record<string, string>

  /**
   * Custom processor for icon styles.
   */
  processor?: (styleItem: StyleItem, meta: IconMeta) => void

  /**
   * Icons for auto-completion.
   */
  autocomplete?: string[]
}
```

### Custom Icon Prefix

Change the shortcut prefix:

```typescript
export default defineEngineConfig({
  plugins: [icons()],
  icons: {
    prefix: 'icon-'  // Now use icon-mdi:home
  }
})
```

### Custom Icon Scale

Adjust the default scale of all icons:

```typescript
export default defineEngineConfig({
  plugins: [icons()],
  icons: {
    scale: 1.2  // Make all icons 20% larger
  }
})
```

## How It Works

The plugin automatically:

1. Detects icon usage in your code
2. Downloads the required icon collections from Iconify
3. Generates optimized SVG background images
4. Applies them using CSS custom properties

## Performance

- **On-demand loading**: Only downloads icon sets you actually use
- **Tree-shaking**: Only icons you reference are included in the build
- **Cached**: Downloaded icon collections are cached locally
- **Optimized SVG**: Icons are optimized for minimal file size

## Documentation

For complete documentation, visit: [PikaCSS Documentation](https://pikacss.dev)

## License

MIT © DevilTea

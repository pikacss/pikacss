# @pikacss/plugin-reset

CSS reset/normalize plugin for PikaCSS.

## Installation

```bash
pnpm add @pikacss/plugin-reset
```

## Quick Start

**pika.config.ts**:
```typescript
/// <reference path="./src/pika.gen.ts" />

import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
  plugins: [
    reset()
  ],
  // Choose which reset style to use
  reset: 'modern-normalize' // default
})
```

## Features

- 🎨 Multiple popular CSS reset/normalize styles to choose from
- 🔧 Easy to switch between different reset styles
- 📦 Zero dependencies (except @pikacss/core)
- ⚡ Minimal configuration needed
- 🌐 Battle-tested reset styles from the community

## Usage

### Available Reset Styles

The plugin includes 5 popular CSS reset/normalize styles:

1. **`modern-normalize`** (default) - Modern browser normalization
2. **`normalize`** - The classic normalize.css
3. **`andy-bell`** - Andy Bell's Modern CSS Reset
4. **`eric-meyer`** - Eric Meyer's CSS Reset
5. **`the-new-css-reset`** - Elad Shechter's The New CSS Reset

### Basic Usage

Apply the default reset (modern-normalize):

```typescript
/// <reference path="./src/pika.gen.ts" />

import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
  plugins: [
    reset()
  ]
})
```

### Choose a Different Reset Style

Select your preferred reset style using the `reset` config option:

```typescript
/// <reference path="./src/pika.gen.ts" />

import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
  plugins: [
    reset()
  ],
  // Options: 'modern-normalize' | 'normalize' | 'andy-bell' | 'eric-meyer' | 'the-new-css-reset'
  reset: 'andy-bell'
})
```

## Reset Styles Comparison

- **modern-normalize**: Focuses on normalizing only necessary styles for modern browsers
- **normalize**: The classic normalize.css - makes browsers render elements more consistently
- **andy-bell**: A modern, minimal reset focusing on sensible defaults
- **eric-meyer**: The famous CSS reset by Eric Meyer - strips most default styling
- **the-new-css-reset**: An aggressive reset for a clean slate

## Configuration

The reset style is configured at the engine level:

```typescript
export default defineEngineConfig({
  plugins: [reset()],
  reset: 'modern-normalize' // default
})
```

## Documentation

For complete documentation, visit: [PikaCSS Documentation](https://pikacss.dev)

## License

MIT © DevilTea

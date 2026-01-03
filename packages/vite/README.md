# @pikacss/vite-plugin-pikacss

⚠️ **Deprecated**: This package is deprecated. Please use `@pikacss/unplugin-pikacss/vite` instead.

## Migration

This package now re-exports from `@pikacss/unplugin-pikacss/vite`. Please update your dependencies:

```bash
pnpm add -D @pikacss/unplugin-pikacss
```

Update your imports:

```diff
- import PikaCSSPlugin from '@pikacss/vite-plugin-pikacss'
+ import PikaCSSPlugin from '@pikacss/unplugin-pikacss/vite'
```

## Installation (Legacy)

```bash
pnpm add -D @pikacss/vite-plugin-pikacss
```

## Quick Start

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import PikaCSSPlugin from '@pikacss/vite-plugin-pikacss'

export default defineConfig({
  plugins: [
    PikaCSSPlugin({
      // options
    })
  ]
})
```

## Features

This package re-exports all features from `@pikacss/unplugin-pikacss/vite`:

- ⚡ Fast Hot Module Replacement (HMR)
- 🎯 Automatic TypeScript type generation
- 🔄 Watch mode with instant updates
- 📦 Optimized production builds
- 🔧 Full PikaCSS configuration support
- 🎨 Virtual CSS module (`pika.css`)

## Recommendation

For new projects, we strongly recommend using `@pikacss/unplugin-pikacss/vite` directly. This package is maintained for backward compatibility only.

## Usage

### Basic Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import PikaCSSPlugin from '@pikacss/vite-plugin-pikacss'

export default defineConfig({
  plugins: [
    PikaCSSPlugin()
  ]
})
```

### With Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import PikaCSSPlugin from '@pikacss/vite-plugin-pikacss'

export default defineConfig({
  plugins: [
    PikaCSSPlugin({
      // File patterns to transform
      target: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
      
      // PikaCSS config file path
      config: './pika.config.ts',
      
      // Custom function name
      fnName: 'pika',
      
      // Transform format
      transformedFormat: 'string',
      
      // TypeScript codegen
      tsCodegen: true,
      
      // Dev CSS output path
      devCss: 'pika.dev.css'
    })
  ]
})
```

### Using in Your Code

```typescript
// In your Vue/React/etc. files
const styles = pika({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '2rem'
})
```

## Options

See `@pikacss/unplugin-pikacss` documentation for all available options:

```typescript
interface PluginOptions {
  /**
   * File scanning configuration.
   */
  scan?: {
    include?: string | string[]
    exclude?: string | string[]
  }

  /**
   * Engine configuration or config file path.
   */
  config?: EngineConfig | string

  /**
   * Auto-create config file if missing.
   * @default true
   */
  autoCreateConfig?: boolean

  /**
   * PikaCSS function name.
   * @default 'pika'
   */
  fnName?: string

  /**
   * Output format for class names.
   * @default 'string'
   */
  transformedFormat?: 'string' | 'array' | 'inline'

  /**
   * TypeScript code generation.
   * @default true
   */
  tsCodegen?: boolean | string

  /**
   * CSS code generation.
   * @default true
   */
  cssCodegen?: boolean | string
}
```

## HMR Support

Full HMR support is provided:

- **Style changes**: Updates immediately without page reload
- **Config changes**: Automatically reloads when `pika.config.ts` changes
- **Type generation**: Updates TypeScript types in real-time

## Documentation

For complete documentation, visit: [PikaCSS Documentation](https://pikacss.dev)

## License

MIT © DevilTea

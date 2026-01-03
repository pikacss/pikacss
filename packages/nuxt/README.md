# @pikacss/nuxt-pikacss

PikaCSS module for Nuxt.

## Installation

```bash
pnpm add @pikacss/nuxt-pikacss
```

## Quick Start

**nuxt.config.ts**:
```typescript
export default defineNuxtConfig({
  modules: [
    '@pikacss/nuxt-pikacss'
  ],
  pikacss: {
    // options
  }
})
```

## Features

- 🚀 Zero-config setup for Nuxt
- ⚡ Hot Module Replacement (HMR) support
- 🎯 Automatic TypeScript type generation
- 🔧 Full PikaCSS configuration support
- 📦 Built-in integration with Nuxt build pipeline

## Usage

### Basic Setup

The module works out of the box with zero configuration:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pikacss/nuxt-pikacss'
  ]
})
```

### Configuration

You can customize PikaCSS through the `pikacss` option:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pikacss/nuxt-pikacss'
  ],
  pikacss: {
    // File scanning configuration
    scan: {
      include: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
      exclude: ['node_modules/**']
    },
    
    // Engine configuration or config file path
    config: './pika.config.ts',
    
    // Auto-create config file if missing
    autoCreateConfig: true,
    
    // PikaCSS function name (globally available in Nuxt)
    fnName: 'pika',
    
    // Output format for class names
    transformedFormat: 'string', // 'string' | 'array' | 'inline'
    
    // TypeScript code generation
    tsCodegen: true, // or specify a path: 'src/pika.gen.ts'
    
    // CSS code generation
    cssCodegen: true // or specify a path: 'src/pika.gen.css'
  }
})
```

::: tip
The `pika()` function is globally available in Nuxt components - no import needed!
:::

### Using in Components

The module automatically imports the virtual `pika.css` module and makes `pika()` globally available:

```vue
<script setup lang="ts">
// ✅ No imports needed - pika() is globally injected

// Style object
const styles = pika({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
})

// Using shortcuts
const centered = pika('flex-center')

// Combining shortcuts with styles
const button = pika('btn', {
  backgroundColor: '#3b82f6',
  color: 'white'
})
</script>

<template>
  <div :class="styles">
    <button :class="button">Click me</button>
  </div>
</template>
```

## Options

All options from `@pikacss/unplugin-pikacss` are supported. See the [unplugin documentation](../unplugin/README.md) for details.

## PikaCSS Configuration

Create a `pika.config.ts` file in your project root:

```typescript
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
  // Your PikaCSS configuration
})
```

## Documentation

For complete documentation, visit: [PikaCSS Documentation](https://pikacss.dev)

## License

MIT © DevilTea

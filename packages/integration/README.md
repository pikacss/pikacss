# @pikacss/integration

Internal integration utilities for PikaCSS build tool plugins.

## ⚠️ Internal Package

**This is an internal package** used by official PikaCSS integration plugins. 

**Most users should use these instead:**
- **[`@pikacss/unplugin-pikacss`](../unplugin/)** - Universal plugin for multiple bundlers
- **[`@pikacss/nuxt-pikacss`](../nuxt/)** - Nuxt module

## Installation

Only needed for plugin development:

```bash
pnpm add @pikacss/integration
```

## What This Package Provides

Low-level utilities for building PikaCSS integrations:

- 🔧 Core integration context management
- 📁 File scanning and code transformation
- 🎯 Config file loading and resolution
- 📦 Code generation (TypeScript and CSS)
- ⚡ Build-time optimizations

## Exports

This package exports utilities from `@pikacss/core` and provides integration-specific functionality:

```typescript
// Main exports
export * from './ctx'           // Integration context system
export * from './types'         // TypeScript type definitions
export * from '@pikacss/core'   // Re-exports all core exports
```

## For Plugin Authors

If you're building a new integration for a bundler or framework, this package provides the foundation. 

See how it's used in existing integrations:
- [`@pikacss/unplugin-pikacss`](../unplugin/) - Universal plugin implementation
- [`@pikacss/nuxt-pikacss`](../nuxt/) - Nuxt module implementation

## Documentation

For complete documentation, visit: [PikaCSS Documentation](https://pikacss.dev)

## License

MIT © DevilTea

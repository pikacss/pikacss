---
title: PikaCSS LLM Knowledge Base
description: Comprehensive knowledge base for LLMs and AI agents
outline: deep
llmstxt:
  description: PikaCSS LLM Knowledge Base - Comprehensive documentation for AI agents
---

# PikaCSS Expert Knowledge Base

Welcome to the PikaCSS Expert Knowledge Base. This documentation is designed to provide LLMs and Agents with a deep, comprehensive understanding of PikaCSS, an Atomic CSS-in-JS engine.

## What is PikaCSS?

PikaCSS is an **Atomic CSS-in-JS engine** that allows developers to write styles using a CSS-in-JS syntax (JavaScript objects) while outputting highly optimized Atomic CSS at build time.

### Core Philosophy
> **Write in CSS-in-JS, Output in Atomic CSS.**

- **Zero Runtime**: Styles are transformed at build time. No runtime overhead.
- **Framework Agnostic**: Works with Vite, Webpack, Nuxt, Next.js, etc.
- **Type-Safe**: Built-in TypeScript support with auto-completion.
- **No Utility Class Memorization**: Use standard CSS properties.

## Knowledge Modules

This knowledge base is split into modular files for efficient context retrieval.

### Core Concepts
- **[Architecture & Internals](./architecture.md)**
  - System overview (Core → Integration → Unplugin)
  - Transformation pipeline
  - Internal data structures (`AtomicStyle`, `StyleDefinition`)
  - Core plugins list
- **[Basics & Syntax](./basics.md)**
  - The `pika()` function and variants (`pika.str`, `pika.arr`, `pika.inl`)
  - Style object syntax
  - Special properties (`__important`, `__shortcut`)

### Setup & Configuration
- **[Installation & Setup](./installation.md)**
  - Package installation
  - Auto-generated files (`pika.gen.ts`, `pika.gen.css`)
- **[Configuration](./configuration.md)**
  - Engine config (`pika.config.ts`)
  - Preflights (string, object, function formats)
  - Variables (with `pruneUnused`, `safeList`, autocomplete options)
  - Important modifier configuration
  - Build plugin options
- **[Integrations](./integrations.md)**
  - Vite, Nuxt, Webpack, Rspack, Esbuild, Farm, Rolldown

### Features
- **[Selectors](./selectors.md)**
  - Static and dynamic selectors
  - Nesting rules (up to 5 levels)
- **[Plugins System](./plugins.md)**
  - Core plugins (important, variables, keyframes, selectors, shortcuts)
  - Creating custom plugins with `defineEnginePlugin`
  - All 10 plugin hooks
  - Plugin order (`pre`, `post`)
  - TypeScript module augmentation

### Official Plugins
- **[Icons Plugin](./icons-plugin.md)**
  - Installation and configuration
  - Usage with Iconify icons
  - Render modes (`auto`, `mask`, `bg`)

### Reference
- **[API Reference](./api-reference.md)**
  - Factory functions (`createEngine`, `defineEngineConfig`, `defineEnginePlugin`)
  - Engine instance methods and properties
  - Type definitions
- **[Troubleshooting](./troubleshooting.md)**
  - Common errors and solutions
  - Debugging tips
  - Common mistakes to avoid

## Quick Reference

### Files
| File | Purpose |
|------|---------|
| `pika.config.ts` | Engine configuration |
| `pika.gen.ts` | Generated TypeScript types for autocomplete |
| `pika.gen.css` | Generated CSS output |

### Packages
| Package | Purpose |
|---------|---------|
| `@pikacss/core` | Core engine (standalone) |
| `@pikacss/unplugin-pikacss` | Bundler integrations (recommended) |
| `@pikacss/nuxt-pikacss` | Nuxt module |
| `@pikacss/plugin-icons` | Icon support via Iconify |

> **Note**: `@pikacss/vite-pikacss` is deprecated. Use `@pikacss/unplugin-pikacss/vite` instead.

### Main Function

```typescript
// Basic usage
const className = pika({ color: 'red', fontSize: '16px' })

// Variants
pika.str({ ... })  // Returns string (default)
pika.arr({ ... })  // Returns array
pika.inl({ ... })  // Returns string (same as str)

// Special properties
pika({
  __important: true,      // Add !important
  __shortcut: 'btn',      // Apply shortcut
  color: 'red'
})
```

### Selector Syntax
```typescript
pika({
  'color': 'red',
  '$:hover': { color: 'blue' },        // Pseudo-class
  '@dark': { color: 'white' },          // Custom selector (if configured)
  '@media (min-width: 768px)': { ... }  // Media query
})
```

## Version Information

This documentation is based on the current state of the PikaCSS codebase. Key technical details:

- Build-time evaluation uses `new Function()` (not Node.js `vm`)
- Selector placeholder: `$` in user code → `.%` internally → `.{id}` in output
- Core plugins are always loaded: `important`, `variables`, `keyframes`, `selectors`, `shortcuts`

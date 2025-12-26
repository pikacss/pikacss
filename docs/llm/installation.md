---
title: Installation & Setup
description: PikaCSS installation guide for LLMs
outline: deep
llmstxt:
  description: PikaCSS installation - unplugin, Nuxt, auto-generated files
---

# Installation & Setup

## Unplugin (Vite, Webpack, Rspack, etc.)

For most build tools, use the unplugin package.

### 1. Install
```bash
npm install -D @pikacss/unplugin-pikacss
```

### 2. Configure Bundler
**Vite Example (`vite.config.ts`):**
```typescript
import pikacss from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		pikacss({ /* options */ }),
	],
})
```

> **Note**: `@pikacss/vite-pikacss` is **deprecated**. Use `@pikacss/unplugin-pikacss/vite` instead.

### 3. Create Config File
Create `pika.config.ts` in your project root:
```typescript
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	// Your configuration
})
```

### 4. Import Virtual Module
In your main entry file (e.g., `main.ts`, `index.js`):
```typescript
import 'pika.css'
```

## Nuxt

### 1. Install
```bash
npm install -D @pikacss/nuxt-pikacss
```

### 2. Configure Nuxt
**`nuxt.config.ts`:**
```typescript
export default defineNuxtConfig({
	modules: [
		'@pikacss/nuxt-pikacss',
	],
	pikacss: { /* options */ },
})
```

### 3. Create Config File
Create `pika.config.ts` (or `pika.config.js` for Nuxt):
```typescript
import { defineEngineConfig } from '@pikacss/nuxt-pikacss'

export default defineEngineConfig({
	// Your configuration
})
```

## Auto-Generated Files

PikaCSS automatically generates files to support development. It is recommended to add `pika.gen.ts` and `pika.gen.css` to `.gitignore`.

### `pika.config.ts`
The configuration file. Generated automatically if missing.

### `pika.gen.ts`
**Critical for TypeScript Support.**
This file contains type definitions for auto-completion.
Ensure your `pika.config.ts` includes this reference at the top:
```typescript
/// <reference path="./src/pika.gen.ts" />
```
Or include it in your `tsconfig.json`.

### `pika.gen.css`
Contains the generated atomic CSS.
- In development, styles are often served via the virtual module `pika.css`.
- This file is useful for inspection or specific build setups.

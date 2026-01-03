---
title: Vite Integration
description: How to use PikaCSS with Vite
outline: deep
---

# Vite Integration

PikaCSS works seamlessly with Vite through the unplugin package.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @pikacss/unplugin-pikacss
```

```bash [yarn]
yarn add -D @pikacss/unplugin-pikacss
```

```bash [npm]
npm install -D @pikacss/unplugin-pikacss
```

:::

## Setup

### 1. Configure Vite

```typescript
// vite.config.ts
import pikacss from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		pikacss({
			// options
		})
	]
})
```

### 2. Create Config File

Create `pika.config.ts` in your project root:

```typescript
// pika.config.ts
/// <reference path="./src/pika.gen.ts" />

import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	// Your configuration
})
```

### 3. Import Virtual Module

In your main entry file (e.g., `main.ts`):

```typescript
import 'pika.css'
```

## Plugin Options

```typescript
pikacss({
	// File scanning configuration
	scan: {
		include: ['**/*.{js,ts,jsx,tsx,vue,svelte}'],
		exclude: ['node_modules/**']
	},

	// Config file path
	config: './pika.config.ts',

	// Auto-create config if missing
	autoCreateConfig: true,

	// Function name to detect (default: 'pika')
	fnName: 'pika',

	// Default output format: 'string' | 'array' | 'inline'
	transformedFormat: 'string',

	// Generate pika.gen.ts (default: true)
	tsCodegen: true,

	// Generate pika.gen.css (default: true)
	cssCodegen: true
})
```

## Framework Examples

### React

```typescript
import pikacss from '@pikacss/unplugin-pikacss/vite'
// vite.config.ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		react(),
		pikacss()
	]
})
```

```tsx
// App.tsx
import 'pika.css'

function App() {
	return (
		<div className={pika({
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: '100vh'
		})}
		>
			<h1 className={pika({ color: 'blue', fontSize: '2rem' })}>
				Hello PikaCSS!
			</h1>
		</div>
	)
}
```

### Vue

```typescript
import pikacss from '@pikacss/unplugin-pikacss/vite'
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		vue(),
		pikacss()
	]
})
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import 'pika.css'
</script>

<template>
	<div
		:class="pika({
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: '100vh',
		})"
	>
		<h1 :class="pika({ color: 'blue', fontSize: '2rem' })">
			Hello PikaCSS!
		</h1>
	</div>
</template>
```

### Solid

```typescript
import pikacss from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'
// vite.config.ts
import solid from 'vite-plugin-solid'

export default defineConfig({
	plugins: [
		solid(),
		pikacss()
	]
})
```

```tsx
// App.tsx
import 'pika.css'

function App() {
	return (
		<div class={pika({
			display: 'flex',
			alignItems: 'center'
		})}
		>
			<h1 class={pika({ color: 'blue' })}>
				Hello PikaCSS!
			</h1>
		</div>
	)
}
```

## TypeScript Support

Add the generated types to your `tsconfig.json`:

```json
{
	"include": ["src/**/*", "pika.gen.ts"]
}
```

Or add a reference at the top of your entry file:

```typescript
/// <reference path="./pika.gen.ts" />
```

<!-- Removed legacy online examples links -->

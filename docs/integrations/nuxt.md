---
title: Nuxt Integration
description: How to use PikaCSS with Nuxt
outline: deep
---

# Nuxt Integration

PikaCSS provides a dedicated Nuxt module for seamless integration.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @pikacss/nuxt-pikacss
```

```bash [yarn]
yarn add -D @pikacss/nuxt-pikacss
```

```bash [npm]
npm install -D @pikacss/nuxt-pikacss
```

:::

## Setup

### 1. Configure Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	modules: [
		'@pikacss/nuxt-pikacss'
	],
	pikacss: {
		// options
	}
})
```

### 2. Create Config File

Create `pika.config.js` (or `pika.config.ts`) in your project root:

```javascript
// pika.config.js
import { defineEngineConfig } from '@pikacss/nuxt-pikacss'

export default defineEngineConfig({
	// Your configuration
})
```

::: tip
For Nuxt projects, `pika.config.js` is recommended over `.ts` for better compatibility.
:::

## Module Options

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	modules: ['@pikacss/nuxt-pikacss'],
	pikacss: {
		// File scanning configuration
		scan: {
			include: ['**/*.{js,ts,vue}'],
			exclude: ['node_modules/**']
		},

		// Config file path
		config: './pika.config.js',

		// Auto-create config if missing
		autoCreateConfig: true,

		// Function name to detect
		fnName: 'pika',

		// Default output format
		transformedFormat: 'string',

		// Generate pika.gen.ts
		tsCodegen: true,

		// Generate pika.gen.css
		cssCodegen: true
	}
})
```

## Usage

PikaCSS works in Vue components within Nuxt:

```vue
<!-- app.vue -->
<template>
	<div
		:class="pika({
			display: 'flex',
			flexDirection: 'column',
			minHeight: '100vh',
		})"
	>
		<header
			:class="pika({
				padding: '1rem',
				backgroundColor: 'var(--color-primary)',
			})"
		>
			<h1 :class="pika({ color: 'white' })">
				My Nuxt App
			</h1>
		</header>

		<main
			:class="pika({
				flex: '1',
				padding: '2rem',
			})"
		>
			<NuxtPage />
		</main>
	</div>
</template>
```

## With Composables

Create a composable for shared styles:

```typescript
// composables/useStyles.ts
export function useStyles() {
	return {
		container: pika({
			width: '100%',
			maxWidth: '1200px',
			margin: '0 auto',
			padding: '0 1rem'
		}),
		button: pika({
			'padding': '0.5rem 1rem',
			'borderRadius': '0.25rem',
			'backgroundColor': 'var(--color-primary)',
			'color': 'white',
			'cursor': 'pointer',
			'$:hover': {
				backgroundColor: 'var(--color-primary-dark)'
			}
		})
	}
}
```

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const styles = useStyles()
</script>

<template>
	<div :class="styles.container">
		<button :class="styles.button">
			Click me
		</button>
	</div>
</template>
```

## TypeScript Support

The generated types are automatically included in Nuxt. If needed, add to your `tsconfig.json`:

```json
{
	"extends": "./.nuxt/tsconfig.json",
	"include": ["pika.gen.ts"]
}
```

## Auto-Generated Files

PikaCSS generates the following files:

| File | Purpose |
|------|---------|
| `pika.gen.ts` | TypeScript types for autocomplete |
| `pika.gen.css` | Generated CSS output |

Add these to `.gitignore`:

```
pika.gen.ts
pika.gen.css
```

<!-- Removed legacy online example link -->

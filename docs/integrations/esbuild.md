---
title: Esbuild Integration
description: How to use PikaCSS with Esbuild
outline: deep
---

# Esbuild Integration

PikaCSS works with Esbuild through the unplugin package.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @pikacss/unplugin-pikacss esbuild
```

```bash [yarn]
yarn add -D @pikacss/unplugin-pikacss esbuild
```

```bash [npm]
npm install -D @pikacss/unplugin-pikacss esbuild
```

:::

## Setup

### 1. Create Build Script

```javascript
// build.mjs
import pikacss from '@pikacss/unplugin-pikacss/esbuild'
import { build } from 'esbuild'

await build({
	entryPoints: ['src/index.tsx'],
	bundle: true,
	outdir: 'dist',
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

In your main entry file:

```typescript
import 'pika.css'
```

## Plugin Options

```javascript
pikacss({
	// File scanning configuration
	scan: {
		include: ['**/*.{js,ts,jsx,tsx}'],
		exclude: ['node_modules/**']
	},

	// Config file path
	config: './pika.config.ts',

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
})
```

## Complete Example

```javascript
// build.mjs
import pikacss from '@pikacss/unplugin-pikacss/esbuild'
import { build, context } from 'esbuild'

const isDev = process.argv.includes('--dev')

const buildOptions = {
	entryPoints: ['src/index.tsx'],
	bundle: true,
	outdir: 'dist',
	format: 'esm',
	target: 'es2020',
	loader: {
		'.tsx': 'tsx',
		'.ts': 'ts'
	},
	plugins: [
		pikacss()
	],
	sourcemap: isDev
}

if (isDev) {
	// Development with watch mode
	const ctx = await context(buildOptions)
	await ctx.watch()
	console.log('Watching for changes...')
}
else {
	// Production build
	await build({
		...buildOptions,
		minify: true
	})
	console.log('Build complete!')
}
```

## React Example

```tsx
import { createRoot } from 'react-dom/client'
// src/index.tsx
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
				Hello PikaCSS with Esbuild!
			</h1>
		</div>
	)
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
```

## Package Scripts

```json
{
	"scripts": {
		"dev": "node build.mjs --dev",
		"build": "node build.mjs"
	}
}
```

## TypeScript Support

Add the generated types to your `tsconfig.json`:

```json
{
	"compilerOptions": {
		"module": "ESNext",
		"moduleResolution": "bundler",
		"jsx": "react-jsx"
	},
	"include": ["src/**/*", "pika.gen.ts"]
}
```

<!-- Removed legacy online example link -->

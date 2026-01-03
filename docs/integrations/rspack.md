---
title: Rspack Integration
description: How to use PikaCSS with Rspack
outline: deep
---

# Rspack Integration

PikaCSS works with Rspack through the unplugin package.

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

### 1. Configure Rspack

```javascript
// rspack.config.mjs
import pikacss from '@pikacss/unplugin-pikacss/rspack'

export default {
	plugins: [
		pikacss({
			// options
		})
	]
}
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
import pikacss from '@pikacss/unplugin-pikacss/rspack'
// rspack.config.mjs
import { defineConfig } from '@rspack/cli'

export default defineConfig({
	entry: './src/index.tsx',
	output: {
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: 'builtin:swc-loader',
					options: {
						jsc: {
							parser: {
								syntax: 'typescript',
								tsx: true
							},
							transform: {
								react: {
									runtime: 'automatic'
								}
							}
						}
					}
				}
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	plugins: [
		pikacss()
	],
	devServer: {
		hot: true
	}
})
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
				Hello PikaCSS with Rspack!
			</h1>
		</div>
	)
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
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

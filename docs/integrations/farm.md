---
title: Farm Integration
description: How to use PikaCSS with Farm
outline: deep
---

# Farm Integration

PikaCSS works with Farm through the unplugin package.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @pikacss/unplugin-pikacss @farmfe/core @farmfe/cli
```

```bash [yarn]
yarn add -D @pikacss/unplugin-pikacss @farmfe/core @farmfe/cli
```

```bash [npm]
npm install -D @pikacss/unplugin-pikacss @farmfe/core @farmfe/cli
```

:::

## Setup

### 1. Configure Farm

```typescript
// farm.config.ts
import { defineConfig } from '@farmfe/core'
import PikaCSS from '@pikacss/unplugin-pikacss/farm'

export default defineConfig({
	plugins: [
		PikaCSS({
			// options
		})
	]
})
```

### 2. Create Config File

Create `pika.config.ts` in your project root:

```typescript
// pika.config.ts
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

```typescript
PikaCSS({
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

```typescript
// farm.config.ts
import { defineConfig } from '@farmfe/core'
import PikaCSS from '@pikacss/unplugin-pikacss/farm'

export default defineConfig({
	compilation: {
		input: {
			index: './src/index.tsx'
		},
		output: {
			path: 'dist'
		}
	},
	plugins: [
		'@farmfe/plugin-react',
		PikaCSS()
	],
	server: {
		port: 3000
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
				Hello PikaCSS with Farm!
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
		"dev": "farm start",
		"build": "farm build"
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

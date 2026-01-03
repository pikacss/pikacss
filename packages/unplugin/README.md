# @pikacss/unplugin-pikacss

Universal plugin for PikaCSS that works with multiple bundlers.

## Installation

```bash
pnpm add @pikacss/unplugin-pikacss
```

## Usage

### Vite

For full Vite support with hot reloading and build optimizations, use the Vite-specific export:

```ts
// vite.config.ts
import PikaCSSPlugin from '@pikacss/unplugin-pikacss/vite'

export default {
	plugins: [
		PikaCSSPlugin({
			// options
		}),
	],
}
```

### Rollup

```ts
// rollup.config.js
import PikaCSSPlugin from '@pikacss/unplugin-pikacss/rollup'

export default {
	plugins: [
		PikaCSSPlugin({
			// options
		}),
	],
}
```

### Webpack

```ts
// webpack.config.js
import PikaCSSPlugin from '@pikacss/unplugin-pikacss/webpack'

export default {
	plugins: [
		PikaCSSPlugin({
			// options
		}),
	],
}
```

### esbuild

```ts
// esbuild.config.js
import PikaCSSPlugin from '@pikacss/unplugin-pikacss/esbuild'
import esbuild from 'esbuild'

esbuild.build({
	plugins: [
		PikaCSSPlugin({
			// options
		}),
	],
})
```

### Rspack

```ts
// rspack.config.js
import PikaCSSPlugin from '@pikacss/unplugin-pikacss/rspack'

export default {
	plugins: [
		PikaCSSPlugin({
			// options
		}),
	],
}
```

### Farm

```ts
// farm.config.ts
import PikaCSSPlugin from '@pikacss/unplugin-pikacss/farm'

export default {
	plugins: [
		PikaCSSPlugin({
			// options
		}),
	],
}
```

### Rolldown

```ts
// rolldown.config.js
import PikaCSSPlugin from '@pikacss/unplugin-pikacss/rolldown'

export default {
	plugins: [
		PikaCSSPlugin({
			// options
		}),
	],
}
```

## Options

```ts
interface PluginOptions {
	/**
	 * Specify file patterns to scan for detecting pika() function calls.
	 *
	 * @default { include: ['**/*.{js,ts,jsx,tsx,vue}'], exclude: ['node_modules/**'] }
	 */
	scan?: {
		include?: string | string[]
		exclude?: string | string[]
	}

	/**
	 * Configuration object or path to a configuration file for the PikaCSS engine.
	 * Can pass a config object directly or a config file path (e.g., 'pika.config.ts').
	 */
	config?: EngineConfig | string

	/**
	 * Whether to automatically create a configuration file when needed.
	 * @default true
	 */
	autoCreateConfig?: boolean

	/**
	 * The name of the PikaCSS function in source code.
	 * @default 'pika'
	 */
	fnName?: string

	/**
	 * The format of the generated atomic style class names.
	 * - `'string'`: Returns a space-separated string (e.g., "a b c")
	 * - `'array'`: Returns an array of class names (e.g., ['a', 'b', 'c'])
	 * - `'inline'`: Returns inline format
	 * @default 'string'
	 */
	transformedFormat?: 'string' | 'array' | 'inline'

	/**
	 * Configuration for TypeScript code generation.
	 * - `true`: Auto-generate as 'pika.gen.ts'
	 * - string: Use the specified file path
	 * - `false`: Disable TypeScript code generation
	 * @default true
	 */
	tsCodegen?: boolean | string

	/**
	 * Configuration for CSS code generation.
	 * - `true`: Auto-generate as 'pika.gen.css'
	 * - string: Use the specified file path
	 * @default true
	 */
	cssCodegen?: boolean | string
}
```

## Setup Steps

### 1. Install and Configure Plugin

Add the plugin to your build tool configuration (see examples above).

### 2. Create Config File

Create `pika.config.ts` in your project root:

```ts
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	// Your PikaCSS configuration
	plugins: []
})
```

### 3. Import Virtual CSS Module

In your application entry file:

```ts
import 'pika.css'
```

### 4. Use in Your Code

```ts
// Direct style object
const classes = pika({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
})

// Using shortcuts
const centered = pika('flex-center')

// Combining shortcuts with styles
const styled = pika('flex-center', { color: 'blue' })

// Multiple shortcuts
const multi = pika('btn', 'shadow', { margin: '1rem' })
```

## Migration from @pikacss/vite-plugin-pikacss

If you were using `@pikacss/vite-plugin-pikacss`, you can migrate to `@pikacss/unplugin-pikacss/vite`:

```diff
- import PikaCSSPlugin from '@pikacss/vite-plugin-pikacss'
+ import PikaCSSPlugin from '@pikacss/unplugin-pikacss/vite'
```

The API is fully compatible.

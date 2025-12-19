# Integrations

PikaCSS supports a wide range of build tools via `unplugin`.

> **Note**: `@pikacss/vite-pikacss` is **deprecated**. Use the unplugin subpath exports instead.

## Vite
```typescript
// vite.config.ts
import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [PikaCSS()]
})
```

## Nuxt
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	modules: ['@pikacss/nuxt-pikacss']
})
```

```javascript
// pika.config.js (for Nuxt)
import { defineEngineConfig } from '@pikacss/nuxt-pikacss'

export default defineEngineConfig({
	// Your configuration
})
```

## Webpack
```javascript
// webpack.config.mjs
import PikaCSS from '@pikacss/unplugin-pikacss/webpack'

export default {
	plugins: [PikaCSS()]
}
```

## Rspack
```javascript
// rspack.config.mjs
import PikaCSS from '@pikacss/unplugin-pikacss/rspack'

export default {
	plugins: [PikaCSS()]
}
```

## Esbuild
```javascript
// build.mjs
import PikaCSS from '@pikacss/unplugin-pikacss/esbuild'
import { build } from 'esbuild'

build({
	plugins: [PikaCSS()]
})
```

## Farm
```typescript
import { defineConfig } from '@farmfe/core'
// farm.config.ts
import PikaCSS from '@pikacss/unplugin-pikacss/farm'

export default defineConfig({
	plugins: [PikaCSS()]
})
```

## Rolldown
```javascript
// rolldown.config.mjs
import PikaCSS from '@pikacss/unplugin-pikacss/rolldown'

export default {
	plugins: [PikaCSS()]
}
```

## Common Configuration

All integrations use the same config file (`pika.config.ts`):

```typescript
// pika.config.ts
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	prefix: '',
	plugins: [],
	shortcuts: [],
	selectors: {},
	variables: {},
	keyframes: [],
	preflights: []
})
```

## Build Plugin Options

Pass options to the bundler plugin:

```typescript
PikaCSS({
	// File scanning
	scan: {
		include: ['**/*.{js,ts,jsx,tsx,vue,svelte}'],
		exclude: ['node_modules/**']
	},

	// Config file path (default: 'pika.config.ts')
	config: './pika.config.ts',

	// Auto-create config if missing (default: true)
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

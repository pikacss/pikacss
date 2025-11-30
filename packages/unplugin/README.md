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
	 * Patterns of files to be transformed if they are matched.
	 * @default `['**\/*.vue', '**\/*.tsx', '**\/*.jsx']`
	 */
	target?: string[]

	/**
	 * Configure the pika engine.
	 */
	config?: EngineConfig | string

	/**
	 * Customize the name of the pika function.
	 * @default 'pika'
	 */
	fnName?: string

	/**
	 * Decide the format of the transformed result.
	 *
	 * - `string`: The transformed result will be a js string (e.g. `'a b c'`).
	 * - `array`: The transformed result will be a js array (e.g. `['a', 'b', 'c']`).
	 * - `inline`: The transformed result will be directly used in the code (e.g. `a b c`).
	 *
	 * @default 'string'
	 */
	transformedFormat?: 'string' | 'array' | 'inline'

	/**
	 * Enable/disable the generation of d.ts files.
	 * If a string is provided, it will be used as the path to the d.ts file.
	 * @default true
	 */
	tsCodegen?: boolean | string

	/**
	 * Path to the dev css file.
	 * @default 'pika.dev.css'
	 */
	devCss?: string

	/**
	 * Automatically create a pika config file if it doesn't exist and without inline config.
	 * @default true
	 */
	autoCreateConfig?: boolean
}
```

## Migration from @pikacss/vite-plugin-pikacss

If you were using `@pikacss/vite-plugin-pikacss`, you can migrate to `@pikacss/unplugin-pikacss/vite`:

```diff
- import PikaCSSPlugin from '@pikacss/vite-plugin-pikacss'
+ import PikaCSSPlugin from '@pikacss/unplugin-pikacss/vite'
```

The API is fully compatible.

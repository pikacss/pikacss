import type { EngineConfig, IntegrationContextOptions, Nullish } from '@pikacss/integration'

/**
 * User-facing configuration options for the PikaCSS bundler plugin.
 *
 * @remarks
 * Passed to the unplugin factory when creating a Vite, webpack, Rollup, or esbuild plugin.
 * All properties are optional — sensible defaults are applied for zero-config setups.
 *
 * @example
 * ```ts
 * import pika from '@pikacss/unplugin-pikacss/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     pika({
 *       config: './pika.config.ts',
 *       fnName: 'css',
 *       transformedFormat: 'array',
 *     }),
 *   ],
 * })
 * ```
 */
export interface PluginOptions {
	/**
	 * Explicit working directory for resolving config files, codegen output paths, and source
	 * scanning globs. When set, overrides the bundler-detected project root.
	 *
	 * @remarks
	 * Resolution priority: `cwd` option → bundler root (e.g., Vite `root`, webpack `context`) → `process.cwd()`.
	 *
	 * @default `undefined` (use bundler-detected root)
	 */
	cwd?: string

	/**
	 * Glob patterns controlling which source files are scanned for `pika()` calls.
	 *
	 * @default `{ include: ['**\/*.{js,ts,jsx,tsx,vue,svelte,astro,html,htm}'], exclude: ['node_modules/**', 'dist/**'] }`
	 */
	scan?: {
		/**
		 * File glob patterns to scan. Supports a single string or array of strings.
		 * When omitted, the default covers the JS family plus every supported markup
		 * extension (the built-in markup defaults merged with `markupExtensions`).
		 * An explicit value wins verbatim and is not extended by `markupExtensions`.
		 * @default ['**\/*.{js,ts,jsx,tsx,vue,svelte,astro,html,htm}']
		 */
		include?: string | string[]
		/**
		 * File glob patterns to exclude. Supports a single string or array of strings.
		 * @default ['node_modules/**', 'dist/**']
		 */
		exclude?: string | string[]
	}

	/**
	 * Engine configuration object or a path to a `pika.config.*` file. When omitted, the plugin
	 * auto-discovers a config file in the project root.
	 *
	 * @default `undefined` (auto-discover)
	 */
	config?: EngineConfig | string

	/**
	 * When `true`, automatically scaffolds a default `pika.config.js` file if no existing config is found.
	 *
	 * @default `true`
	 */
	autoCreateConfig?: boolean

	/**
	 * Base function name to recognize in source code. All variants (`.str`, `.arr`, preview) are
	 * derived from this name.
	 *
	 * @default `'pika'`
	 */
	fnName?: string

	/**
	 * Additional file extensions (leading dots optional) whose sources are scanned in markup
	 * mode. Markup files' top-level syntax is not JavaScript — `pika()` calls live inside
	 * quoted template attributes (e.g., `:class="pika({...})"` in Vue SFCs) — so string and
	 * comment detection works differently there. Extensions listed here are merged with the
	 * built-in defaults `['vue', 'svelte', 'astro', 'html', 'htm']`; pass `['riot']` to also
	 * scan `.riot` files in markup mode. When `scan.include` is not set, the default include
	 * glob is extended with these extensions too, so the files are actually selected for
	 * scanning without further configuration.
	 *
	 * @default `undefined` (built-in defaults only)
	 */
	markupExtensions?: string[]

	/**
	 * Default output format for normal `pika()` calls. `'string'` produces a space-joined class string;
	 * `'array'` produces a string array of class names.
	 *
	 * @default `'string'`
	 */
	transformedFormat?: 'string' | 'array'

	/**
	 * Controls TypeScript declaration codegen. `true` writes to `'pika.gen.ts'`, a string sets a custom
	 * output path, and `false` disables codegen entirely.
	 *
	 * @default `true`
	 */
	tsCodegen?: boolean | string

	/**
	 * Controls CSS output file generation. `true` writes to `'pika.gen.css'`; a string sets a custom
	 * output path.
	 *
	 * @default `true`
	 */
	cssCodegen?: true | string

	/**
	 * npm package name of the plugin consumer, embedded in generated file headers and import paths.
	 * Override when wrapping the unplugin in a framework-specific package (e.g., `@pikacss/nuxt`).
	 *
	 * @default `'@pikacss/unplugin-pikacss'`
	 */
	currentPackageName?: string
}

/**
 * Normalized plugin configuration with all defaults applied and boolean shorthands expanded.
 *
 * @remarks
 * Produced internally by the unplugin factory from `PluginOptions`. Consumers should not
 * construct this type directly — it exists so that internal helpers receive fully resolved,
 * non-optional values.
 */
export interface ResolvedPluginOptions {
	/** npm package name of the integration consumer, used in generated file headers and import paths. */
	currentPackageName: string
	/** Engine configuration object, a path to a config file, or `null`/`undefined` for auto-discovery. */
	configOrPath: EngineConfig | string | Nullish
	/** Resolved TypeScript codegen output path, or `false` when codegen is disabled. */
	tsCodegen: false | string
	/** Resolved CSS output file path (always a string after defaults are applied). */
	cssCodegen: string
	/** Normalized include/exclude glob arrays controlling source file scanning. */
	scan: IntegrationContextOptions['scan']
	/** Base function name to recognize in source transforms (e.g., `'pika'`). */
	fnName: string
	/** Additional file extensions scanned in markup mode, merged with the integration defaults. */
	markupExtensions?: string[]
	/** Default output format for normal `pika()` calls: `'string'` or `'array'`. */
	transformedFormat: 'string' | 'array'
	/** Whether to scaffold a default config file when none is found. */
	autoCreateConfig: boolean
}

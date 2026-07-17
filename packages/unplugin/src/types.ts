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
	 * @default `{ include: ['**\/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}'], exclude: ['node_modules/**', 'dist/**', '.git/**', '.nuxt/**', '.output/**', 'coverage/**'] }`
	 */
	scan?: {
		/**
		 * File glob patterns to scan. Supports a single string or array of strings.
		 * When omitted, the default covers every extension the AST compiler
		 * supports: the full JS family plus Vue SFCs. An explicit value wins verbatim.
		 * @default ['**\/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}']
		 */
		include?: string | string[]
		/**
		 * File glob patterns to exclude. Supports a single string or array of strings.
		 * The default skips dependencies, build outputs, coverage, VCS metadata, and
		 * framework build dirs (`.nuxt`/`.output`). An explicit value wins verbatim.
		 * @default ['node_modules/**', 'dist/**', '.git/**', '.nuxt/**', '.output/**', 'coverage/**']
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
	 * @remarks
	 * Defaults to `false`: a build plugin should not silently write files into the
	 * user's repository (a footgun in read-only CI, containers, and installed
	 * packages). Scaffold a config explicitly (or opt back in with `true`).
	 *
	 * @default `false`
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
	 * Override when wrapping the unplugin in a framework-specific package (e.g., `@pikacss/nuxt-pikacss`).
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
	/** Default output format for normal `pika()` calls: `'string'` or `'array'`. */
	transformedFormat: 'string' | 'array'
	/** Whether to scaffold a default config file when none is found. */
	autoCreateConfig: boolean
}

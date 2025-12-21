import type { EngineConfig, IntegrationContextOptions, Nullish } from '@pikacss/integration'

export interface PluginOptions {
	/**
	 * Specify file patterns to scan for detecting pika() function calls and generating atomic styles.
	 *
	 * Default values:
	 * - `include`: `['**\/*.{js,ts,jsx,tsx,vue}']` - Scans all JS/TS/Vue files by default
	 * - `exclude`: `['node_modules/**']` - Excludes node_modules by default
	 * @example
	 * scan: {
	 *   include: ['src/**\/{*.ts,*.tsx,*.vue}'],
	 *   exclude: ['node_modules/**', 'dist/**']
	 * }
	 */
	scan?: {
		/**
		 * File glob patterns to scan. Supports a single string or array of strings.
		 * @default ['**\/*.{js,ts,jsx,tsx,vue}']
		 */
		include?: string | string[]
		/**
		 * File glob patterns to exclude. Supports a single string or array of strings.
		 * @default ['node_modules/**', 'dist/**']
		 */
		exclude?: string | string[]
	}

	/**
	 * Configuration object or path to a configuration file for the PikaCSS engine.
	 * Can pass a config object directly to define engine options, or a config file path (e.g., 'pika.config.ts').
	 *
	 * Behavior:
	 * - If a file path is specified but the file doesn't exist and autoCreateConfig is true, a config file will be generated at the specified path.
	 * - If an inline config object is passed, autoCreateConfig will be ignored.
	 * - If not provided and autoCreateConfig is true, a default config file will be created.
	 * @example
	 * config: { prefix: 'pika-', defaultSelector: '.%' }
	 * // or
	 * config: './pika.config.ts'
	 */
	config?: EngineConfig | string

	/**
	 * Whether to automatically create a configuration file when needed.
	 *
	 * Behavior:
	 * - If config is not provided: Creates a default 'pika.config.ts' in the project root.
	 * - If config is a file path that doesn't exist: Creates a config file at the specified path.
	 * - If config is an inline config object: This option is ignored (no file will be created).
	 * @default true
	 */
	autoCreateConfig?: boolean

	/**
	 * The name of the PikaCSS function in source code. Used to identify function calls that need to be transformed.
	 * @default 'pika'
	 * @example
	 * fnName: 'classname' // Transform classname() function calls to atomic styles
	 */
	fnName?: string

	/**
	 * The format of the generated atomic style class names.
	 * - `'string'`: Returns a space-separated string of class names (e.g., "a b c")
	 * - `'array'`: Returns an array of class names (e.g., ['a', 'b', 'c'])
	 * - `'inline'`: Returns an object format that can be directly used in style objects
	 * @default 'string'
	 */
	transformedFormat?: 'string' | 'array' | 'inline'

	/**
	 * Configuration for TypeScript code generation file.
	 * - `true`: Auto-generate as 'pika.gen.ts'
	 * - string: Use the specified file path
	 * - `false`: Disable TypeScript code generation
	 * The generated TypeScript file provides type hints and auto-completion support.
	 * @default true
	 * @example
	 * tsCodegen: 'src/pika.gen.ts' // Generate to a custom location
	 */
	tsCodegen?: boolean | string

	/**
	 * Configuration for CSS code generation file.
	 * - `true`: Auto-generate as 'pika.gen.css'
	 * - string: Use the specified file path
	 * The generated CSS file contains all scanned atomic styles.
	 * @default true
	 * @example
	 * cssCodegen: 'src/styles/generated.css' // Generate to a custom location
	 */
	cssCodegen?: true | string

	/** @internal */
	currentPackageName?: string
}

export interface ResolvedPluginOptions {
	currentPackageName: string
	configOrPath: EngineConfig | string | Nullish
	tsCodegen: false | string
	cssCodegen: string
	scan: IntegrationContextOptions['scan']
	fnName: string
	transformedFormat: 'string' | 'array' | 'inline'
	autoCreateConfig: boolean
}

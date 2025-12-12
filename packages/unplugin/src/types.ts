import type { EngineConfig, IntegrationContext, IntegrationContextOptions, Nullish } from '@pikacss/integration'

export interface PluginOptions {
	/**
	 * Patterns of files to be transformed if they are matched.
	 * @default ['**‎/*.vue', '**‎/*.tsx', '**‎/*.jsx']
	 */
	target?: string[]

	/**
	 * Scan patterns for usage collection.
	 * @default { patterns: ['**‎/*.vue', '**‎/*.tsx', '**‎/*.jsx'] }
	 */
	scan?: {
		patterns?: string[]
		options?: IntegrationContextOptions['scan']['options']
	}

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
	 * Enable/disable the ts codegen.
	 * If a string is provided, it will be used as the path to the generated ts file.
	 * Default path is `<path to config>/pika.gen.ts`.
	 * @default true
	 */
	tsCodegen?: boolean | string

	/**
	 * Enable the css codegen.
	 * If a string is provided, it will be used as the path to the generated css file.
	 * Default path is `<path to config>/pika.gen.css`.
	 * @default true
	 */
	cssCodegen?: true | string

	/**
	 * Automatically create a pika config file if it doesn't exist and without inline config.
	 *
	 * @default true
	 */
	autoCreateConfig?: boolean

	/** @internal */
	currentPackageName?: string

	onContextCreated?: (ctx: IntegrationContext) => void
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

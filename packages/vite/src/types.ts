import type { EngineConfig } from '@styocss/integration'

export interface PluginOptions {
	/**
	 * Patterns of files to be transformed if they are matched.
	 * @default ['**‎/*.vue', '**‎/*.tsx', '**‎/*.jsx']
	 */
	target?: string[]

	/**
	 * Configure the styo engine.
	 */
	config?: EngineConfig | string

	/**
	 * Customize the name of the styo function.
	 * @default 'styo'
	 */
	fnName?: string

	/**
	 * Enable/disable the preview mode.
	 * @default true
	 */
	previewEnabled?: boolean

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
	 * Default path is `<path to vite config>/styo.d.ts`.
	 * @default false
	 */
	dts?: boolean | string

	devCss?: string | null

	/** @internal */
	currentPackageName?: string
}

export interface ResolvedPluginOptions {
	currentPackageName: string
	configOrPath: EngineConfig | string | undefined
	dts: false | string
	devCss: string | null | undefined
	target: string[]
	fnName: string
	previewEnabled: boolean
	transformedFormat: 'string' | 'array' | 'inline'
	transformTsToJs: (tsCode: string) => Promise<string> | string
}

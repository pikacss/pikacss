import type { ESLint, Linter } from 'eslint'
import { rules } from './rules'

/**
 * Options accepted by the PikaCSS ESLint configuration factory functions.
 *
 * @remarks
 * Pass these options to `recommended()` or the default export to customise
 * which base function name the rules match. When omitted, all rules default
 * to detecting `pika`.
 *
 * @example
 * ```ts
 * import pikacss from '@pikacss/eslint-config'
 * export default [pikacss({ fnName: 'css' })]
 * ```
 */
export interface PikacssConfigOptions {
	/**
	 * Base PikaCSS function name the rules should detect.
	 *
	 * @default `'pika'`
	 */
	fnName?: string
}

/**
 * ESLint plugin object exposing all PikaCSS rules.
 *
 * @remarks
 * Register this plugin under the `pikacss` namespace in your ESLint flat
 * config. In most cases you should use the `recommended()` preset instead
 * of wiring rules manually.
 *
 * @example
 * ```ts
 * import { plugin } from '@pikacss/eslint-config'
 * export default [{ plugins: { pikacss: plugin } }]
 * ```
 */
export const plugin: ESLint.Plugin = {
	meta: {
		name: '@pikacss/eslint-config',
		version: '1.0.0',
	},
	rules,
}

/**
 * Returns the recommended PikaCSS ESLint flat-config object with all rules enabled at error level.
 *
 * @param options - Configuration options to customise which function name the rules detect.
 * @returns A flat-config entry with the PikaCSS plugin registered and all recommended rules enabled.
 *
 * @remarks
 * This is the preferred way to add PikaCSS linting to a project. It registers
 * the plugin under the `pikacss` namespace and turns on `no-dynamic-args` at
 * `'error'` severity.
 *
 * @example
 * ```ts
 * import { recommended } from '@pikacss/eslint-config'
 * export default [recommended()]
 * ```
 */
export function recommended(options?: PikacssConfigOptions): Linter.Config {
	return {
		plugins: {
			pikacss: plugin,
		},
		rules: {
			'pikacss/no-dynamic-args': ['error', { fnName: options?.fnName ?? 'pika' }],
		},
	}
}

/**
 * Default export that returns the recommended PikaCSS ESLint flat-config.
 *
 * @param options - Configuration options to customise which function name the rules detect.
 * @returns A flat-config entry identical to what `recommended()` produces.
 *
 * @remarks
 * This is a convenience alias for `recommended()` so consumers can write a
 * simple default import.
 *
 * @example
 * ```ts
 * import pikacss from '@pikacss/eslint-config'
 * export default [pikacss()]
 * ```
 */
export default function pikacss(options?: PikacssConfigOptions): Linter.Config {
	return recommended(options)
}

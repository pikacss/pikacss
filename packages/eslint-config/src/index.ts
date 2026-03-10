import type { ESLint, Linter } from 'eslint'
import { rules } from './rules'

/**
 * Options for configuring PikaCSS ESLint rules.
 */
export interface PikacssConfigOptions {
	/**
	 * The base function name to detect (default: 'pika').
	 * All variants (pika, pika.str, pikap, etc.) are automatically derived.
	 */
	fnName?: string
}

/**
 * The ESLint plugin object containing all PikaCSS rules.
 * Use this when you need fine-grained control over configuration.
 */
export const plugin: ESLint.Plugin = {
	meta: {
		name: '@pikacss/eslint-config',
		version: '1.0.0',
	},
	rules,
}

/**
 * Create a recommended ESLint configuration for PikaCSS.
 * This enables the `no-dynamic-args` rule to enforce the predictable static
 * subset recommended for build-time transforms.
 *
 * @param options - Configuration options
 * @returns An ESLint flat config object
 *
 * @example
 * ```js
 * import { recommended } from '@pikacss/eslint-config'
 *
 * export default [
 *   recommended(),
 * ]
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
 * Create a PikaCSS ESLint configuration (default export).
 * This is an alias for `recommended()` for convenience.
 *
 * @param options - Configuration options
 * @returns An ESLint flat config object
 *
 * @example
 * ```js
 * import pikacss from '@pikacss/eslint-config'
 *
 * export default [
 *   pikacss(),
 * ]
 * ```
 */
export default function pikacss(options?: PikacssConfigOptions): Linter.Config {
	return recommended(options)
}

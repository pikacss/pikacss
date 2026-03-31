import type { Keyframes } from './internal/plugins/keyframes'
import type { Selector } from './internal/plugins/selectors'
import type { Shortcut } from './internal/plugins/shortcuts'
import type { VariablesDefinition } from './internal/plugins/variables'
import type { Preflight } from './internal/types'
import type { StyleDefinition } from './types'

/* c8 ignore start */
export {
	createEngine,
	type Engine,
	sortLayerNames,
} from './internal/engine'

export {
	defineEnginePlugin,
	type EnginePlugin,
} from './internal/plugin'

export type * from './internal/plugins/important'
export type * from './internal/plugins/keyframes'
export type * from './internal/plugins/selectors'
export type * from './internal/plugins/shortcuts'
export type * from './internal/plugins/variables'

export type {
	AutocompleteConfig,
	AutocompleteContribution,
	AutocompletePatternsConfig,
	CSSStyleBlockBody,
	CSSStyleBlocks,
	DefineAutocomplete,
	EngineConfig,
	PikaAugment,
	Preflight,
	PreflightDefinition,
	PreflightFn,
	ResolvedLayerName,
	ResolvedPreflight,
} from './internal/types'

export type * from './internal/types/utils'

export {
	appendAutocomplete,
	createLogger,
	log,
	renderCSSStyleBlocks,
} from './internal/utils'

export type {
	CSSProperty,
	CSSSelector,
	Properties,
	PropertyValue,
	StyleDefinition,
	StyleDefinitionMap,
	StyleItem,
} from './types'

// define* functions
/**
 * Identity helper that returns the engine configuration as-is, providing TypeScript type inference and autocompletion.
 *
 * @typeParam T - The exact literal type of the configuration object.
 * @param config - The engine configuration object.
 * @returns The same configuration object, unchanged.
 *
 * @remarks A compile-time-only helper with no runtime effect. Useful in `pika.config.ts` files for IDE support.
 *
 * @example
 * ```ts
 * export default defineEngineConfig({ prefix: 'pk-', plugins: [myPlugin()] })
 * ```
 */
export function defineEngineConfig<const T extends EngineConfig>(config: T): T {
	return config
}

/**
 * Identity helper that returns the style definition as-is, providing TypeScript type inference and autocompletion.
 *
 * @typeParam T - The exact literal type of the style definition.
 * @param styleDefinition - A style definition object.
 * @returns The same style definition, unchanged.
 *
 * @remarks A compile-time-only helper with no runtime effect. Useful for extracting a reusable style definition with full type safety.
 *
 * @example
 * ```ts
 * const card = defineStyleDefinition({ padding: '1rem', borderRadius: '0.5rem' })
 * ```
 */
export function defineStyleDefinition<const T extends StyleDefinition>(styleDefinition: T): T {
	return styleDefinition
}

/**
 * Identity helper that returns the preflight as-is, providing TypeScript type inference and autocompletion.
 *
 * @typeParam T - The exact literal type of the preflight.
 * @param preflight - A preflight definition: a function, a static string/object, or a wrapper with `layer`/`id` metadata.
 * @returns The same preflight, unchanged.
 *
 * @remarks A compile-time-only helper with no runtime effect. Useful for defining reusable preflight values with type safety.
 *
 * @example
 * ```ts
 * const reset = definePreflight('*, *::before { box-sizing: border-box; }')
 * ```
 */
export function definePreflight<const T extends Preflight>(preflight: T): T {
	return preflight
}

/**
 * Identity helper that returns the keyframes definition as-is, providing TypeScript type inference and autocompletion.
 *
 * @typeParam T - The exact literal type of the keyframes configuration.
 * @param keyframes - A keyframes definition: a name string, a tuple, or an object form.
 * @returns The same keyframes definition, unchanged.
 *
 * @remarks A compile-time-only helper with no runtime effect.
 *
 * @example
 * ```ts
 * const spin = defineKeyframes(['spin', { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }])
 * ```
 */
export function defineKeyframes<const T extends Keyframes>(keyframes: T): T {
	return keyframes
}

/**
 * Identity helper that returns the selector definition as-is, providing TypeScript type inference and autocompletion.
 *
 * @typeParam T - The exact literal type of the selector configuration.
 * @param selector - A selector definition: a string redirect, tuple, or object form.
 * @returns The same selector definition, unchanged.
 *
 * @remarks A compile-time-only helper with no runtime effect.
 *
 * @example
 * ```ts
 * const hover = defineSelector(['hover', '&:hover'])
 * ```
 */
export function defineSelector<const T extends Selector>(selector: T): T {
	return selector
}

/**
 * Identity helper that returns the shortcut definition as-is, providing TypeScript type inference and autocompletion.
 *
 * @typeParam T - The exact literal type of the shortcut configuration.
 * @param shortcut - A shortcut definition: a string redirect, tuple, or object form.
 * @returns The same shortcut definition, unchanged.
 *
 * @remarks A compile-time-only helper with no runtime effect.
 *
 * @example
 * ```ts
 * const btn = defineShortcut(['btn', { padding: '0.5rem 1rem', borderRadius: '0.25rem' }])
 * ```
 */
export function defineShortcut<const T extends Shortcut>(shortcut: T): T {
	return shortcut
}

/**
 * Identity helper that returns the variables definition as-is, providing TypeScript type inference and autocompletion.
 *
 * @typeParam T - The exact literal type of the variables definition.
 * @param variables - A nested record of CSS custom property definitions.
 * @returns The same variables definition, unchanged.
 *
 * @remarks A compile-time-only helper with no runtime effect.
 *
 * @example
 * ```ts
 * const vars = defineVariables({ '--color-primary': '#3b82f6', '.dark': { '--color-primary': '#60a5fa' } })
 * ```
 */
export function defineVariables<const T extends VariablesDefinition>(variables: T): T {
	return variables
}
/* c8 ignore end */

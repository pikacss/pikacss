import type { EngineConfig } from './internal/types'

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

// define* helpers
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
/* c8 ignore end */

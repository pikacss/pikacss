/* c8 ignore start */
export {
	createEngine,
	defineEngineConfig,
	type Engine,
} from './internal/engine'

export {
	defineEnginePlugin,
	type EnginePlugin,
} from './internal/plugin'

export type {
	CSSStyleBlockBody,
	CSSStyleBlocks,
	DefineAutocomplete,
	EngineConfig,
	PikaAugment,
} from './internal/types'

export type * from './internal/types/utils'

export {
	appendAutocompleteCssPropertyValues,
	appendAutocompleteExtraCssProperties,
	appendAutocompleteExtraProperties,
	appendAutocompletePropertyValues,
	appendAutocompleteSelectors,
	appendAutocompleteStyleItemStrings,
	createLogger,
	log,
	renderCSSStyleBlocks,
} from './internal/utils'

export type {
	CSSProperty,
	CSSSelectors,
	Properties,
	StyleDefinition,
	StyleItem,
} from './types'
/* c8 ignore end */

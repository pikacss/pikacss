/* c8 ignore start */
export {
	createEngine,
	type Engine,
} from './internal/engine'

export {
	defineEnginePlugin,
	type EnginePlugin,
} from './internal/plugin'

export { defineKeyframes } from './internal/plugins/keyframes'
export { defineSelector } from './internal/plugins/selectors'
export { defineShortcut } from './internal/plugins/shortcuts'
export { defineVariables } from './internal/plugins/variables'

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
	defineEngineConfig,
	definePreflight,
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

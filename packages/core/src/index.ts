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

// define* functions
export function defineEngineConfig(config: EngineConfig): EngineConfig {
	return config
}

export function defineStyleDefinition(styleDefinition: StyleDefinition): StyleDefinition {
	return styleDefinition
}

export function definePreflight(preflight: Preflight): Preflight {
	return preflight
}

export function defineKeyframes(keyframes: Keyframes): Keyframes {
	return keyframes
}

export function defineSelector(selector: Selector): Selector {
	return selector
}

export function defineShortcut(shortcut: Shortcut): Shortcut {
	return shortcut
}

export function defineVariables(variables: VariablesDefinition): VariablesDefinition {
	return variables
}
/* c8 ignore end */

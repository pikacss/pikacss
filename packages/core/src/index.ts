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
	CSSSelector,
	Properties,
	PropertyValue,
	StyleDefinition,
	StyleDefinitionMap,
	StyleItem,
} from './types'

// define* functions
export function defineEngineConfig<const T extends EngineConfig>(config: T): T {
	return config
}

export function defineStyleDefinition<const T extends StyleDefinition>(styleDefinition: T): T {
	return styleDefinition
}

export function definePreflight<const T extends Preflight>(preflight: T): T {
	return preflight
}

export function defineKeyframes<const T extends Keyframes>(keyframes: T): T {
	return keyframes
}

export function defineSelector<const T extends Selector>(selector: T): T {
	return selector
}

export function defineShortcut<const T extends Shortcut>(shortcut: T): T {
	return shortcut
}

export function defineVariables<const T extends VariablesDefinition>(variables: T): T {
	return variables
}
/* c8 ignore end */

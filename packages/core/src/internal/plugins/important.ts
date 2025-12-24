import type { InternalPropertyValue, InternalStyleDefinition, Nullish } from '../types'
import { defineEnginePlugin } from '../plugin'
import { isPropertyValue } from '../utils'

// #region ImportantConfig
interface ImportantConfig {
	default?: boolean
}
// #endregion ImportantConfig

declare module '@pikacss/core' {
	interface EngineConfig {
		important?: ImportantConfig
	}
}

function modifyPropertyValue(value: InternalPropertyValue): InternalPropertyValue {
	if (value == null)
		return null

	if (Array.isArray(value)) {
		return [`${value[0]} !important`, value[1].map(i => `${i} !important`)]
	}

	return `${value} !important`
}

export function important() {
	let defaultValue: boolean
	return defineEnginePlugin({
		name: 'core:important',

		rawConfigConfigured(config) {
			defaultValue = config.important?.default ?? false
		},
		configureEngine(engine) {
			engine.appendAutocompleteExtraProperties('__important')
			engine.appendAutocompletePropertyValues('__important', 'boolean')
		},
		transformStyleDefinitions(styleDefinitions) {
			return styleDefinitions.map<InternalStyleDefinition>((styleDefinition) => {
				const { __important, ...rest } = styleDefinition
				const value = __important as boolean | Nullish
				const important = value == null ? defaultValue : value

				if (important === false)
					return rest

				return Object.fromEntries(
					Object.entries(rest)
						.map(([k, v]) => {
							if (isPropertyValue(v)) {
								return [k, modifyPropertyValue(v)]
							}

							return [k, v]
						}),
				)
			})
		},
	})
}

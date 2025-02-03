import { defineEnginePlugin } from '../../engine/plugin'
import { appendAutocompleteExtraProperties, appendAutocompletePropertyValues } from '../../helpers'
import type { _StyleDefinition } from '../../types'
import { isPropertyValue } from '../../utils'

export interface ImportantConfig {
	default?: boolean
}

export function important() {
	let _default: boolean
	return defineEnginePlugin<{
		important?: ImportantConfig
	}>([
		{
			name: 'core:important:post',
			enforce: 'post',

			config(config) {
				_default = config.important?.default ?? false
			},
			configResolved(resolvedConfig) {
				appendAutocompleteExtraProperties(resolvedConfig, '$important')
				appendAutocompletePropertyValues(resolvedConfig, '$important', 'boolean')
			},
		},
		{
			name: 'core:important:transform',
			transformStyleDefinitions(styleDefinitions) {
				return styleDefinitions.map<_StyleDefinition>((styleDefinition) => {
					const { $important, ...rest } = styleDefinition
					const important = ($important as boolean | undefined) || _default

					if (important === false)
						return rest

					return Object.fromEntries(
						Object.entries(rest)
							.map(([k, v]) => {
								if (isPropertyValue(v) === false || v == null)
									return [k, v]

								const modified = [v].flat(1).map(v => `${v} !important`)

								return [k, modified]
							}),
					)
				})
			},
		},
	])
}

import type { InternalPropertyValue, InternalStyleDefinition, Nullish } from '../types'
import { defineEnginePlugin } from '../plugin'
import { isPropertyValue } from '../utils'

interface ImportantConfig {
	default?: boolean
}

declare module '@pikacss/core' {
	interface EngineConfig {
		/**
		 * Controls the `!important` modifier on generated CSS declarations.
		 *
		 * @default undefined (no `!important` appended by default)
		 */
		important?: ImportantConfig
	}
}

function appendImportant(v: string): string {
	return v.endsWith('!important') ? v : `${v} !important`
}

function modifyPropertyValue(value: InternalPropertyValue): InternalPropertyValue {
	if (value == null)
		return null

	if (Array.isArray(value)) {
		return [appendImportant(value[0]), value[1].map(i => appendImportant(i))]
	}

	return appendImportant(value)
}

/**
 * Built-in engine plugin that appends `!important` to generated CSS declarations.
 *
 * @returns An `EnginePlugin` that intercepts `transformStyleDefinitions` to conditionally append `!important` to every property value.
 *
 * @remarks When `EngineConfig.important.default` is `true`, all property values receive `!important` unless the style definition explicitly sets `__important: false`. Individual style definitions can also opt-in with `__important: true` regardless of the default.
 *
 * @example
 * ```ts
 * createEngine({ plugins: [important()] })
 * ```
 */
export function important() {
	let defaultValue: boolean
	return defineEnginePlugin({
		name: 'core:important',

		rawConfigConfigured(config) {
			defaultValue = config.important?.default ?? false
		},
		configureEngine(engine) {
			engine.appendAutocomplete({
				extraProperties: '__important',
				properties: { __important: 'boolean' },
			})
		},
		transformStyleDefinitions(styleDefinitions) {
			return styleDefinitions.map<InternalStyleDefinition>((styleDefinition) => {
				const { __important, ...rest } = styleDefinition as Record<string, unknown> & { __important?: boolean | Nullish }
				const value = __important
				const important = value == null ? defaultValue : value

				if (important === false)
					return rest as InternalStyleDefinition

				return Object.fromEntries(
					Object.entries(rest)
						.map(([k, v]) => {
							if (isPropertyValue(v)) {
								return [k, modifyPropertyValue(v)]
							}

							return [k, v]
						}) as any,
				) as InternalStyleDefinition
			})
		},
	})
}

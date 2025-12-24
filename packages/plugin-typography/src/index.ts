import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'
import { proseBaseStyle, typographyVariables } from './styles'

export interface TypographyPluginOptions {
	/**
	 * Custom variables to override the default typography variables.
	 */
	variables?: Partial<typeof typographyVariables>

	/**
	 *
	 */
}

declare module '@pikacss/core' {
	interface EngineConfig {
		typography?: TypographyPluginOptions
	}
}

export function createTypographyPlugin(options: TypographyPluginOptions = {}): EnginePlugin {
	return defineEnginePlugin({
		name: 'typography',
		configureEngine: async (engine) => {
			// Add variables
			engine.variables.add({
				...typographyVariables,
				...options.variables,
			})

			// Add shortcuts
			engine.shortcuts.add([
				'prose',
				proseBaseStyle,
			])

			// Add size modifiers
			const sizes = {
				'sm': { fontSize: '0.875rem', lineHeight: '1.71' },
				'lg': { fontSize: '1.125rem', lineHeight: '1.77' },
				'xl': { fontSize: '1.25rem', lineHeight: '1.8' },
				'2xl': { fontSize: '1.5rem', lineHeight: '1.66' },
			}

			Object.entries(sizes)
				.forEach(([size, overrides]) => {
					engine.shortcuts.add([
						`prose-${size}`,
						[
							'prose',
							overrides,
						],
					])
				})
		},
	})
}

import type { EnginePlugin, VariablesDefinition } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'
import { proseBaseStyle, typographyVariables } from './styles'

export interface TypographyPluginOptions {
	/**
	 * Custom variables to override the default typography variables.
	 */
	variables?: VariablesDefinition
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
				'base': { fontSize: '1rem', lineHeight: '1.75' },
				'lg': { fontSize: '1.125rem', lineHeight: '1.77' },
				'xl': { fontSize: '1.25rem', lineHeight: '1.8' },
				'2xl': { fontSize: '1.5rem', lineHeight: '1.66' },
			}

			Object.entries(sizes)
				.forEach(([size, style]) => {
					engine.shortcuts.add([
						`prose-${size}`,
						style,
					])
				})

			// Add invert modifier
			engine.shortcuts.add([
				'prose-invert',
				{
					'--pk-prose-body': 'var(--pk-prose-invert-body, #d1d5db)',
					'--pk-prose-headings': 'var(--pk-prose-invert-headings, #fff)',
					'--pk-prose-links': 'var(--pk-prose-invert-links, #fff)',
					'--pk-prose-bold': 'var(--pk-prose-invert-bold, #fff)',
					'--pk-prose-counters': 'var(--pk-prose-invert-counters, #9ca3af)',
					'--pk-prose-bullets': 'var(--pk-prose-invert-bullets, #4b5563)',
					'--pk-prose-hr': 'var(--pk-prose-invert-hr, #374151)',
					'--pk-prose-quotes': 'var(--pk-prose-invert-quotes, #f3f4f6)',
					'--pk-prose-captions': 'var(--pk-prose-invert-captions, #9ca3af)',
					'--pk-prose-code': 'var(--pk-prose-invert-code, #fff)',
					'--pk-prose-pre-code': 'var(--pk-prose-invert-pre-code, #d1d5db)',
					'--pk-prose-pre-bg': 'var(--pk-prose-invert-pre-bg, rgb(0 0 0 / 50%))',
					'--pk-prose-th-borders': 'var(--pk-prose-invert-th-borders, #4b5563)',
					'--pk-prose-td-borders': 'var(--pk-prose-invert-td-borders, #374151)',
				},
			])
		},
	})
}

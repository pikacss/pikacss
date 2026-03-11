import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',
	configureEngine: async (engine) => {
		engine.appendAutocomplete({
			selectors: ['hover', 'focus', 'dark'],
			styleItemStrings: ['flex-center', 'btn-primary'],
			extraProperties: '__shortcut',
			extraCssProperties: ['--my-color', '--my-size'],
			properties: {
				__shortcut: '(string & {})',
			},
			cssProperties: {
				display: ['flex', 'grid', 'block'],
			},
			patterns: {
				styleItemStrings: '`i-${string}:${string}`',
			},
		})
	},
})

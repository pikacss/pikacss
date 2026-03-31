import { defineEnginePlugin } from '@pikacss/core'

export const myPlugin = defineEnginePlugin({
	name: 'my-plugin',
	configureRawConfig: (config) => {
		config.layers ??= {}
		config.layers['my-layer'] = 5
	},
	configureEngine: async (engine) => {
		engine.addPreflight('/* my-plugin preflight */')
	},
})

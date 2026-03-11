import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',
	configureEngine: async (engine) => {
		// 讓 top-level @import rules 保持在 preflight blocks 之外。
		engine.appendCssImport('@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");')

		engine.addPreflight({
			':root': {
				fontFamily: '"Inter", system-ui, sans-serif',
			},
		})
	},
})

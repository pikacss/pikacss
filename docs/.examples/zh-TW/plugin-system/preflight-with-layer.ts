import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',
	configureEngine: async (engine) => {
		// 用 { layer, preflight } 包住任一 preflight 變體，就能把它放進 CSS @layer

		// 放在 layer 裡的字串 preflight
		engine.addPreflight({
			layer: 'base',
			preflight: 'body { margin: 0; box-sizing: border-box; }',
		})

		// 放在 layer 裡的 PreflightDefinition
		engine.addPreflight({
			layer: 'base',
			preflight: {
				':root': {
					'--color-primary': '#3b82f6',
				},
			},
		})

		// 放在 layer 裡的 PreflightFn
		engine.addPreflight({
			layer: 'base',
			preflight: (engine, isFormatted) => {
				return isFormatted
					? '* {\n  box-sizing: border-box;\n}'
					: '*{box-sizing:border-box}'
			},
		})
	},
})

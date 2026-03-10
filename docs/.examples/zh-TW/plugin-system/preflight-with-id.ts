import type { PreflightDefinition } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',
	configureEngine: async (engine) => {
		// WithId：指定一個 id，讓其他 plugins 或 engine 可以辨識
		// 並在多次註冊時對這份 preflight 進行去重。

		// 帶有 id 的字串 preflight
		engine.addPreflight({
			id: 'example:box-sizing',
			preflight: '*, *::before, *::after { box-sizing: border-box; }',
		})

		// 帶有 id 的 PreflightDefinition
		const rootVars: PreflightDefinition = {
			':root': {
				'--brand-color': '#3b82f6',
				'--brand-color-dark': '#1d4ed8',
			},
		}
		engine.addPreflight({
			id: 'example:root-vars',
			preflight: rootVars,
		})
	},
})

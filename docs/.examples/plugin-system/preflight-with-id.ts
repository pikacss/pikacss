import type { PreflightDefinition } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',
	configureEngine: async (engine) => {
		// WithId — assign an id so other plugins or the engine can identify
		// and deduplicate this preflight across multiple registrations.

		// String preflight with id
		engine.addPreflight({
			id: 'example:box-sizing',
			preflight: '*, *::before, *::after { box-sizing: border-box; }',
		})

		// PreflightDefinition with id
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

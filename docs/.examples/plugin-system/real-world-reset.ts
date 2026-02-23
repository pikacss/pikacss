import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

export type ResetStyle = 'modern-normalize' | 'eric-meyer'

// Module augmentation for config type safety
declare module '@pikacss/core' {
	interface EngineConfig {
		reset?: ResetStyle
	}
}

// Simplified version of @pikacss/plugin-reset
export function reset(): EnginePlugin {
	let style: ResetStyle = 'modern-normalize'

	return defineEnginePlugin({
		name: 'reset',
		order: 'pre', // Run before other plugins

		configureRawConfig: (config) => {
			if (config.reset) {
				style = config.reset
			}
			config.layers ??= {}
			config.layers.reset = -1
		},

		configureEngine: async (engine) => {
			// Load and inject the selected reset stylesheet
			const resetCss = await loadResetCss(style)
			engine.addPreflight({
				layer: 'reset',
				preflight: resetCss,
			})
		},
	})
}

async function loadResetCss(style: ResetStyle): Promise<string> {
	// In real code, this loads from bundled CSS files
	return `/* ${style} reset styles */`
}

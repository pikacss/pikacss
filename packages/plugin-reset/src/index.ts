import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

import andyBell from './resets/andy-bell'
import ericMeyer from './resets/eric-meyer'
import modernNormalize from './resets/modern-normalize'
import normalize from './resets/normalize'
import theNewCssReset from './resets/the-new-css-reset'

const resetStyles = {
	'andy-bell': andyBell,
	'eric-meyer': ericMeyer,
	'modern-normalize': modernNormalize,
	'normalize': normalize,
	'the-new-css-reset': theNewCssReset,
} satisfies Record<string, string>

export type ResetStyle = keyof typeof resetStyles

declare module '@pikacss/core' {
	interface EngineConfig {
		/**
		 * Reset style to use.
		 *
		 * @default 'modern-normalize'
		 */
		reset?: ResetStyle
	}
}

export function reset(): EnginePlugin {
	let style: ResetStyle = 'modern-normalize'
	return defineEnginePlugin({
		name: 'reset',
		order: 'pre',
		configureRawConfig: (config) => {
			if (config.reset)
				style = config.reset
		},
		configureEngine: async (engine) => {
			const resetCss = resetStyles[style]
			if (resetCss) {
				engine.addPreflight(resetCss)
			}
		},
	})
}

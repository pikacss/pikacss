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

/**
 * Union of built-in CSS reset stylesheet names supported by the reset plugin.
 *
 * @remarks
 * Each value maps to a well-known CSS reset: Andy Bell's modern reset,
 * Eric Meyer's classic reset, modern-normalize, normalize.css, and
 * The New CSS Reset. The chosen name is passed to the `reset` engine
 * config option to select which stylesheet is injected as a preflight.
 *
 * @example
 * ```ts
 * const style: ResetStyle = 'modern-normalize'
 * ```
 */
export type ResetStyle = keyof typeof resetStyles

declare module '@pikacss/core' {
	interface EngineConfig {
		/**
		 * CSS reset stylesheet to inject as a preflight.
		 *
		 * @default `'modern-normalize'`
		 */
		reset?: ResetStyle
	}
}

/**
 * Creates a PikaCSS engine plugin that injects a CSS reset stylesheet as a preflight.
 *
 * @returns An engine plugin that registers a reset preflight on the `reset` layer.
 *
 * @remarks
 * The plugin reads the `reset` option from the engine config to select a
 * stylesheet. If unset, it defaults to `'modern-normalize'`. A dedicated
 * `reset` layer with order `-1` is created so the reset styles always
 * appear before utility output.
 *
 * @example
 * ```ts
 * import { reset } from '@pikacss/plugin-reset'
 *
 * export default defineEngineConfig({
 *   plugins: [reset()],
 *   reset: 'eric-meyer',
 * })
 * ```
 */
export function reset(): EnginePlugin {
	let style: ResetStyle = 'modern-normalize'
	return defineEnginePlugin({
		name: 'reset',
		order: 'pre',
		configureRawConfig: (config) => {
			if (config.reset) {
				style = config.reset
			}
			config.layers ??= {}
			config.layers.reset = -1
		},
		configureEngine: async (engine) => {
			const resetCss = resetStyles[style]
			if (resetCss) {
				engine.addPreflight({
					layer: 'reset',
					preflight: resetCss,
				})
			}
		},
	})
}

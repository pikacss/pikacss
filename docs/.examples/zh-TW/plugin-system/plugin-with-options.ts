import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

export interface GreetingPluginOptions {
	/** 問候語前綴。@default 'Hello' */
	prefix?: string
}

export function greetingPlugin(
	options: GreetingPluginOptions = {},
): EnginePlugin {
	const { prefix = 'Hello' } = options

	return defineEnginePlugin({
		name: 'greeting',
		configureEngine: async (engine) => {
			// 使用 options 自訂 plugin 行為
			engine.addPreflight(
				`/* ${prefix} from greeting plugin */`,
			)
		},
	})
}

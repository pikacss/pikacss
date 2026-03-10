import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

export function myPlugin(): EnginePlugin {
	return defineEnginePlugin({
		name: 'my-plugin',
	})
}

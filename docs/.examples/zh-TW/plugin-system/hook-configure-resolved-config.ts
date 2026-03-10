import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',

	// 非同步：在 engine 建立前修改 resolved config
	configureResolvedConfig(resolvedConfig) {
		// 覆寫 resolved config 裡的 prefix
		resolvedConfig.prefix = 'x-'
		return resolvedConfig
	},
})

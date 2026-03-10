import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',

	// 非同步：在 resolution 前修改 raw config
	configureRawConfig(config) {
		// 加入預設 preflights
		config.preflights ??= []
		config.preflights.push('/* 由範例 plugin 注入 */')
		return config
	},

	// 同步：讀取最終 raw config（不可修改）
	rawConfigConfigured(config) {
		console.log('Final prefix:', config.prefix)
	},
})

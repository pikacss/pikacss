import { defineEnginePlugin } from '@pikacss/core'

export const asyncHookPlugin = defineEnginePlugin({
	name: 'async-hook-example',

	// 非同步 hook：在 raw config 被 resolved 前修改它。
	// 回傳修改後的 config，交給下一個 plugin，
	// 或回傳 void/undefined 以保留目前的值。
	configureRawConfig(config) {
		config.prefix = 'pk-'
		return config
	},

	// 非同步 hook：在樣式提取期間轉換 selectors。
	// 回傳的陣列會取代下一個 plugin 的輸入。
	transformSelectors(selectors) {
		return selectors.map(s => s.replace('$hover', '&:hover'))
	},
})
